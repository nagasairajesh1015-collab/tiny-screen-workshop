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

export type Area = Exclude<Home, "/pending">;

/** Every section a signed-in person may open. A secretary who also owns a flat gets both. */
export function areasForRoles(rows: RoleRow[]): Area[] {
  const areas: Area[] = [];
  if (rows.some((r) => r.role === "ADMIN" && r.society_id === null)) areas.push("/admin");
  if (rows.some((r) => MANAGER.includes(r.role) && r.society_id)) areas.push("/secretary");
  if (rows.some((r) => RESIDENT.includes(r.role) && r.society_id)) areas.push("/resident");
  if (rows.some((r) => SECURITY.includes(r.role) && r.society_id)) areas.push("/guard");
  return areas;
}

export const AREA_NAME: Record<Area, string> = {
  "/admin": "Admin", "/secretary": "Secretary", "/resident": "Owner / Tenant", "/guard": "Security Guard",
};

export const ROLE_NAME: Record<DbRole, string> = {
  ADMIN: "Platform admin", CHAIRMAN: "Chairman", SECRETARY: "Secretary", TREASURER: "Treasurer",
  RESIDENT_OWNER: "Owner", RESIDENT_TENANT: "Tenant", GUARD: "Security guard", SUPERVISOR: "Security supervisor",
};
