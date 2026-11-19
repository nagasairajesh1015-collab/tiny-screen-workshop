import { describe, expect, it } from "vitest";
import { findPassByCode, normalizePlate } from "./gate";
import type { Visitor } from "./demo-store";

const base: Visitor = { id: "1", name: "Ananya", phone: "", flatId: "A-302", purpose: "", type: "Guest", status: "Approved", code: "552901", date: "Today" };

describe("gate pass check", () => {
  it("lets in an approved visitor with the right code", () => {
    expect(findPassByCode([base], "552 901")).toEqual({ ok: true, visitor: base });
  });
  it("refuses a visitor still waiting for the resident", () => {
    expect(findPassByCode([{ ...base, status: "Pending" }], "552901").ok).toBe(false);
  });
  it("refuses a pass that was already used", () => {
    expect(findPassByCode([{ ...base, status: "Exited" }], "552901").ok).toBe(false);
  });
  it("refuses an unknown or short code", () => {
    expect(findPassByCode([base], "111111").ok).toBe(false);
    expect(findPassByCode([base], "5529").ok).toBe(false);
  });
  it("matches number plates regardless of spaces and case", () => {
    expect(normalizePlate("ts 09 ek-4512")).toBe("TS09EK4512");
  });
});
