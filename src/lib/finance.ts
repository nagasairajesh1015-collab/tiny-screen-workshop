/** Business rules from the ResiCore spec. Keep these pure so they can be tested. */

export type DueStatus = "Paid" | "Partially Paid" | "Unpaid";

/** Opening Balance + Total Collections − Total Expenses = Closing Balance */
export function closingBalance(opening: number, collections: number, expenses: number) {
  return opening + collections - expenses;
}

/** Amount still owed: this month's unpaid part plus previous months' outstanding dues. */
export function pendingAmount(monthly: number, paidThisMonth: number, previousDue: number) {
  return Math.max(0, monthly - paidThisMonth) + Math.max(0, previousDue);
}

export function dueStatus(monthly: number, paidThisMonth: number, previousDue = 0): DueStatus {
  if (pendingAmount(monthly, paidThisMonth, previousDue) === 0) return "Paid";
  if (paidThisMonth > 0) return "Partially Paid";
  return "Unpaid";
}

/** Duplicate transaction prevention: the same UTR / transaction ID cannot be submitted twice. */
export function isDuplicateUtr(utr: string, existing: string[]) {
  const key = utr.trim().toUpperCase();
  if (!key) return false;
  return existing.some((e) => e.trim().toUpperCase() === key);
}
