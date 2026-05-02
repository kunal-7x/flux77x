import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

interface ThemeContextType {
  primaryHue: number;
  primarySaturation: number;
  primaryLightness: number;
  setPrimaryColor: (h: number, s: number, l: number) => void;
  resetTheme: () => void;
  layoutMode: "topnav" | "sidebar";
  setLayoutMode: (mode: "topnav" | "sidebar") => void;
}

const DEFAULT_HUE = 43;
const DEFAULT_SAT = 100;
const DEFAULT_LIGHT = 56;

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryHue, setPrimaryHue] = useState(DEFAULT_HUE);
  const [primarySaturation, setPrimarySaturation] = useState(DEFAULT_SAT);
  const [primaryLightness, setPrimaryLightness] = useState(DEFAULT_LIGHT);
  const [layoutMode, setLayoutModeState] = useState<"topnav" | "sidebar">("topnav");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flux-theme");
    if (saved) {
      try {
        const { h, s, l } = JSON.parse(saved);
        setPrimaryHue(h); setPrimarySaturation(s); setPrimaryLightness(l);
      } catch {}
    }
    const savedLayout = localStorage.getItem("flux-layout");
    if (savedLayout === "sidebar" || savedLayout === "topnav") {
      setLayoutModeState(savedLayout);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    root.style.setProperty("--accent", `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    root.style.setProperty("--ring", `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    root.style.setProperty("--sidebar-primary", `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    root.style.setProperty("--sidebar-ring", `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    root.style.setProperty("--warning", `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
    // Foreground for primary - derive based on lightness
    const fgLight = primaryLightness > 55 ? 8 : 96;
    root.style.setProperty("--primary-foreground", `${primaryHue > 180 ? 228 : 228} 16% ${fgLight}%`);
    root.style.setProperty("--accent-foreground", `${primaryHue > 180 ? 228 : 228} 16% ${fgLight}%`);
    root.style.setProperty("--sidebar-primary-foreground", `${primaryHue > 180 ? 228 : 228} 16% ${fgLight}%`);

    localStorage.setItem("flux-theme", JSON.stringify({ h: primaryHue, s: primarySaturation, l: primaryLightness }));
  }, [primaryHue, primarySaturation, primaryLightness]);

  const setPrimaryColor = useCallback((h: number, s: number, l: number) => {
    setPrimaryHue(h); setPrimarySaturation(s); setPrimaryLightness(l);
  }, []);

  const resetTheme = useCallback(() => {
    setPrimaryHue(DEFAULT_HUE);
    setPrimarySaturation(DEFAULT_SAT);
    setPrimaryLightness(DEFAULT_LIGHT);
    localStorage.removeItem("flux-theme");
  }, []);

  const setLayoutMode = useCallback((mode: "topnav" | "sidebar") => {
    setLayoutModeState(mode);
    localStorage.setItem("flux-layout", mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ primaryHue, primarySaturation, primaryLightness, setPrimaryColor, resetTheme, layoutMode, setLayoutMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
