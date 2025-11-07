import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Member {
  id: string;
  nickname: string;
  is_online: boolean;
}

interface MembersListProps {
  roomId: string;
  hostName: string;
  currentNickname: string;
  onPrivateChat: (nickname: string) => void;
}

const MembersList = ({ roomId, hostName, currentNickname, onPrivateChat }: MembersListProps) => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("room_id", roomId)
        .eq("is_online", true)
        .order("joined_at", { ascending: true });

      if (error) {
        console.error("Error fetching members:", error);
      } else {
        const prevCount = members.length;
        const newCount = data?.length || 0;
        
        if (newCount > prevCount && prevCount > 0) {
          const newMember = data?.[newCount - 1];
          if (newMember) {
            toast.success(`${newMember.nickname} joined the room`);
          }
        }
        
        setMembers(data || []);
      }
    };

    fetchMembers();

    const channel = supabase
      .channel(`members-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Members</h2>
        <Badge variant="secondary" className="text-sm">
          {members.length} online
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        {members.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No members yet
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card/50 hover:bg-card/80 transition-all duration-200 border border-border/50 hover:border-primary/30 animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(member.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                        member.is_online ? "bg-green-500 animate-pulse" : "bg-muted"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{member.nickname}</span>
                      {member.nickname === hostName && (
                        <Badge variant="default" className="h-5 px-1.5 gap-1">
                          <Crown className="w-3 h-3" />
                          <span className="text-xs">Host</span>
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {member.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {member.nickname !== currentNickname && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={() => onPrivateChat(member.nickname)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default MembersList;
