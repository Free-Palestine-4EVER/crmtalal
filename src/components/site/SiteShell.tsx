"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Lenis from "lenis";
import { SiteCursor } from "@/components/site/SiteCursor";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      style={{ scaleX: x }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-gold-500 via-gold-400 to-maroon-600"
    />
  );
}

type Theme = "light" | "dark";

const SiteThemeCtx = createContext<{
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}>({ theme: "light", toggle: () => {}, setTheme: () => {} });

export const useSiteTheme = () => useContext(SiteThemeCtx);

const KEY = "edarah_site_theme";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // Restore preference
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s === "dark" || s === "light") setThemeState(s);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "light" ? "dark" : "light"),
    [theme, setTheme],
  );

  // Lenis smooth scroll (public site only)
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <SiteThemeCtx.Provider value={{ theme, toggle, setTheme }}>
      <div className="site-root min-h-svh" data-theme={theme}>
        <SiteCursor />
        {children}
      </div>
    </SiteThemeCtx.Provider>
  );
}
