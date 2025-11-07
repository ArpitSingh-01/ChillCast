import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SilkBackground from "@/components/SilkBackground";
import AnimatedHeading from "@/components/AnimatedHeading";
import TiltedCard from "@/components/TiltedCard";
import ProfilePopup from "@/components/ProfilePopup";
import { Button } from "@/components/ui/button";
import { Play, Users, MessageCircle, Share2, Lock, Zap } from "lucide-react";

const Index = () => {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: Play,
      title: "Synchronized Playback",
      description:
        "Host-controlled YouTube videos play in perfect sync for everyone in the room",
    },
    {
      icon: Lock,
      title: "Private Rooms",
      description:
        "Secure rooms with passwords and unique IDs for your exclusive watch parties",
    },
    {
      icon: Share2,
      title: "Screen Sharing",
      description:
        "Share your screen with audio to show anything beyond YouTube videos",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description:
        "Public and private messaging with emoji support for seamless communication",
    },
    {
      icon: Users,
      title: "Live Members",
      description:
        "See who's in your room with online status and private chat options",
    },
    {
      icon: Zap,
      title: "No Login Required",
      description:
        "Jump right in and start watching together—no account needed",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SilkBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-6xl mx-auto"
        >
          <AnimatedHeading text="✨ ChillCast ✨" />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl text-muted-foreground mb-12"
          >
            Watch Together, Chill Together
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/room?mode=create")}
              className="px-12 py-6 text-lg font-bold"
            >
              Create Room
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/room?mode=join")}
              className="px-12 py-6 text-lg font-bold"
            >
              Join Room
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-8">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {features.map((feature, index) => (
                <TiltedCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ProfilePopup
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <footer className="fixed bottom-0 left-0 right-0 text-center py-4 text-base text-muted-foreground bg-background/20 backdrop-blur-sm border-t border-border/50 z-20">
        © 2025 ChillCast | Created by{" "}
        <button
          onClick={() => setShowProfile(true)}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline cursor-pointer relative z-30 font-medium"
        >
          Arpit Singh
        </button>
      </footer>
    </div>
  );
};

export default Index;
