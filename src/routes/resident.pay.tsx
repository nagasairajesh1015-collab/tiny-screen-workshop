import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, Paperclip, ReceiptText } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { Eyebrow, Field, Hero, inputCls, Pill, Row, Screen, Section, Segmented, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { APARTMENT, ME_FLAT, MONTH, useDemo } from "@/lib/demo-store";
import { pendingAmount } from "@/lib/finance";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resident/pay")({
  head: pageHead("Pay maintenance", "Pay your monthly maintenance by UPI or bank and submit the transaction ID."),
  component: Pay,
});

const UPI_ID = "lakeviewres@okhdfcbank";

function Pay() {
  const flat = useDemo((s) => s.flats.find((f) => f.id === ME_FLAT));
  const payments = useDemo((s) => s.payments).filter((p) => p.flatId === ME_FLAT);
  const submitPayment = useDemo((s) => s.submitPayment);
  const [mode, setMode] = useState<"UPI" | "Bank">("UPI");
  const [utr, setUtr] = useState("");
  const [shot, setShot] = useState("");
  const [amount, setAmount] = useState("");
  if (!flat) return null;
  const due = pendingAmount(flat.monthly, flat.paid, flat.prevDue);
  const pending = payments.filter((p) => p.status === "Pending");
  const steps = [
    { label: "Invoice", done: true },
    { label: "Pay", done: due === 0 || pending.length > 0 },
    { label: "Submit ID", done: due === 0 || pending.length > 0 },
    { label: "Approved", done: due === 0 },
  ];

  const submit = () => {
    const amt = Number(amount || due);
    if (!utr.trim()) return void toast.error("Enter the UPI / bank transaction ID.");
    if (!amt) return void toast.error("Enter the amount you paid.");
    const r = submitPayment({ flatId: ME_FLAT, amount: amt, utr, mode, screenshot: shot || undefined });
    if (!r.ok) return void toast.error(r.error ?? "Could not submit");
    toast.success("Submitted — the Secretary will verify it");
    setUtr(""); setShot(""); setAmount("");
  };

  return (
    <Screen title="Maintenance" subtitle={`${APARTMENT} · Flat ${ME_FLAT}`}>
      <Hero>
        <Eyebrow className="flex items-center gap-1.5 text-alert"><span className="size-1.5 rounded-full bg-alert" /> Settlement flow</Eyebrow>
        <div className="mt-2 font-display text-2xl font-bold">{MONTH} dues</div>
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {steps.map((s) => (
            <div key={s.label} className={cn("rounded-lg px-1 py-1.5 text-center text-[10px] font-bold", s.done ? "bg-primary text-primary-foreground" : "bg-ink-foreground/10 text-ink-foreground/60")}>{s.label}</div>
          ))}
        </div>
      </Hero>

      <Tile className="space-y-3">
        <div className="flex items-center justify-between">
          <Eyebrow className="text-muted-foreground">Invoice · {MONTH}</Eyebrow>
          <Pill>{due === 0 ? "Paid" : pending.length ? "Pending" : "Unpaid"}</Pill>
        </div>
        <div className="space-y-1.5 rounded-xl bg-muted p-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Monthly maintenance ({flat.bhk})</span><span className="font-semibold">{inr(flat.monthly)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Previous months due</span><span className="font-semibold">{inr(flat.prevDue)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Paid this month</span><span className="font-semibold text-primary">− {inr(flat.paid)}</span></div>
          <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold"><span>Amount to pay</span><span>{inr(due)}</span></div>
        </div>
      </Tile>

      {due > 0 && (
        <Section title="1 · Pay the association">
          <Tile className="space-y-3">
            <Segmented value={mode} onChange={setMode} options={[{ value: "UPI", label: "UPI" }, { value: "Bank", label: "Bank transfer" }]} />
            {mode === "UPI" ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-primary/40 bg-accent p-3">
                <div className="min-w-0"><div className="text-[11px] font-semibold text-accent-foreground">Association UPI ID</div><div className="truncate font-display font-bold">{UPI_ID}</div></div>
                <Button size="sm" variant="ink" onClick={() => { void navigator.clipboard?.writeText(UPI_ID); toast.success("UPI ID copied"); }}><Copy /> Copy</Button>
              </div>
            ) : (
              <div className="space-y-1 rounded-xl border border-dashed border-primary/40 bg-accent p-3 text-xs">
                <div><span className="text-muted-foreground">Account name: </span><span className="font-semibold">Lake View Residents Welfare Assn</span></div>
                <div><span className="text-muted-foreground">A/c no: </span><span className="font-semibold">50200012345678</span> · <span className="text-muted-foreground">IFSC: </span><span className="font-semibold">HDFC0001234</span></div>
              </div>
            )}
          </Tile>
        </Section>
      )}

      {due > 0 && (
        <Section title="2 · Submit your transaction ID">
          <Tile className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount paid (₹)"><input className={inputCls} inputMode="numeric" value={amount} placeholder={String(due)} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} /></Field>
              <Field label={mode === "UPI" ? "UTR / UPI ref" : "Bank ref no."}><input className={inputCls} value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="UTR123456" /></Field>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
              <Paperclip className="size-4" /> {shot || "Attach payment screenshot (optional)"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setShot(e.target.files?.[0]?.name ?? "")} />
            </label>
            <Button variant="brand" size="lg" className="w-full" onClick={submit}>Submit for verification</Button>
            <p className="text-center text-[11px] text-muted-foreground">The same transaction ID can't be submitted twice.</p>
          </Tile>
        </Section>
      )}

      <Section title="Payment history">
        <Tile className="divide-y divide-border py-1">
          {payments.map((p) => (
            <Row key={p.id} left={<span className="grid size-10 place-items-center rounded-xl bg-muted"><ReceiptText className="size-4 text-muted-foreground" /></span>}
              title={`${inr(p.amount)} · ${p.month}`} subtitle={`${p.mode}${p.utr ? ` · ${p.utr}` : ""} · ${p.date}`} right={<Pill>{p.status}</Pill>} />
          ))}
        </Tile>
      </Section>
    </Screen>
  );
}
