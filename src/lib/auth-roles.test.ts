import { describe, expect, it } from "vitest";
import { homeForRoles } from "./auth-roles";

const S = "a0000000-0000-0000-0000-000000000001";

describe("where a signed-in person lands", () => {
  it("platform admin goes to the admin console", () => {
    expect(homeForRoles([{ role: "ADMIN", society_id: null }, { role: "SECRETARY", society_id: S }])).toBe("/admin");
  });
  it("a society secretary goes to the secretary console", () => {
    expect(homeForRoles([{ role: "SECRETARY", society_id: S }])).toBe("/secretary");
  });
  it("a tenant goes to the resident screens", () => {
    expect(homeForRoles([{ role: "RESIDENT_TENANT", society_id: S }])).toBe("/resident");
  });
  it("a guard goes to the gate screens", () => {
    expect(homeForRoles([{ role: "GUARD", society_id: S }])).toBe("/guard");
  });
  it("someone with no approved role waits for approval", () => {
    expect(homeForRoles([])).toBe("/pending");
  });
});
