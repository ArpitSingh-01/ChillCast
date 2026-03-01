import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface YouTubePlayerProps {
  roomId: string;
  isHost: boolean;
}

const YouTubePlayer = ({ roomId, isHost }: YouTubePlayerProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialState, setInitialState] = useState<{time: number, playing: boolean} | null>(null);
  const playerRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleLoadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      if (isHost) {
        supabase
          .from("rooms")
          .update({ yt_video_url: videoUrl, video_play_time: 0, is_playing: false })
          .eq("id", roomId)
          .then();
      }
    }
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    
    // Apply initial state if available (for members joining mid-video)
    if (initialState && !isHost) {
      setTimeout(() => {
        try {
          event.target.seekTo(initialState.time, true);
          if (initialState.playing) {
            event.target.playVideo();
            setIsPlaying(true);
          }
        } catch (error) {
          // Silently handle error
        }
      }, 500);
      setInitialState(null);
    }
  };

  const handlePlayPause = async () => {
    if (!isHost || !playerRef.current) return;

    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    const newPlayState = !isPlaying;
    
    setIsPlaying(newPlayState);
    
    if (newPlayState) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }

    await supabase
      .from("rooms")
      .update({ is_playing: newPlayState, video_play_time: currentTime })
      .eq("id", roomId);
  };

  const handleSeek = async (seconds: number) => {
    if (!isHost || !playerRef.current) return;
    
    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    const newTime = Math.max(0, currentTime + seconds);
    
    playerRef.current.seekTo(newTime);
    
    await supabase
      .from("rooms")
      .update({ video_play_time: newTime })
      .eq("id", roomId);
  };

  // Fetch initial state on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      const { data: room, error } = await supabase
        .from("rooms")
        .select("yt_video_url, video_play_time, is_playing")
        .eq("id", roomId)
        .single();
      
      if (error) return;
      
      if (room?.yt_video_url) {
        const id = extractVideoId(room.yt_video_url);
        if (id) {
          setVideoId(id);
          setVideoUrl(room.yt_video_url);
          // Store initial state to apply when player is ready
          if (!isHost) {
            const state = {
              time: room.video_play_time || 0,
              playing: room.is_playing || false
            };
            setInitialState(state);
          }
        }
      }
    };
    
    fetchInitialState();
  }, [roomId, isHost]);

  // Host: Periodic time updates while playing
  useEffect(() => {
    if (!isHost || !isPlaying || !playerRef.current) return;
    
    const interval = setInterval(async () => {
      try {
        if (!playerRef.current) return;
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        
        await supabase
          .from("rooms")
          .update({ video_play_time: currentTime })
          .eq("id", roomId);
      } catch (error) {
        // Silently handle error
      }
    }, 3000);
    
    timeUpdateIntervalRef.current = interval;
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isHost, isPlaying, roomId]);

  // Member: Continuous sync check
  useEffect(() => {
    if (isHost || !playerRef.current || !videoId) return;
    
    const syncCheck = setInterval(async () => {
      try {
        const { data: room, error } = await supabase
          .from("rooms")
          .select("video_play_time, is_playing")
          .eq("id", roomId)
          .single();
        
        if (error || !room || !playerRef.current) return;
        
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        const serverTime = room.video_play_time || 0;
        const playerState = playerRef.current.getPlayerState();
        const drift = Math.abs(currentTime - serverTime);
        
        // Sync time if drift is more than 3 seconds
        if (drift > 3) {
          setIsSyncing(true);
          playerRef.current.seekTo(serverTime, true);
          setTimeout(() => setIsSyncing(false), 1000);
        }
        
        // Sync play/pause state (1 = playing, 2 = paused)
        if (room.is_playing && playerState !== 1) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        } else if (!room.is_playing && playerState === 1) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        }
      } catch (error) {
        // Silently handle error
      }
    }, 10000);
    
    syncCheckIntervalRef.current = syncCheck;
    return () => {
      if (syncCheckIntervalRef.current) {
        clearInterval(syncCheckIntervalRef.current);
      }
    };
  }, [isHost, videoId, roomId]);

  // Real-time subscription for immediate updates
  useEffect(() => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload: any) => {
          const room = payload.new;
          
          // Video URL changed
          if (room.yt_video_url && room.yt_video_url !== videoUrl) {
            const id = extractVideoId(room.yt_video_url);
            if (id) {
              setVideoId(id);
              setVideoUrl(room.yt_video_url);
              toast.success("New video loaded");
            }
          }

          // Sync for members only
          if (!isHost && playerRef.current) {
            if (syncTimeoutRef.current) {
              clearTimeout(syncTimeoutRef.current);
            }

            syncTimeoutRef.current = setTimeout(() => {
              try {
                if (!playerRef.current) return;
                
                setIsSyncing(true);
                const currentTime = Math.floor(playerRef.current.getCurrentTime());
                const serverTime = room.video_play_time || 0;
                const drift = Math.abs(currentTime - serverTime);
                
                // Sync time if difference is more than 2 seconds
                if (drift > 2) {
                  playerRef.current.seekTo(serverTime, true);
                }

                // Sync play/pause state
                const playerState = playerRef.current.getPlayerState();
                
                if (room.is_playing && playerState !== 1) {
                  playerRef.current.playVideo();
                  setIsPlaying(true);
                } else if (!room.is_playing && playerState === 1) {
                  playerRef.current.pauseVideo();
                  setIsPlaying(false);
                }
              } catch (error) {
                // Silently handle error
              } finally {
                setTimeout(() => setIsSyncing(false), 500);
              }
            }, 300);
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          toast.error("Connection issue - attempting to reconnect...");
        }
      });

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (syncCheckIntervalRef.current) {
        clearInterval(syncCheckIntervalRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [roomId, isHost, videoUrl]);

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: isHost ? 1 : 0,
      disablekb: isHost ? 0 : 1,
    },
  };

  return (
    <div className="h-full flex flex-col">
      {isHost && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Paste YouTube URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoadVideo()}
            className="flex-1"
          />
          <Button onClick={handleLoadVideo}>Load</Button>
        </div>
      )}

      <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4 relative min-h-[400px]">
        {videoId ? (
          <>
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onPlayerReady}
              className="w-full h-full"
              iframeClassName="w-full h-full"
            />
            {isSyncing && !isHost && (
              <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium animate-fade-in">
                Syncing...
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isHost ? "Load a YouTube video to get started" : "Waiting for host to load a video..."}
          </div>
        )}
      </div>

      {isHost && videoId && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="icon" onClick={() => handleSeek(-10)}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="default" size="icon" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleSeek(10)}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
