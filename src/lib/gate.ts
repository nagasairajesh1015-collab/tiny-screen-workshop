import type { Visitor } from "./demo-store";

/** Gate rule: a pass code only opens the gate for a visitor the resident has approved. */
export function findPassByCode(visitors: Visitor[], code: string): { ok: true; visitor: Visitor } | { ok: false; error: string } {
  const key = code.replace(/\D/g, "");
  if (key.length !== 6) return { ok: false, error: "Enter the 6-digit pass code." };
  const v = visitors.find((x) => x.code === key);
  if (!v) return { ok: false, error: "No pass found for this code." };
  if (v.status === "Inside") return { ok: false, error: `${v.name} is already inside.` };
  if (v.status === "Exited") return { ok: false, error: "This pass was already used." };
  if (v.status !== "Approved") return { ok: false, error: "This visitor is not approved by the resident yet." };
  return { ok: true, visitor: v };
}

export const normalizePlate = (s: string) => s.replace(/[^a-z0-9]/gi, "").toUpperCase();
