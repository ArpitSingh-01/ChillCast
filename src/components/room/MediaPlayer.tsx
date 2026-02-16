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
    <Card className="glass-card p-3 sm:p-6 h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
          <TabsTrigger value="youtube" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Youtube className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">YouTube Player</span>
            <span className="sm:hidden">YouTube</span>
          </TabsTrigger>
          <TabsTrigger value="screenshare" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Screen Share</span>
            <span className="sm:hidden">Screen</span>
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
