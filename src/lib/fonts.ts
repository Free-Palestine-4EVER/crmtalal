import {
  Inter,
  IBM_Plex_Sans_Arabic,
  Cormorant_Garamond,
  IBM_Plex_Mono,
} from "next/font/google";

/** Latin UI / body */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Arabic — clean, professional, matches the company profile */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
});

/** Latin display serif — editorial, premium (marketing headings) */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Monospace — reference codes (EV-2026-0001), figures */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const fontVariables = [
  inter.variable,
  plexArabic.variable,
  cormorant.variable,
  plexMono.variable,
].join(" ");
