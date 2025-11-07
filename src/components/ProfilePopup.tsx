import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from "lucide-react";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePopup = ({ isOpen, onClose }: ProfilePopupProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="glass-card p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-1 shadow-[0_0_40px_hsl(var(--primary)/0.5)]">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-5xl font-bold text-primary">AS</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Arpit Singh</h2>
            <button
              onClick={() => window.open("https://www.instagram.com/arpit.singh006", "_blank")}
              className="text-sm text-primary mb-6 hover:underline inline-flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <svg 
                className="w-4 h-4" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @arpit.singh006
            </button>
            
            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => window.open("https://www.linkedin.com/in/arpit-singh-07888b38b", "_blank")}
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
                onClick={() => window.open("https://mail.google.com/mail/?view=cm&fs=1&to=mail.arpit0110@gmail.com", "_blank")}
              >
                <Mail className="w-5 h-5" />
                Send Email
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePopup;
