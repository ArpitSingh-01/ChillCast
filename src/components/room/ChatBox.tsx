import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Users, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: string;
  receiver: string | null;
  message: string;
  is_private: boolean;
  created_at: string;
}

interface Member {
  id: string;
  nickname: string;
  is_online: boolean;
}

interface PrivateChatMember {
  nickname: string;
  lastMessage: string;
  unreadCount: number;
}

interface ChatBoxProps {
  roomId: string;
  nickname: string;
  privateRecipient?: string | null;
}

const ChatBox = ({ roomId, nickname, privateRecipient }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatMode, setChatMode] = useState<"public" | "private">(privateRecipient ? "private" : "public");
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(privateRecipient || null);
  const [privateChatMembers, setPrivateChatMembers] = useState<PrivateChatMember[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch private chat members - people who have private chat history with current user
  useEffect(() => {
    const fetchPrivateChatMembers = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("sender, receiver, message, created_at")
        .eq("room_id", roomId)
        .eq("is_private", true)
        .or(`sender.eq.${nickname},receiver.eq.${nickname}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching private chats:", error);
        return;
      }

      // Get unique members who have private chat with current user
      const membersMap = new Map<string, PrivateChatMember>();
      
      data?.forEach(msg => {
        const otherPerson = msg.sender === nickname ? msg.receiver : msg.sender;
        if (otherPerson && !membersMap.has(otherPerson)) {
          membersMap.set(otherPerson, {
            nickname: otherPerson,
            lastMessage: msg.message,
            unreadCount: 0, // Can be enhanced later
          });
        }
      });

      setPrivateChatMembers(Array.from(membersMap.values()));
    };

    fetchPrivateChatMembers();
  }, [roomId, nickname, messages]); // Re-fetch when messages change

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (privateRecipient !== selectedRecipient) {
      setSelectedRecipient(privateRecipient || null);
      setChatMode(privateRecipient ? "private" : "public");
    }
  }, [privateRecipient]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (chatMode === "private" && !selectedRecipient) {
      toast.error("Please select a member for private chat");
      return;
    }

    const messageData = {
      room_id: roomId,
      sender: nickname,
      receiver: chatMode === "private" ? selectedRecipient : null,
      message: newMessage,
      is_private: chatMode === "private",
    };

    const { error } = await supabase.from("chats").insert(messageData);

    if (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  const handleModeChange = (mode: "public" | "private") => {
    setChatMode(mode);
    if (mode === "public") {
      setSelectedRecipient(null);
    } else if (mode === "private" && privateChatMembers.length > 0) {
      // Auto-select first member if switching to private and none selected
      if (!selectedRecipient) {
        setSelectedRecipient(privateChatMembers[0].nickname);
      }
    }
  };

  const handleRecipientSelect = (recipientNickname: string) => {
    setSelectedRecipient(recipientNickname);
    setChatMode("private");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMessages = messages.filter((msg) => {
    if (chatMode === "private" && selectedRecipient) {
      return (
        msg.is_private &&
        ((msg.sender === nickname && msg.receiver === selectedRecipient) ||
          (msg.receiver === nickname && msg.sender === selectedRecipient))
      );
    }
    if (chatMode === "public") {
      return !msg.is_private;
    }
    return false;
  });

  return (
    <Card className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Chat</h2>
      </div>

      <Tabs value={chatMode} onValueChange={(value) => handleModeChange(value as "public" | "private")} className="mb-4">
        <TabsList className="bg-background/50 w-full">
          <TabsTrigger value="public" className="gap-2 flex-1">
            <Users className="w-4 h-4" />
            Public
          </TabsTrigger>
          <TabsTrigger value="private" className="gap-2 flex-1">
            <MessageCircle className="w-4 h-4" />
            Private
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {chatMode === "private" && (
        <div className="mb-4">
          {privateChatMembers.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No private chats yet. Click the message icon in Members list to start a private chat.
            </div>
          ) : (
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {privateChatMembers.map((member) => (
                  <div
                    key={member.nickname}
                    onClick={() => handleRecipientSelect(member.nickname)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedRecipient === member.nickname
                        ? "bg-primary/20 border-2 border-primary/50"
                        : "bg-secondary/20 hover:bg-secondary/30 border-2 border-transparent"
                    }`}
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {getInitials(member.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{member.nickname}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {member.lastMessage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.sender === nickname
                  ? "bg-primary/20 ml-8"
                  : "bg-secondary/20 mr-8"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-primary">
                  {msg.sender}
                </span>
                {msg.is_private && (
                  <span className="text-xs text-muted-foreground">
                    (private)
                  </span>
                )}
              </div>
              <p className="text-sm">{msg.message}</p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button onClick={sendMessage} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ChatBox;
