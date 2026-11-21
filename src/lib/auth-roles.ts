/** Which home screen a signed-in person lands on, from their role rows. */
export type DbRole = "ADMIN" | "CHAIRMAN" | "SECRETARY" | "TREASURER" | "RESIDENT_OWNER" | "RESIDENT_TENANT" | "GUARD" | "SUPERVISOR";
export interface RoleRow { role: DbRole; society_id: string | null }
export type Home = "/admin" | "/secretary" | "/resident" | "/guard" | "/pending";

const MANAGER: DbRole[] = ["SECRETARY", "CHAIRMAN", "TREASURER"];
const RESIDENT: DbRole[] = ["RESIDENT_OWNER", "RESIDENT_TENANT"];
const SECURITY: DbRole[] = ["GUARD", "SUPERVISOR"];

export function homeForRoles(rows: RoleRow[]): Home {
  if (rows.some((r) => r.role === "ADMIN" && r.society_id === null)) return "/admin";
  if (rows.some((r) => MANAGER.includes(r.role) && r.society_id)) return "/secretary";
  if (rows.some((r) => RESIDENT.includes(r.role) && r.society_id)) return "/resident";
  if (rows.some((r) => SECURITY.includes(r.role) && r.society_id)) return "/guard";
  return "/pending";
}

export const ROLE_NAME: Record<DbRole, string> = {
  ADMIN: "Platform admin", CHAIRMAN: "Chairman", SECRETARY: "Secretary", TREASURER: "Treasurer",
  RESIDENT_OWNER: "Owner", RESIDENT_TENANT: "Tenant", GUARD: "Security guard", SUPERVISOR: "Security supervisor",
};
