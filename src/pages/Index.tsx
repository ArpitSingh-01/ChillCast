import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SilkBackground from "@/components/SilkBackground";
import ProfilePopup from "@/components/ProfilePopup";
import { Button } from "@/components/ui/button";
import { Play, Users, MessageCircle, Share2, Lock, Mic, ArrowRight, Check, Sparkles } from "lucide-react";

const Index = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'features') setActiveSection('features');
          else if (id === 'how-it-works') setActiveSection('how-it-works');
          else setActiveSection('home');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe sections
    const sections = ['features', 'how-it-works'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Check if at top of page
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: Play,
      title: "Synchronized Playback",
      description: "Host-controlled YouTube videos play in perfect sync for everyone in the room",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Lock,
      title: "Private Rooms",
      description: "Secure rooms with passwords and unique IDs for your exclusive watch parties",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Share2,
      title: "Screen Sharing",
      description: "Share your screen with audio to show anything beyond YouTube videos",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Public and private messaging with emoji support for seamless communication",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Mic,
      title: "Voice Chat",
      description: "Crystal-clear peer-to-peer voice communication with mute and deafen controls",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Live Members",
      description: "See who's in your room with online status and private chat options",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create or Join",
      description: "Start a new room or join an existing one with a room code",
      icon: Users,
    },
    {
      number: "02",
      title: "Share the Link",
      description: "Invite friends by sharing the unique room code",
      icon: Share2,
    },
    {
      number: "03",
      title: "Watch Together",
      description: "Enjoy synchronized playback with voice chat and live reactions",
      icon: Play,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SilkBackground />

      {/* Cursor trail effect */}
      <motion.div
        className="fixed w-6 h-6 rounded-full bg-purple-500/30 blur-xl pointer-events-none z-50"
        animate={{
          x: cursorPosition.x - 12,
          y: cursorPosition.y - 12,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Floating orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Simple Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/40 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            ✨ ChillCast
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeSection === 'home'
                ? 'bg-purple-600/80 text-white'
                : 'bg-transparent hover:bg-purple-600/20 border border-purple-500/50 text-cyan-100'
                }`}
            >
              HOME
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeSection === 'features'
                ? 'bg-purple-600/80 text-white'
                : 'bg-transparent hover:bg-purple-600/20 border border-purple-500/50 text-cyan-100'
                }`}
            >
              FEATURES
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeSection === 'how-it-works'
                ? 'bg-purple-600/80 text-white'
                : 'bg-transparent hover:bg-purple-600/20 border border-purple-500/50 text-cyan-100'
                }`}
            >
              HOW IT WORKS
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="px-6 py-2 rounded-full bg-transparent hover:bg-purple-600/20 border border-purple-500/50 text-cyan-100 font-medium transition-all duration-300"
            >
              CONTACT
            </button>
          </motion.div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center px-4 py-12">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center w-full max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            {/* Sparkle animation */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
            </motion.div>

            {/* Hero Heading with animated gradient */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 relative"
            >
              <span
                className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient"
                style={{
                  backgroundSize: "200% 200%",
                  filter: "drop-shadow(0 0 80px rgba(168, 85, 247, 0.5))",
                }}
              >
                ✨ ChillCast ✨
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-4xl text-muted-foreground mb-12 font-light"
            >
              Watch Together, Chill Together
            </motion.p>

            {/* Floating action cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-24 flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.div
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button
                  onClick={() => navigate("/room?mode=create")}
                  className="relative px-12 py-8 text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-2xl shadow-2xl group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Create Room
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Ripple effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0, opacity: 0.5 }}
                    whileHover={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-cyan-500/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button
                  onClick={() => navigate("/room?mode=join")}
                  variant="outline"
                  className="relative px-12 py-8 text-xl font-bold border-2 border-cyan-500/70 hover:border-cyan-400 hover:bg-cyan-500/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden text-cyan-100"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Room
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-6xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Features
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-16">
              Everything you need for the perfect watch party
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.03 }}
                  className="group relative"
                >
                  {/* Floating particles on hover */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500/50 rounded-full blur-sm"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />

                  <div className="glass-card p-8 h-full border border-white/10 hover:border-white/30 transition-all duration-500 rounded-2xl backdrop-blur-md relative overflow-hidden">
                    {/* Gradient glow on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                      initial={false}
                    />

                    <div className="relative z-10">
                      {/* Animated icon */}
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-3.5 mb-6 shadow-2xl`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-full h-full text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-purple-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full max-w-6xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-16">
              Get started in three simple steps
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent -z-10" />
                  )}

                  <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-center">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {step.number}
                    </motion.div>
                    <step.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl border border-white/10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to Start Watching?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users enjoying seamless watch parties
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/room?mode=create")}
                  size="lg"
                  className="px-16 py-8 text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-2xl shadow-2xl"
                >
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </Button>
              </motion.div>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" /> No signup required
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" /> Free forever
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <ProfilePopup isOpen={showProfile} onClose={() => setShowProfile(false)} />

      <footer className="relative z-20 text-center py-6 text-base text-muted-foreground bg-background/40 backdrop-blur-md border-t border-border/50">
        © 2025 ChillCast | Created by{" "}
        <button
          onClick={() => setShowProfile(true)}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline cursor-pointer font-medium"
        >
          Arpit Singh
        </button>
      </footer>
    </div>
  );
};

export default Index;
