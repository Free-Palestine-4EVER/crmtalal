import type { MetadataRoute } from "next";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "TAQEEM-accredited real estate valuation & advisory. Request, track, and receive valuation reports.";

/** Shared icon set — 192/512 in both "any" and "maskable" purposes. */
function buildIcons(): MetadataRoute.Manifest["icons"] {
  return [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-192-maskable.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/icons/icon-512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];
}

/** Role-specific identity for the installed PWA. */
function identityFor(role: string | undefined): {
  name: string;
  short_name: string;
  id: string;
  start_url: string;
} {
  switch (role) {
    case "admin":
      return {
        name: "Edarah Admin · إدارة",
        short_name: "Edarah Admin",
        id: "/?app=admin",
        start_url: "/dashboard?app=admin",
      };
    case "employee":
      return {
        name: "Edarah Valuer · مقيّم",
        short_name: "Edarah Valuer",
        id: "/?app=valuer",
        start_url: "/dashboard?app=valuer",
      };
    case "client":
      return {
        name: "Edarah · إدارة",
        short_name: "Edarah",
        id: "/?app=client",
        start_url: "/dashboard?app=client",
      };
    default:
      return {
        name: "Edarah — Real Estate Valuation",
        short_name: "Edarah",
        id: "/",
        start_url: "/",
      };
  }
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const role = (await cookies()).get("edarah_role")?.value;
  const identity = identityFor(role);

  return {
    ...identity,
    description: DESCRIPTION,
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#101218",
    theme_color: "#72142f",
    lang: "ar",
    dir: "rtl",
    categories: ["business", "productivity", "finance"],
    icons: buildIcons(),
  };
}
