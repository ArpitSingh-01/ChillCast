import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, Monitor } from "lucide-react";
import YouTubePlayer from "./YouTubePlayer";
import ScreenShare from "./ScreenShare";

interface MediaPlayerProps {
  roomId: string;
  isHost: boolean;
  hostName: string;
  sessionId: string;
}

const MediaPlayer = ({ roomId, isHost, hostName, sessionId }: MediaPlayerProps) => {
  const [activeTab, setActiveTab] = useState<string>("youtube");

  return (
    <Card className="glass-card p-6 h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="youtube" className="gap-2">
            <Youtube className="w-4 h-4" />
            YouTube Player
          </TabsTrigger>
          <TabsTrigger value="screenshare" className="gap-2">
            <Monitor className="w-4 h-4" />
            Screen Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <YouTubePlayer roomId={roomId} isHost={isHost} />
        </TabsContent>

        <TabsContent value="screenshare" className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <ScreenShare roomId={roomId} isHost={isHost} hostName={hostName} sessionId={sessionId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default MediaPlayer;
