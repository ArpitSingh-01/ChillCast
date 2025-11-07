import { motion } from "framer-motion";

interface AnimatedHeadingProps {
  text: string;
}

const AnimatedHeading = ({ text }: AnimatedHeadingProps) => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 animate-gradient"
      style={{
        textShadow: "0 0 80px rgba(139, 92, 246, 0.6), 0 0 120px rgba(59, 130, 246, 0.4)",
        backgroundSize: "200% auto",
      }}
    >
      {text}
    </motion.h1>
  );
};

export default AnimatedHeading;
