import { useRef, useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface TiltedCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const TiltedCard = ({ icon: Icon, title, description, index }: TiltedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlareX((x / rect.width) * 100);
    setGlareY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.3s ease-out",
      }}
      className="relative group"
    >
      <Card className="glass-card p-6 h-full min-h-[170px] relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 flex flex-col">
        {/* Glare effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, hsl(260 85% 75% / 0.15) 0%, transparent 50%)`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-start gap-4 flex-1">
            <motion.div
              className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {title}
              </h3>
              <p className="text-muted-foreground leading-relaxed flex-1">{description}</p>
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl rounded-full" />
      </Card>
    </motion.div>
  );
};

export default TiltedCard;
