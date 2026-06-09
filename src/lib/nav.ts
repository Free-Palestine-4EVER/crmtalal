import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  UserPlus,
  Users,
  Building2,
  Briefcase,
  CheckSquare,
  CalendarDays,
  Receipt,
  BarChart3,
  Activity,
  UserCog,
  FileCheck,
} from "lucide-react";
import type { Role } from "./types";
import type { Dictionary } from "@/i18n/dictionaries/en";

export type NavGroup = "main" | "crm" | "insights" | "manage";

export type NavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  group: NavGroup;
  label: (d: Dictionary, role: Role) => string;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["client", "employee", "admin"], group: "main", label: (d) => d.dash.overview },
  { key: "requests", href: "/requests", icon: FileText, roles: ["client", "employee", "admin"], group: "main", label: (d, r) => (r === "client" ? d.dash.myRequests : r === "employee" ? d.dash.assigned : d.dash.requests) },
  { key: "inbox", href: "/inbox", icon: MessageSquare, roles: ["client", "employee", "admin"], group: "main", label: (d) => d.dash.messages },
  { key: "leads", href: "/leads", icon: UserPlus, roles: ["admin", "employee"], group: "crm", label: (d) => d.modules.leads },
  { key: "contacts", href: "/contacts", icon: Users, roles: ["admin", "employee"], group: "crm", label: (d) => d.modules.contacts },
  { key: "companies", href: "/companies", icon: Building2, roles: ["admin", "employee"], group: "crm", label: (d) => d.modules.companies },
  { key: "deals", href: "/deals", icon: Briefcase, roles: ["admin", "employee"], group: "crm", label: (d) => d.modules.pipeline },
  { key: "tasks", href: "/tasks", icon: CheckSquare, roles: ["admin", "employee"], group: "crm", label: (d) => d.modules.tasks },
  { key: "calendar", href: "/calendar", icon: CalendarDays, roles: ["admin", "employee"], group: "crm", label: (d) => d.modules.calendar },
  { key: "invoices", href: "/invoices", icon: Receipt, roles: ["admin"], group: "crm", label: (d) => d.modules.invoices },
  { key: "reports", href: "/reports", icon: FileCheck, roles: ["admin", "employee"], group: "insights", label: (d) => d.dash.reports },
  { key: "analytics", href: "/analytics", icon: BarChart3, roles: ["admin"], group: "insights", label: (d) => d.dash.analytics },
  { key: "activity", href: "/activity", icon: Activity, roles: ["admin"], group: "insights", label: (d) => d.modules.activity },
  { key: "clients", href: "/clients", icon: Users, roles: ["admin"], group: "manage", label: (d) => d.dash.clients },
  { key: "team", href: "/team", icon: UserCog, roles: ["admin"], group: "manage", label: (d) => d.modules.team },
];

export const GROUP_LABEL: Record<NavGroup, (d: Dictionary) => string> = {
  main: (d) => d.modules.main,
  crm: (d) => d.modules.crm,
  insights: (d) => d.modules.insights,
  manage: (d) => d.modules.manage,
};

export function navForRole(role: Role): { group: NavGroup; items: NavItem[] }[] {
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));
  const order: NavGroup[] = ["main", "crm", "insights", "manage"];
  return order
    .map((group) => ({ group, items: items.filter((i) => i.group === group) }))
    .filter((g) => g.items.length > 0);
}
