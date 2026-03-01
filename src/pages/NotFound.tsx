import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import SilkBackground from "@/components/SilkBackground";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useTheme, themes } from "@/contexts/ThemeContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  useEffect(() => {
    // Silently track 404 errors
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <SilkBackground />
      <ThemeSwitcher />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-4"
      >
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className={`text-9xl font-black mb-4 bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}
        >
          404
        </motion.h1>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Oops! Page not found</h2>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className={`px-8 py-6 text-lg font-bold bg-gradient-to-r ${currentTheme.buttonGradient} hover:opacity-90 rounded-2xl shadow-2xl`}
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
