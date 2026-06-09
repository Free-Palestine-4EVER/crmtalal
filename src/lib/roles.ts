import type { Role } from "./types";

/** Landing path for a given role after sign-in. */
export function roleHome(_role: Role): string {
  return "/dashboard";
}

export const ROLE_RANK: Record<Role, number> = {
  client: 0,
  employee: 1,
  admin: 2,
};

export function hasAtLeast(role: Role | null | undefined, min: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export function isStaff(role: Role | null | undefined): boolean {
  return role === "admin" || role === "employee";
}
