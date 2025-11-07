import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
      className="perspective-1000"
    >
      <Card className="glass-card p-6 h-full transform transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/20 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
