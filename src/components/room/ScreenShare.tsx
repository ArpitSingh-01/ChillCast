import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Monitor, MonitorOff, Loader2, Users } from 'lucide-react';

// WebRTC Configuration with STUN server
const servers = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

interface ScreenShareProps {
  roomId: string;
  isHost: boolean;
  hostName: string;
  sessionId: string;
}

const ScreenShare = ({ roomId, isHost, hostName, sessionId }: ScreenShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const peerConnectionsRef = useRef(new Map<string, RTCPeerConnection>());

  // Helper to close and remove a peer connection
  const closePeerConnection = (peerId: string) => {
    console.log('[ScreenShare] Closing peer connection for:', peerId);
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
  };

  // Create and configure a new peer connection
  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    console.log('[ScreenShare] Creating peer connection for:', peerId, 'isInitiator:', isInitiator);
    
    // Check if peer connection already exists
    const existingPc = peerConnectionsRef.current.get(peerId);
    if (existingPc && existingPc.connectionState !== 'failed' && existingPc.connectionState !== 'closed') {
      console.log('[ScreenShare] Peer connection already exists for:', peerId, 'state:', existingPc.connectionState);
      return existingPc;
    }

    // Close existing failed connection
    if (existingPc) {
      existingPc.close();
    }
    
    const pc = new RTCPeerConnection(servers);
    peerConnectionsRef.current.set(peerId, pc);

    // Track if this peer has been counted
    let hasBeenCounted = false;

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log('[ScreenShare] Connection state for', peerId, ':', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsConnecting(false);
        // Increment viewer count only once per successful connection
        if (isHost && !hasBeenCounted) {
          setViewerCount(prev => prev + 1);
          hasBeenCounted = true;
        }
        if (!isHost) {
          toast.success('Connected to host\'s screen');
        }
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        console.error('[ScreenShare] Connection failed/closed for:', peerId);
        // Decrement viewer count if this peer was counted
        if (isHost && hasBeenCounted) {
          setViewerCount(prev => Math.max(0, prev - 1));
          hasBeenCounted = false;
        }
        closePeerConnection(peerId);
        if (!isHost && pc.connectionState === 'failed') {
          setIsReceiving(false);
          toast.error('Connection failed. Try refreshing the page.');
        }
      }
    };

    // Send ICE candidates to the other peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[ScreenShare] Sending ICE candidate to:', peerId);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'webrtc-candidate',
          payload: {
            candidate: event.candidate.toJSON(),
            senderId: sessionId,
            targetId: peerId,
          },
        });
      }
    };

    // If we are the host (initiator), add the screen share stream
    if (isInitiator && localStreamRef.current) {
      console.log('[ScreenShare] Adding local tracks to peer connection');
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // If we are the guest, listen for tracks and add them to the video element
    if (!isInitiator) {
      pc.ontrack = (event) => {
        console.log('[ScreenShare] Received remote track');
        if (event.streams && event.streams[0]) {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            setIsReceiving(true);
          }
        }
      };
    }

    return pc;
  };

  useEffect(() => {
    console.log('[ScreenShare] Setting up channel for room:', roomId);
    const channel = supabase.channel(`room-screen-${roomId}`);

    // Listen for DB changes
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload: any) => {
        const isSharingNow = payload.new.is_screen_sharing;
        console.log('[ScreenShare] DB update - is_screen_sharing:', isSharingNow);
        
        if (isSharingNow && !isHost) {
          console.log('[ScreenShare] Host started sharing, requesting stream');
          setIsConnecting(true);
          // Request stream from host
          channel.send({
            type: 'broadcast',
            event: 'webrtc-request-stream',
            payload: { senderId: sessionId },
          });
        } else if (!isSharingNow && (isReceiving || isConnecting)) {
          console.log('[ScreenShare] Screen sharing stopped');
          setIsReceiving(false);
          setIsConnecting(false);
          // Close all peer connections
          if (!isHost) {
            peerConnectionsRef.current.forEach((pc, peerId) => {
              closePeerConnection(peerId);
            });
            if (videoRef.current) {
              videoRef.current.srcObject = null;
            }
          }
        }
      }
    );

    // WebRTC Signaling: Guest requests stream
    channel.on('broadcast', { event: 'webrtc-request-stream' }, ({ payload }) => {
      console.log('[ScreenShare] Received stream request from:', payload.senderId);
      // I am the host, and a guest is requesting my stream
      if (isHost && localStreamRef.current && payload.senderId !== sessionId) {
        const guestId = payload.senderId;
        
        // Check if we already have a connection for this guest
        const existingPc = peerConnectionsRef.current.get(guestId);
        if (existingPc && (existingPc.connectionState === 'connected' || existingPc.connectionState === 'connecting')) {
          console.log('[ScreenShare] Already have active connection for:', guestId, 'state:', existingPc.connectionState);
          return;
        }
        
        try {
          const pc = createPeerConnection(guestId, true);
          
          // If connection already existed and was reused, don't create a new offer
          if (pc.signalingState !== 'stable') {
            console.log('[ScreenShare] Peer connection not in stable state:', pc.signalingState);
            return;
          }
          
          pc.createOffer()
            .then(offer => {
              console.log('[ScreenShare] Created offer for:', guestId);
              return pc.setLocalDescription(offer);
            })
            .then(() => {
              console.log('[ScreenShare] Sending offer to:', guestId);
              channel.send({
                type: 'broadcast',
                event: 'webrtc-offer',
                payload: {
                  sdp: pc.localDescription,
                  senderId: sessionId,
                  targetId: guestId,
                },
              });
            })
            .catch(error => {
              console.error('[ScreenShare] Error creating offer:', error);
              closePeerConnection(guestId);
            });
        } catch (error) {
          console.error('[ScreenShare] Error in request-stream handler:', error);
        }
      }
    });

    // WebRTC Signaling: Receive offer
    channel.on('broadcast', { event: 'webrtc-offer' }, ({ payload }) => {
      console.log('[ScreenShare] Received offer from:', payload.senderId, 'for:', payload.targetId);
      // I am a guest, and the host sent me an offer
      if (!isHost && payload.targetId === sessionId) {
        const hostId = payload.senderId;
        
        // Check if we already have a connection
        const existingPc = peerConnectionsRef.current.get(hostId);
        if (existingPc && existingPc.connectionState === 'connected') {
          console.log('[ScreenShare] Already connected to host, ignoring offer');
          return;
        }
        
        try {
          const pc = createPeerConnection(hostId, false);
          
          pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
            .then(() => {
              console.log('[ScreenShare] Creating answer for:', hostId);
              return pc.createAnswer();
            })
            .then(answer => pc.setLocalDescription(answer))
            .then(() => {
              console.log('[ScreenShare] Sending answer to:', hostId);
              channel.send({
                type: 'broadcast',
                event: 'webrtc-answer',
                payload: {
                  sdp: pc.localDescription,
                  senderId: sessionId,
                  targetId: hostId,
                },
              });
            })
            .catch(error => {
              console.error('[ScreenShare] Error handling offer:', error);
              closePeerConnection(hostId);
              setIsConnecting(false);
              setIsReceiving(false);
              toast.error('Failed to connect to screen share');
            });
        } catch (error) {
          console.error('[ScreenShare] Error in offer handler:', error);
          setIsConnecting(false);
          setIsReceiving(false);
        }
      }
    });

    // WebRTC Signaling: Receive answer
    channel.on('broadcast', { event: 'webrtc-answer' }, ({ payload }) => {
      console.log('[ScreenShare] Received answer from:', payload.senderId, 'for:', payload.targetId);
      // I am the host, and a guest sent me an answer
      if (isHost && payload.targetId === sessionId) {
        const pc = peerConnectionsRef.current.get(payload.senderId);
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
            .catch(error => {
              console.error('[ScreenShare] Error setting remote description:', error);
              closePeerConnection(payload.senderId);
            });
        }
      }
    });

    // WebRTC Signaling: Receive ICE candidate
    channel.on('broadcast', { event: 'webrtc-candidate' }, ({ payload }) => {
      // Both host and guest receive candidates
      if (payload.targetId === sessionId) {
        console.log('[ScreenShare] Received ICE candidate from:', payload.senderId);
        const pc = peerConnectionsRef.current.get(payload.senderId);
        if (pc && payload.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
            .catch(error => {
              console.error('[ScreenShare] Error adding ICE candidate:', error);
            });
        }
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    // Check initial state
    const checkScreenShareState = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('is_screen_sharing')
        .eq('id', roomId)
        .single();

      if (data?.is_screen_sharing && !isHost) {
        console.log('[ScreenShare] Screen sharing already active, requesting stream');
        setIsConnecting(true);
        channel.send({
          type: 'broadcast',
          event: 'webrtc-request-stream',
          payload: { senderId: sessionId },
        });
      }
    };

    checkScreenShareState();

    return () => {
      console.log('[ScreenShare] Cleanup: closing all connections');
      stopScreenShare(true);
      supabase.removeChannel(channel);
    };
  }, [roomId, isHost, sessionId]);

  // Timer for elapsed time
  useEffect(() => {
    if (isSharing || isReceiving) {
      const fetchStartTime = async () => {
        const { data } = await supabase
          .from('rooms')
          .select('screen_share_started_at')
          .eq('id', roomId)
          .single();

        if (data?.screen_share_started_at) {
          const startTime = new Date(data.screen_share_started_at).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          setElapsedTime(elapsed);

          timeUpdateIntervalRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
          }, 1000);

          // Host updates screen_share_time in DB
          if (isHost) {
            const updateInterval = setInterval(async () => {
              const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
              await supabase
                .from('rooms')
                .update({ screen_share_time: currentElapsed })
                .eq('id', roomId);
            }, 3000);

            return () => clearInterval(updateInterval);
          }
        }
      };

      fetchStartTime();
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isSharing, isReceiving, roomId, isHost]);

  const startScreenShare = async () => {
    if (!isHost) {
      toast.error('Only the host can share screen');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[ScreenShare] Requesting screen capture');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: { echoCancellation: true, noiseSuppression: true },
      } as any);

      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      console.log('[ScreenShare] Updating DB - screen sharing started');
      await supabase
        .from('rooms')
        .update({
          is_screen_sharing: true,
          screen_share_started_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      setIsSharing(true);
      toast.success('Screen sharing started');

      stream.getVideoTracks()[0].onended = () => {
        console.log('[ScreenShare] Screen share track ended');
        stopScreenShare();
      };
    } catch (error) {
      console.error('[ScreenShare] Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    } finally {
      setIsLoading(false);
    }
  };

  const stopScreenShare = async (isUnmounting = false) => {
    console.log('[ScreenShare] Stopping screen share, isUnmounting:', isUnmounting);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc, peerId) => {
      closePeerConnection(peerId);
    });

    if (isHost && (isSharing || isUnmounting)) {
      await supabase
        .from('rooms')
        .update({
          is_screen_sharing: false,
          screen_share_started_at: null,
        })
        .eq('id', roomId);

      if (!isUnmounting) {
        toast.info('Screen sharing stopped');
      }
    }

    setIsSharing(false);
    setIsReceiving(false);
    setViewerCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSharing && !isReceiving && !isConnecting) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black/10 rounded-lg p-8">
        <Monitor className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          {isHost ? 'Share Your Screen' : 'Waiting for host...'}
        </h3>
        <p className="text-muted-foreground text-center mb-6">
          {isHost
            ? 'Start sharing your screen to show content to all participants'
            : 'The host will start screen sharing when ready'}
        </p>
        {isHost && (
          <Button
            onClick={startScreenShare}
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                Start Sharing
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {isHost ? 'Sharing' : `${hostName} is sharing`}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatTime(elapsedTime)}
          </span>
          {isHost && viewerCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{viewerCount} viewer{viewerCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {isHost && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => stopScreenShare()}
            className="gap-2"
          >
            <MonitorOff className="w-4 h-4" />
            Stop Sharing
          </Button>
        )}
      </div>

      <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-[400px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isHost}
          className="w-full h-full object-contain"
        />
        {isConnecting && !isReceiving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Connecting to host's stream...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenShare;