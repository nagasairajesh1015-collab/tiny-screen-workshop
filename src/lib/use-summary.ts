import { closingBalance, pendingAmount } from "./finance";
import { MONTH, OPENING, useDemo } from "./demo-store";

export function useSummary() {
  const payments = useDemo((s) => s.payments);
  const expenses = useDemo((s) => s.expenses);
  const flats = useDemo((s) => s.flats);
  const approved = payments.filter((p) => p.status === "Approved" && p.month === MONTH);
  const monthExp = expenses.filter((e) => e.month === MONTH);
  const sum = (xs: { amount: number }[]) => xs.reduce((a, x) => a + x.amount, 0);
  const collections = sum(approved);
  const cashIn = sum(approved.filter((p) => p.mode === "Cash"));
  const totalExp = sum(monthExp);
  const cashOut = sum(monthExp.filter((e) => e.mode === "Cash"));
  const opening = OPENING.cash + OPENING.bank;
  const active = flats.filter((f) => f.status !== "Vacant" && f.reg === "Approved");
  const pending = active.reduce((a, f) => a + pendingAmount(f.monthly, f.paid, f.prevDue), 0);
  return {
    opening, collections, expenses: totalExp, pending,
    closing: closingBalance(opening, collections, totalExp),
    cash: closingBalance(OPENING.cash, cashIn, cashOut),
    bank: closingBalance(OPENING.bank, collections - cashIn, totalExp - cashOut),
    expected: active.reduce((a, f) => a + f.monthly, 0),
  };
}
