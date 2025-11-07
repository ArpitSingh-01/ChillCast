import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SilkBackground from "@/components/SilkBackground";
import MediaPlayer from "@/components/room/MediaPlayer";
import ChatBox from "@/components/room/ChatBox";
import MembersList from "@/components/room/MembersList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { ArrowLeft } from "lucide-react";

const Room = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState("");
  const [hostName, setHostName] = useState("");
  const [hostPassword, setHostPassword] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [mode, setMode] = useState<"create" | "join" | "room">("create");
  const [isRejoinAsHost, setIsRejoinAsHost] = useState(false);
  const [rejoinHostPassword, setRejoinHostPassword] = useState("");
  const [privateRecipient, setPrivateRecipient] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const roomCodeParam = searchParams.get("roomCode");
    
    if (modeParam === "create") {
      setMode("create");
    } else if (modeParam === "join" || roomCodeParam) {
      setMode("join");
      if (roomCodeParam) {
        setJoinRoomCode(roomCodeParam);
      }
    }
  }, [searchParams]);

  const createRoom = async () => {
    if (!hostName || !hostPassword) {
      toast.error("Please enter host name and password");
      return;
    }

    const hashedPassword = await bcrypt.hash(hostPassword, 10);
    const hashedRoomPassword = roomPassword ? await bcrypt.hash(roomPassword, 10) : null;

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        host_name: hostName,
        host_password: hashedPassword,
        room_password: hashedRoomPassword,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create room");
      console.error(error);
      return;
    }

    const { error: memberError } = await supabase.from("members").insert({
      room_id: data.id,
      nickname: hostName,
      is_online: true,
      session_id: sessionId,
    });

    if (memberError) {
      console.error("Error adding host as member:", memberError);
    }

    setRoomId(data.id);
    setRoomCode(data.room_code);
    setNickname(hostName);
    setIsHost(true);
    setMode("room");
    toast.success(`Room created! Room Code: ${data.room_code}`);
  };

  const joinRoom = async () => {
    // Rejoin as host validation
    if (isRejoinAsHost) {
      if (!joinRoomCode || !rejoinHostPassword) {
        toast.error("Please enter room code and host password");
        return;
      }

      const { data: room, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", joinRoomCode)
        .single();

      if (error || !room) {
        toast.error("Room not found");
        return;
      }

      // Verify host password
      const isHostPasswordValid = await bcrypt.compare(rejoinHostPassword, room.host_password);
      if (!isHostPasswordValid) {
        toast.error("Invalid host password");
        return;
      }

      // Join as host
      const { error: memberError } = await supabase.from("members").insert({
        room_id: room.id,
        nickname: room.host_name,
        is_online: true,
        session_id: sessionId,
      });

      if (memberError) {
        toast.error("Failed to rejoin as host");
        console.error(memberError);
        return;
      }

      setRoomId(room.id);
      setRoomCode(room.room_code);
      setNickname(room.host_name);
      setHostName(room.host_name);
      setIsHost(true);
      setMode("room");
      toast.success("Rejoined as host successfully!");
      return;
    }

    // Regular join as member
    if (!joinRoomCode || !nickname) {
      toast.error("Please enter room code and nickname");
      return;
    }

    const { data: room, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", joinRoomCode)
      .single();

    if (error || !room) {
      toast.error("Room not found");
      return;
    }

    if (room.room_password) {
      const isPasswordValid = await bcrypt.compare(joinPassword, room.room_password);
      if (!isPasswordValid) {
        toast.error("Invalid room password");
        return;
      }
    }

    const { error: memberError } = await supabase.from("members").insert({
      room_id: room.id,
      nickname: nickname,
      is_online: true,
      session_id: sessionId,
    });

    if (memberError) {
      toast.error("Failed to join room");
      console.error(memberError);
      return;
    }

    setRoomId(room.id);
    setRoomCode(room.room_code);
    setHostName(room.host_name);
    setIsHost(false);
    setMode("room");
    toast.success("Joined room successfully!");
  };

  const leaveRoom = async () => {
    if (roomId && nickname) {
      await supabase
        .from("members")
        .update({ is_online: false })
        .eq("room_id", roomId)
        .eq("nickname", nickname);
    }
    navigate("/");
  };

  const shareRoom = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard!");
  };

  if (mode === "room" && roomId) {
    return (
      <div className="h-screen relative overflow-hidden flex flex-col">
        <SilkBackground />
        
        <div className="relative z-10 p-4 md:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <Button variant="ghost" onClick={leaveRoom}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Room Code: <span className="text-primary font-mono text-lg font-bold">{roomCode}</span>
              </div>
              <Button variant="outline" size="sm" onClick={shareRoom}>
                Share Room
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            <div className="lg:col-span-2 min-h-0">
              <MediaPlayer roomId={roomId} isHost={isHost} hostName={hostName} sessionId={sessionId} />
            </div>
            
            <div className="flex flex-col gap-6 h-full min-h-0">
              <div className="flex-[2] min-h-0">
                <ChatBox 
                  roomId={roomId} 
                  nickname={nickname}
                  privateRecipient={privateRecipient}
                />
              </div>
              <div className="flex-1 min-h-0">
                <MembersList
                  roomId={roomId}
                  hostName={hostName}
                  currentNickname={nickname}
                  onPrivateChat={(recipientNickname) => {
                    setPrivateRecipient(recipientNickname === privateRecipient ? null : recipientNickname);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <SilkBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="glass-card p-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {mode === "create" ? "Create Room" : "Join Room"}
          </h1>

          {mode === "create" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hostName">Host Name</Label>
                <Input
                  id="hostName"
                  placeholder="Enter your name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hostPassword">Host Password</Label>
                <Input
                  id="hostPassword"
                  type="password"
                  placeholder="Create a password"
                  value={hostPassword}
                  onChange={(e) => setHostPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roomPassword">Room Password (Optional)</Label>
                <Input
                  id="roomPassword"
                  type="password"
                  placeholder="Set room password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                />
              </div>
              <Button variant="hero" size="lg" className="w-full" onClick={createRoom}>
                Create Room
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Button
                  variant={!isRejoinAsHost ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRejoinAsHost(false)}
                >
                  Join as Member
                </Button>
                <Button
                  variant={isRejoinAsHost ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRejoinAsHost(true)}
                >
                  Rejoin as Host
                </Button>
              </div>

              <div>
                <Label htmlFor="joinRoomCode">Room Code (8 characters)</Label>
                <Input
                  id="joinRoomCode"
                  placeholder="Enter 8-character code"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </div>

              {isRejoinAsHost ? (
                <div>
                  <Label htmlFor="rejoinHostPassword">Host Password</Label>
                  <Input
                    id="rejoinHostPassword"
                    type="password"
                    placeholder="Enter your host password"
                    value={rejoinHostPassword}
                    onChange={(e) => setRejoinHostPassword(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="nickname">Your Nickname</Label>
                    <Input
                      id="nickname"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="joinPassword">Room Password (if required)</Label>
                    <Input
                      id="joinPassword"
                      type="password"
                      placeholder="Enter room password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button variant="hero" size="lg" className="w-full" onClick={joinRoom}>
                {isRejoinAsHost ? "Rejoin as Host" : "Join Room"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Room;
