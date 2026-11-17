import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Banknote, FileImage, Receipt, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { BottomSheet, Empty, Field, Pill, Row, Screen, Segmented, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { MONTH, flatName, useDemo, type Flat } from "@/lib/demo-store";
import { dueStatus, pendingAmount } from "@/lib/finance";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/secretary/maintenance")({
  head: pageHead("Maintenance & dues", "Track paid and unpaid flats, verify UPI payments and send reminders."),
  component: Maintenance,
});

type Tab = "dues" | "verify" | "history" | "reminders";
type Filter = "all" | "Paid" | "Unpaid" | "Partially Paid";

function Maintenance() {
  const flats = useDemo((s) => s.flats).filter((f) => f.status !== "Vacant" && f.reg === "Approved");
  const payments = useDemo((s) => s.payments);
  const reminders = useDemo((s) => s.reminders);
  const { reviewPayment, markCashPaid, sendReminders } = useDemo();
  const [tab, setTab] = useState<Tab>("dues");
  const [filter, setFilter] = useState<Filter>("all");
  const [cashFor, setCashFor] = useState<Flat | null>(null);
  const [cashAmt, setCashAmt] = useState("");
  const [settings, setSettings] = useState(false);

  const st = (f: Flat) => dueStatus(f.monthly, f.paid, f.prevDue);
  const shown = flats.filter((f) => filter === "all" || st(f) === filter);
  const unpaid = flats.filter((f) => st(f) !== "Paid");
  const pendingPays = payments.filter((p) => p.status === "Pending");

  return (
    <Screen title="Maintenance" subtitle={`${MONTH} · due on the 10th`} action={
      <Button size="icon" variant="outline" aria-label="Maintenance settings" onClick={() => setSettings(true)}><Settings2 /></Button>
    }>
      <Segmented value={tab} onChange={setTab} options={[
        { value: "dues", label: "Dues", count: unpaid.length },
        { value: "verify", label: "Verify", count: pendingPays.length },
        { value: "history", label: "History" },
        { value: "reminders", label: "Reminders" },
      ]} />

      {tab === "dues" && (
        <>
          <Button variant="coral" className="w-full" disabled={unpaid.length === 0} onClick={() => { sendReminders(unpaid.map((f) => f.id)); toast.success(`Reminder sent to ${unpaid.length} unpaid flats`); }}>
            <BellRing /> Remind all unpaid ({unpaid.length})
          </Button>
          <Segmented value={filter} onChange={setFilter} options={[
            { value: "all", label: "All" },
            { value: "Paid", label: "Paid" },
            { value: "Unpaid", label: "Unpaid" },
            { value: "Partially Paid", label: "Partial" },
          ]} />
          <div className="space-y-2">
            {shown.map((f) => {
              const due = pendingAmount(f.monthly, f.paid, f.prevDue);
              return (
                <Tile key={f.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Link to="/secretary/flat/$flatId" params={{ flatId: f.id }} className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary font-display text-xs font-bold">{f.id}</Link>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{flatName(f)}</div>
                      <div className="text-xs text-muted-foreground">{inr(f.monthly)}/mo{f.prevDue > 0 && ` · prev due ${inr(f.prevDue)}`}</div>
                    </div>
                    <div className="text-right">
                      <Pill>{st(f)}</Pill>
                      {due > 0 && <div className="mt-1 text-xs font-bold text-destructive">{inr(due)}</div>}
                    </div>
                  </div>
                  {due > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => { sendReminders([f.id]); toast.success(`Reminder sent to ${f.id}`); }}><BellRing /> Remind</Button>
                      <Button size="sm" variant="soft" onClick={() => { setCashFor(f); setCashAmt(String(due)); }}><Banknote /> Mark cash paid</Button>
                    </div>
                  )}
                </Tile>
              );
            })}
          </div>
        </>
      )}

      {tab === "verify" && (
        <div className="space-y-2.5">
          {pendingPays.length === 0 && <Empty>No payments waiting for verification.</Empty>}
          {pendingPays.map((p) => (
            <Tile key={p.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-semibold">{inr(p.amount)}</div>
                  <div className="text-xs text-muted-foreground">{p.flatId} · {p.mode} · {p.date}</div>
                </div>
                <Pill>Pending</Pill>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs">
                <span className="font-semibold">UTR</span><span className="font-mono">{p.utr}</span>
                {p.screenshot && <span className="ml-auto flex items-center gap-1 text-muted-foreground"><FileImage className="size-3.5" />{p.screenshot}</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { reviewPayment(p.id, false); toast("Payment rejected — resident notified"); }}>Reject</Button>
                <Button variant="success" onClick={() => { reviewPayment(p.id, true); toast.success(`${p.flatId} marked paid · receipt generated`); }}>Approve</Button>
              </div>
            </Tile>
          ))}
        </div>
      )}

      {tab === "history" && (
        <Tile className="divide-y divide-border py-1">
          {payments.filter((p) => p.status !== "Pending").map((p) => (
            <Row key={p.id} left={<span className="grid size-10 place-items-center rounded-xl bg-muted"><Receipt className="size-4 text-muted-foreground" /></span>}
              title={`${p.flatId} · ${inr(p.amount)}`} subtitle={`${p.mode}${p.utr ? " · " + p.utr : ""} · ${p.date}`} right={<Pill>{p.status}</Pill>} />
          ))}
        </Tile>
      )}

      {tab === "reminders" && (
        <div className="space-y-2.5">
          <Tile className="text-sm text-muted-foreground">Automatic reminders go out 3 days before and 2 days after the due date.</Tile>
          <Tile className="divide-y divide-border py-1">
            {reminders.map((r) => <Row key={r.id} title={`${r.kind} reminder · ${r.flats} flat${r.flats > 1 ? "s" : ""}`} subtitle={r.time} />)}
          </Tile>
        </div>
      )}

      <BottomSheet open={!!cashFor} onClose={() => setCashFor(null)} title={`Cash payment · ${cashFor?.id}`}>
        <div className="space-y-3.5">
          <Field label="Amount received (₹)"><input className={inputCls} inputMode="numeric" value={cashAmt} onChange={(e) => setCashAmt(e.target.value)} /></Field>
          <Button variant="coral" size="lg" className="w-full" onClick={() => {
            const n = Number(cashAmt);
            if (!cashFor || !n) return;
            markCashPaid(cashFor.id, n);
            toast.success(`${inr(n)} cash recorded for ${cashFor.id}`);
            setCashFor(null);
          }}>Record payment</Button>
        </div>
      </BottomSheet>

      <BottomSheet open={settings} onClose={() => setSettings(false)} title="Maintenance settings">
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="2 BHK monthly (₹)"><input className={inputCls} defaultValue="3500" /></Field>
            <Field label="3 BHK monthly (₹)"><input className={inputCls} defaultValue="4200" /></Field>
          </div>
          <Field label="Due date (day of month)"><input className={inputCls} defaultValue="10" /></Field>
          <p className="text-xs text-muted-foreground">Flat-specific amounts can be set from each flat's page.</p>
          <Button variant="coral" size="lg" className="w-full" onClick={() => { toast.success("Settings saved"); setSettings(false); }}>Save</Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
