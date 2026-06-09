import {
  Building2,
  LineChart,
  Scale,
  ClipboardList,
  Compass,
  BadgeCheck,
  Eye,
  Target,
  ShieldCheck,
  Lock,
  Map as MapIcon,
  Home,
  Store,
  Landmark,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  building2: Building2,
  lineChart: LineChart,
  scale: Scale,
  clipboard: ClipboardList,
  compass: Compass,
  badgeCheck: BadgeCheck,
  eye: Eye,
  target: Target,
  shieldCheck: ShieldCheck,
  lock: Lock,
  map: MapIcon,
  home: Home,
  store: Store,
  landmark: Landmark,
  warehouse: Warehouse,
};

export function getIcon(key: string): LucideIcon {
  return ICONS[key] ?? Building2;
}
