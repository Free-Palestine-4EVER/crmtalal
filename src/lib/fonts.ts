import {
  Outfit,
  Almarai,
  Reem_Kufi,
  Marcellus,
  IBM_Plex_Mono,
} from "next/font/google";

/** Latin UI / body — geometric, contemporary */
export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-inter", // keep historical var name so the whole app picks it up
  display: "swap",
});

/** Arabic body — Almarai: clean, premium, beautifully light at large sizes */
export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-plex-ar", // keep historical var name
  display: "swap",
});

/** Arabic display — Reem Kufi: geometric Kufi, the Saudi-modern brand voice */
export const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-ar",
  display: "swap",
});

/** Latin display — Marcellus: single-weight Roman serif, quiet luxury */
export const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cormorant", // keep historical var name
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
  outfit.variable,
  almarai.variable,
  reemKufi.variable,
  marcellus.variable,
  plexMono.variable,
].join(" ");
