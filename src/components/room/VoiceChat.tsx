import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceChatProps {
    roomId: string;
    nickname: string;
    sessionId: string;
}

interface PeerConnection {
    connection: RTCPeerConnection;
    audioElement: HTMLAudioElement;
    nickname: string;
}

const VoiceChat = ({ roomId, nickname, sessionId }: VoiceChatProps) => {
    const [isMuted, setIsMuted] = useState(true);
    const [isDeafened, setIsDeafened] = useState(false);
    const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
    const channelRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    const configuration: RTCConfiguration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const removePeer = useCallback((peerId: string) => {
        const peer = peerConnectionsRef.current.get(peerId);
        if (peer) {
            peer.connection.close();
            peer.audioElement.srcObject = null;
            peer.audioElement.remove();
            peerConnectionsRef.current.delete(peerId);
            setConnectedPeers(prev => prev.filter(nickname => nickname !== peer.nickname));
        }
    }, []);

    const createPeerConnection = useCallback((peerId: string, peerNickname: string): RTCPeerConnection => {
        const existing = peerConnectionsRef.current.get(peerId);
        if (existing) {
            console.log("♻️ Reusing existing peer connection for", peerNickname);
            return existing.connection;
        }

        const pc = new RTCPeerConnection(configuration);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
                console.log("🎵 Added local track to peer connection");
            });
        }

        const audioElement = new Audio();
        audioElement.autoplay = true;
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);

        pc.ontrack = (event) => {
            console.log("🎵 Received remote track from", peerNickname);
            audioElement.srcObject = event.streams[0];
            audioElement.muted = isDeafened;
            audioElement.volume = 1.0;

            audioElement.play().then(() => {
                console.log("✅ Audio playback started for", peerNickname);
            }).catch(err => {
                console.error("❌ Error playing audio:", err);
                toast.error("Click anywhere to enable voice chat audio", { id: "audio-autoplay" });
                document.addEventListener('click', () => audioElement.play().catch(console.error), { once: true });
            });
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && channelRef.current) {
                channelRef.current.send({
                    type: "broadcast",
                    event: "voice-signal",
                    payload: {
                        type: "ice-candidate",
                        from: sessionId,
                        to: peerId,
                        candidate: event.candidate,
                    },
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerNickname}:`, pc.connectionState);
            if (pc.connectionState === "connected") {
                setConnectedPeers(prev => {
                    if (prev.includes(peerNickname)) return prev;
                    return [...prev, peerNickname];
                });
                toast.success(`Connected to ${peerNickname}`);
            } else if (pc.connectionState === "failed") {
                console.error(`Connection failed with ${peerNickname}`);
                pc.restartIce();
            } else if (pc.connectionState === "disconnected") {
                setTimeout(() => {
                    if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
                        removePeer(peerId);
                    }
                }, 5000);
            } else if (pc.connectionState === "closed") {
                removePeer(peerId);
            }
        };

        peerConnectionsRef.current.set(peerId, { connection: pc, audioElement, nickname: peerNickname });
        return pc;
    }, [isDeafened, sessionId, removePeer]);

    const createOffer = useCallback(async (peerId: string, peerNickname: string) => {
        try {
            const existing = peerConnectionsRef.current.get(peerId);
            if (existing && existing.connection.connectionState !== "failed" && existing.connection.connectionState !== "closed") {
                console.log("⏭️ Skipping offer creation, connection already exists");
                return;
            }

            const pc = createPeerConnection(peerId, peerNickname);
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });
            await pc.setLocalDescription(offer);

            if (channelRef.current) {
                await channelRef.current.send({
                    type: "broadcast",
                    event: "voice-signal",
                    payload: {
                        type: "offer",
                        from: sessionId,
                        to: peerId,
                        nickname,
                        offer: pc.localDescription,
                    },
                });
                console.log("📤 Sent offer to", peerNickname);
            }
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    }, [sessionId, nickname, createPeerConnection]);

    const handleOffer = useCallback(async (peerId: string, peerNickname: string, offer: RTCSessionDescriptionInit) => {
        try {
            const pc = createPeerConnection(peerId, peerNickname);

            if (!pc.currentRemoteDescription) {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                console.log("📥 Set remote description from", peerNickname);
            }

            // Process pending ICE candidates after setting remote description
            const pending = pendingIceCandidatesRef.current.get(peerId);
            if (pending && pending.length > 0) {
                console.log(`🧊 Processing ${pending.length} pending ICE candidates (offer)`);
                for (const candidate of pending) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding pending ICE candidate:", e);
                    }
                }
                pendingIceCandidatesRef.current.delete(peerId);
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (channelRef.current) {
                await channelRef.current.send({
                    type: "broadcast",
                    event: "voice-signal",
                    payload: {
                        type: "answer",
                        from: sessionId,
                        to: peerId,
                        nickname,
                        answer: pc.localDescription,
                    },
                });
                console.log("📤 Sent answer to", peerNickname);
            }
        } catch (error) {
            console.error("Error handling offer:", error);
        }
    }, [sessionId, nickname, createPeerConnection]);

    const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
        try {
            const peer = peerConnectionsRef.current.get(peerId);
            if (peer) {
                await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("📥 Set remote description (answer)");

                // Process pending ICE candidates after setting remote description
                const pending = pendingIceCandidatesRef.current.get(peerId);
                if (pending && pending.length > 0) {
                    console.log(`🧊 Processing ${pending.length} pending ICE candidates (answer)`);
                    for (const candidate of pending) {
                        try {
                            await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            console.error("Error adding pending ICE candidate:", e);
                        }
                    }
                    pendingIceCandidatesRef.current.delete(peerId);
                }
            }
        } catch (error) {
            console.error("Error handling answer:", error);
        }
    }, []);

    const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
        try {
            const peer = peerConnectionsRef.current.get(peerId);
            if (peer && peer.connection.remoteDescription) {
                await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                const pending = pendingIceCandidatesRef.current.get(peerId) || [];
                pending.push(candidate);
                pendingIceCandidatesRef.current.set(peerId, pending);
            }
        } catch (error) {
            console.error("Error handling ICE candidate:", error);
        }
    }, []);

    const handleSignal = useCallback(async ({ payload }: any) => {
        console.log("📨 RAW SIGNAL RECEIVED:", JSON.stringify(payload));

        const { type, from, to, nickname: peerNickname, offer, answer, candidate } = payload;

        if (to && to !== sessionId) {
            console.log("⏭️ Ignoring signal not for us (to:", to, "us:", sessionId, ")");
            return;
        }
        if (from === sessionId) {
            console.log("⏭️ Ignoring our own signal");
            return;
        }

        console.log("✅ Processing signal:", type, "from", peerNickname || from);

        switch (type) {
            case "join":
                console.log("👋 Peer joined:", peerNickname);
                await createOffer(from, peerNickname);
                break;
            case "offer":
                console.log("📥 Received offer from:", peerNickname);
                await handleOffer(from, peerNickname, offer);
                break;
            case "answer":
                console.log("📥 Received answer from:", from);
                await handleAnswer(from, answer);
                break;
            case "ice-candidate":
                console.log("🧊 Received ICE candidate from:", from);
                await handleIceCandidate(from, candidate);
                break;
            case "leave":
                console.log("👋 Peer left:", from);
                removePeer(from);
                break;
            default:
                console.warn("Unknown signal type:", type);
        }
    }, [sessionId, createOffer, handleOffer, handleAnswer, handleIceCandidate, removePeer]);

    const initializeVoiceChat = useCallback(async () => {
        console.log("🎤 Initializing voice chat for", nickname, "in room", roomId, "sessionId:", sessionId);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            localStreamRef.current = stream;
            console.log("✅ Microphone access granted");

            stream.getAudioTracks().forEach(track => {
                track.enabled = false;
                console.log("🔇 Microphone muted by default");
            });

            const channelName = `voice:${roomId}`;
            console.log("📡 Creating channel:", channelName);

            const channel = supabase.channel(channelName);

            channel
                .on("broadcast", { event: "voice-signal" }, (msg) => {
                    console.log("📨 Broadcast message received on channel");
                    handleSignal(msg);
                })
                .subscribe(async (status, err) => {
                    console.log("📡 Channel subscription status:", status);

                    if (err) {
                        console.error("❌ Channel subscription error:", err);
                        toast.error("Voice chat connection error");
                        return;
                    }

                    if (status === "SUBSCRIBED") {
                        console.log("✅ Successfully subscribed to channel:", channelName);
                        console.log("📢 Announcing presence to room");

                        setTimeout(async () => {
                            const joinMsg = {
                                type: "broadcast" as const,
                                event: "voice-signal",
                                payload: {
                                    type: "join",
                                    from: sessionId,
                                    nickname,
                                },
                            };
                            console.log("📤 Sending join message:", JSON.stringify(joinMsg));
                            const result = await channel.send(joinMsg);
                            console.log("📤 Join message result:", result);
                        }, 500);
                    }
                });

            channelRef.current = channel;
            toast.success("Voice chat ready");
            console.log("✅ Voice chat initialized successfully");
        } catch (error) {
            console.error("❌ Error initializing voice chat:", error);
            toast.error("Could not access microphone");
        }
    }, [roomId, nickname, sessionId, handleSignal]);

    const cleanup = useCallback(async () => {
        if (channelRef.current) {
            await channelRef.current.send({
                type: "broadcast",
                event: "voice-signal",
                payload: {
                    type: "leave",
                    from: sessionId,
                },
            });
            await channelRef.current.unsubscribe();
            channelRef.current = null;
        }

        peerConnectionsRef.current.forEach(({ connection, audioElement }) => {
            connection.close();
            audioElement.srcObject = null;
            audioElement.remove();
        });
        peerConnectionsRef.current.clear();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        pendingIceCandidatesRef.current.clear();
    }, [sessionId]);

    useEffect(() => {
        initializeVoiceChat();
        return () => {
            cleanup();
        };
    }, [initializeVoiceChat, cleanup]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                toast.success(audioTrack.enabled ? "Microphone unmuted" : "Microphone muted");
            }
        }
    };

    const toggleDeafen = () => {
        const newDeafenState = !isDeafened;
        setIsDeafened(newDeafenState);

        peerConnectionsRef.current.forEach(({ audioElement }) => {
            audioElement.muted = newDeafenState;
            console.log(`${newDeafenState ? '🔇' : '🔊'} ${newDeafenState ? 'Muted' : 'Unmuted'} audio from peer`);
        });

        if (newDeafenState && localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = false;
            });
            setIsMuted(true);
        }

        toast.success(newDeafenState ? "Audio deafened" : "Audio undeafened");
    };

    return (
        <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Voice Chat</h3>
                <span className="text-xs text-muted-foreground">
                    {connectedPeers.length} connected
                </span>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={isMuted ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleMute}
                    disabled={isDeafened}
                    className="flex-1"
                >
                    {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isMuted ? "Unmute" : "Mute"}
                </Button>

                <Button
                    variant={isDeafened ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleDeafen}
                    className="flex-1"
                >
                    {isDeafened ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                    {isDeafened ? "Undeafen" : "Deafen"}
                </Button>
            </div>

            {connectedPeers.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">In voice:</p>
                    <div className="flex flex-wrap gap-1">
                        {connectedPeers.map((peer, index) => (
                            <span
                                key={index}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                                {peer}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default VoiceChat;
