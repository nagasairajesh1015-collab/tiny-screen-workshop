import { describe, expect, it } from "vitest";
import { closingBalance, dueStatus, isDuplicateUtr, pendingAmount } from "./finance";

describe("ResiCore finance rules", () => {
  it("closing balance = opening + collections - expenses", () => {
    expect(closingBalance(184500, 42000, 31000)).toBe(195500);
  });

  it("pending includes previous month outstanding", () => {
    expect(pendingAmount(3500, 0, 3500)).toBe(7000);
    expect(pendingAmount(3500, 2000, 0)).toBe(1500);
  });

  it("status is Paid only when nothing is pending", () => {
    expect(dueStatus(3500, 3500, 0)).toBe("Paid");
    expect(dueStatus(3500, 3500, 1000)).toBe("Partially Paid");
    expect(dueStatus(3500, 1500, 0)).toBe("Partially Paid");
    expect(dueStatus(3500, 0, 0)).toBe("Unpaid");
  });

  it("blocks a UTR that was already submitted, ignoring case and spaces", () => {
    expect(isDuplicateUtr(" utr123 ", ["UTR123"])).toBe(true);
    expect(isDuplicateUtr("UTR999", ["UTR123"])).toBe(false);
  });
});
