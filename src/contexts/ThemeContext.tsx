import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeColor = "purple" | "blue" | "green" | "orange" | "pink" | "red" | "cyan";

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  purple: {
    name: "Purple Dream",
    // HSL values
    primary: "260 85% 65%",
    secondary: "215 90% 60%",
    accent: "190 95% 43%",
    // Background colors
    background: "250 50% 5%",
    card: "250 50% 12%",
    // Tailwind gradient classes
    gradient: "from-purple-400 via-pink-400 to-cyan-400",
    buttonGradient: "from-purple-600 to-pink-600",
    // Galaxy background colors
    galaxyPrimary: "260 85% 15%",
    galaxySecondary: "215 90% 15%",
    galaxyAccent: "190 95% 20%",
    // Star colors (for animation)
    starPrimary: "260 85% 75%",
    starSecondary: "215 90% 70%",
    starAccent: "190 95% 70%",
    // Nebula glow
    nebulaGlow: "260 85% 40%",
    // CSS glow effect
    glow: "rgba(168, 85, 247, 0.5)",
  },
  blue: {
    name: "Ocean Blue",
    primary: "210 100% 60%",
    secondary: "200 100% 50%",
    accent: "180 100% 45%",
    background: "220 50% 5%",
    card: "220 50% 12%",
    gradient: "from-blue-400 via-sky-400 to-cyan-400",
    buttonGradient: "from-blue-600 to-cyan-600",
    galaxyPrimary: "210 100% 15%",
    galaxySecondary: "200 100% 12%",
    galaxyAccent: "180 100% 18%",
    starPrimary: "210 100% 70%",
    starSecondary: "200 100% 65%",
    starAccent: "180 100% 60%",
    nebulaGlow: "210 100% 35%",
    glow: "rgba(59, 130, 246, 0.5)",
  },
  green: {
    name: "Forest Green",
    primary: "142 76% 45%",
    secondary: "160 84% 39%",
    accent: "173 80% 40%",
    background: "150 40% 5%",
    card: "150 40% 12%",
    gradient: "from-green-400 via-emerald-400 to-teal-400",
    buttonGradient: "from-green-600 to-emerald-600",
    galaxyPrimary: "142 76% 15%",
    galaxySecondary: "160 84% 12%",
    galaxyAccent: "173 80% 18%",
    starPrimary: "142 76% 65%",
    starSecondary: "160 84% 60%",
    starAccent: "173 80% 55%",
    nebulaGlow: "142 76% 30%",
    glow: "rgba(34, 197, 94, 0.5)",
  },
  orange: {
    name: "Sunset Orange",
    primary: "25 95% 53%",
    secondary: "15 100% 55%",
    accent: "45 93% 47%",
    background: "20 50% 5%",
    card: "20 50% 12%",
    gradient: "from-orange-400 via-amber-400 to-yellow-400",
    buttonGradient: "from-orange-600 to-amber-600",
    galaxyPrimary: "25 95% 15%",
    galaxySecondary: "15 100% 12%",
    galaxyAccent: "45 93% 18%",
    starPrimary: "25 95% 65%",
    starSecondary: "15 100% 60%",
    starAccent: "45 93% 55%",
    nebulaGlow: "25 95% 35%",
    glow: "rgba(249, 115, 22, 0.5)",
  },
  pink: {
    name: "Bubblegum Pink",
    primary: "330 81% 60%",
    secondary: "340 82% 52%",
    accent: "320 85% 65%",
    background: "330 50% 5%",
    card: "330 50% 12%",
    gradient: "from-pink-400 via-rose-400 to-fuchsia-400",
    buttonGradient: "from-pink-600 to-fuchsia-600",
    galaxyPrimary: "330 81% 15%",
    galaxySecondary: "340 82% 12%",
    galaxyAccent: "320 85% 18%",
    starPrimary: "330 81% 70%",
    starSecondary: "340 82% 65%",
    starAccent: "320 85% 75%",
    nebulaGlow: "330 81% 40%",
    glow: "rgba(236, 72, 153, 0.5)",
  },
  red: {
    name: "Ruby Red",
    primary: "0 84% 60%",
    secondary: "350 89% 60%",
    accent: "10 90% 58%",
    background: "0 40% 5%",
    card: "0 40% 12%",
    gradient: "from-red-400 via-rose-400 to-orange-400",
    buttonGradient: "from-red-600 to-rose-600",
    galaxyPrimary: "0 84% 15%",
    galaxySecondary: "350 89% 12%",
    galaxyAccent: "10 90% 18%",
    starPrimary: "0 84% 70%",
    starSecondary: "350 89% 65%",
    starAccent: "10 90% 60%",
    nebulaGlow: "0 84% 40%",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  cyan: {
    name: "Cyber Cyan",
    primary: "190 95% 43%",
    secondary: "200 98% 39%",
    accent: "180 100% 45%",
    background: "190 50% 5%",
    card: "190 50% 12%",
    gradient: "from-cyan-400 via-teal-400 to-blue-400",
    buttonGradient: "from-cyan-600 to-blue-600",
    galaxyPrimary: "190 95% 15%",
    galaxySecondary: "200 98% 12%",
    galaxyAccent: "180 100% 18%",
    starPrimary: "190 95% 65%",
    starSecondary: "200 98% 60%",
    starAccent: "180 100% 70%",
    nebulaGlow: "190 95% 35%",
    glow: "rgba(6, 182, 212, 0.5)",
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem("chillcast-theme");
    return (saved as ThemeColor) || "purple";
  });

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme];

    // Set all CSS custom properties
    root.style.setProperty("--primary", currentTheme.primary);
    root.style.setProperty("--secondary", currentTheme.secondary);
    root.style.setProperty("--accent", currentTheme.accent);
    root.style.setProperty("--background", currentTheme.background);
    root.style.setProperty("--card", currentTheme.card);
    root.style.setProperty("--galaxy-primary", currentTheme.galaxyPrimary);
    root.style.setProperty("--galaxy-secondary", currentTheme.galaxySecondary);
    root.style.setProperty("--galaxy-accent", currentTheme.galaxyAccent);
    root.style.setProperty("--star-primary", currentTheme.starPrimary);
    root.style.setProperty("--star-secondary", currentTheme.starSecondary);
    root.style.setProperty("--star-accent", currentTheme.starAccent);
    root.style.setProperty("--nebula-glow", currentTheme.nebulaGlow);
    
    root.setAttribute("data-theme", theme);
    localStorage.setItem("chillcast-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
