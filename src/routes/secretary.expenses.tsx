import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Paperclip, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { BottomSheet, Field, NativeSelect, Pill, Screen, Section, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { MONTH, useDemo, type Expense } from "@/lib/demo-store";
import { inr, todayLabel } from "@/lib/format";
import { useSummary } from "@/lib/use-summary";

export const Route = createFileRoute("/secretary/expenses")({
  head: pageHead("Expenses & balance", "Track apartment expenses by category and see the monthly balance."),
  component: Expenses,
});

function Expenses() {
  const s = useSummary();
  const expenses = useDemo((x) => x.expenses).filter((e) => e.month === MONTH);
  const { deleteExpense } = useDemo();
  const [open, setOpen] = useState(false);
  const byCat = Object.entries(expenses.reduce<Record<string, number>>((a, e) => ({ ...a, [e.category]: (a[e.category] ?? 0) + e.amount }), {})).sort((a, b) => b[1] - a[1]);
  const max = byCat[0]?.[1] ?? 1;

  return (
    <Screen title="Expenses" subtitle={MONTH} action={<Button variant="coral" size="sm" onClick={() => setOpen(true)}><Plus /> Add</Button>}>
      <Tile className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Financial summary</div>
        {[["Opening balance", s.opening, ""], ["+ Collections", s.collections, "text-success"], ["− Expenses", s.expenses, "text-destructive"]].map(([l, v, c]) => (
          <div key={l as string} className="flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className={`font-semibold ${c}`}>{inr(v as number)}</span></div>
        ))}
        <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold"><span>Closing balance</span><span>{inr(s.closing)}</span></div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-muted p-2.5"><div className="text-[11px] text-muted-foreground">Cash in hand</div><b>{inr(s.cash)}</b></div>
          <div className="rounded-xl bg-muted p-2.5"><div className="text-[11px] text-muted-foreground">Bank balance</div><b>{inr(s.bank)}</b></div>
        </div>
        <p className="text-[11px] text-muted-foreground">Closing balance carries forward as next month's opening balance.</p>
      </Tile>

      <Section title="By category">
        <Tile className="space-y-2.5">
          {byCat.map(([c, v]) => (
            <div key={c} className="space-y-1">
              <div className="flex justify-between text-xs"><span className="font-semibold">{c}</span><span>{inr(v)}</span></div>
              <div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-ink-soft" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
        </Tile>
      </Section>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => toast.success("Monthly PDF report ready (demo)")}><Download /> PDF report</Button>
        <Button variant="outline" onClick={() => toast.success("Excel export ready (demo)")}><FileSpreadsheet /> Excel</Button>
      </div>

      <Section title={`Entries (${expenses.length})`}>
        <div className="space-y-2">
          {expenses.map((e) => (
            <Tile key={e.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{e.category}</span><Pill tone="muted">{e.mode}</Pill></div>
                <div className="truncate text-xs text-muted-foreground">{e.description} · {e.date}</div>
              </div>
              <div className="font-semibold">{inr(e.amount)}</div>
              <button aria-label="Delete expense" onClick={() => { deleteExpense(e.id); toast("Expense deleted"); }} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Trash2 className="size-4" /></button>
            </Tile>
          ))}
        </div>
      </Section>

      <AddExpense open={open} onClose={() => setOpen(false)} />
    </Screen>
  );
}

function AddExpense({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories, addExpense, addCategory } = useDemo();
  const [category, setCategory] = useState(categories[0]);
  const [custom, setCustom] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<Expense["mode"]>("Cash");
  const [bill, setBill] = useState("");
  const isCustom = category === "+ Custom category";
  return (
    <BottomSheet open={open} onClose={onClose} title="Add expense">
      <div className="space-y-3.5">
        <Field label="Category"><NativeSelect value={category} onChange={setCategory} options={[...categories, "+ Custom category"]} /></Field>
        {isCustom && <Field label="New category name"><input className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} /></Field>}
        <Field label="Description"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₹)"><input className={inputCls} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Paid via"><NativeSelect value={mode} onChange={(v) => setMode(v as Expense["mode"])} options={["Cash", "Bank", "UPI"]} /></Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
          <Paperclip className="size-4" /> {bill || "Upload bill / invoice"}
          <input type="file" className="hidden" onChange={(e) => setBill(e.target.files?.[0]?.name ?? "")} />
        </label>
        <Button variant="coral" size="lg" className="w-full" onClick={() => {
          const cat = isCustom ? custom.trim() : category;
          if (!cat || !Number(amount)) return toast.error("Enter a category and amount.");
          if (isCustom) addCategory(cat);
          addExpense({ category: cat, description: description || cat, amount: Number(amount), mode, date: todayLabel() });
          toast.success("Expense added");
          setAmount(""); setDescription(""); setBill(""); onClose();
        }}>Save expense</Button>
      </div>
    </BottomSheet>
  );
}
