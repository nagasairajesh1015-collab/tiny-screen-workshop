import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, CarFront, ClipboardList, IndianRupee, Landmark, Megaphone, Receipt, Send, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Eyebrow, Hero, Pill, Ring, Row, Screen, Section, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { MONTH, useDemo } from "@/lib/demo-store";
import { pendingAmount } from "@/lib/finance";
import { inr } from "@/lib/format";
import { useSummary } from "@/lib/use-summary";

export const Route = createFileRoute("/secretary/")({
  head: pageHead("Secretary dashboard", "Collections, balances, approvals and complaints for your apartment."),
  component: SecretaryHome,
});

function SecretaryHome() {
  const s = useSummary();
  const payments = useDemo((x) => x.payments);
  const flats = useDemo((x) => x.flats);
  const complaints = useDemo((x) => x.complaints);
  const visitors = useDemo((x) => x.visitors);
  const sendReminders = useDemo((x) => x.sendReminders);
  const pendingPay = payments.filter((p) => p.status === "Pending").length;
  const pendingReg = flats.filter((f) => f.reg === "Pending").length;
  const openC = complaints.filter((c) => c.status !== "Resolved" && c.status !== "Rejected");
  const overdue = flats.filter((f) => f.status !== "Vacant" && f.reg === "Approved" && pendingAmount(f.monthly, f.paid, f.prevDue) > 0);
  const pct = s.expected > 0 ? (s.collections / s.expected) * 100 : 0;

  const actions = [
    { to: "/secretary/maintenance", label: "Verify payments", count: pendingPay },
    { to: "/secretary/residents", label: "Resident approvals", count: pendingReg },
    { to: "/secretary/complaints", label: "Open complaints", count: openC.length },
  ] as const;

  const quick = [
    { to: "/secretary/maintenance", label: "Collections", icon: BadgeCheck },
    { to: "/secretary/residents", label: "Residents", icon: UserCheck },
    { to: "/secretary/expenses", label: "Expenses", icon: Receipt },
    { to: "/secretary/visitors", label: "Visitors", icon: Users },
    { to: "/secretary/community", label: "Notices", icon: Megaphone },
    { to: "/secretary/parking", label: "Parking", icon: CarFront },
  ] as const;

  return (
    <Screen title="Executive operations" subtitle={`Good evening, Arvind · ${MONTH}`}>
      <Hero className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Eyebrow className="text-ink-foreground/70">Monthly collection rate</Eyebrow>
            <div className="mt-1 font-display text-4xl font-bold">{Math.round(pct)}<span className="text-2xl text-alert">%</span></div>
            <div className="mt-1 text-xs text-ink-foreground/70">{inr(s.collections)} collected of {inr(s.expected)}</div>
          </div>
          <Ring value={pct} size={68}><IndianRupee className="size-5 text-alert" /></Ring>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-ink-foreground/10 bg-ink-foreground/5 p-3">
          <span className="grid size-10 place-items-center rounded-xl bg-ink-foreground/10"><Landmark className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <Eyebrow className="text-ink-foreground/60">Closing balance</Eyebrow>
            <div className="font-display text-lg font-semibold">{inr(s.closing)}</div>
          </div>
          <div className="text-right text-[11px] leading-tight text-ink-foreground/70">
            <div>Cash {inr(s.cash)}</div>
            <div>Bank {inr(s.bank)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold"><AlertTriangle className="size-4 text-alert" /> {overdue.length} flats overdue · {inr(s.pending)}</span>
          <Button size="sm" variant="brand" disabled={overdue.length === 0} onClick={() => { sendReminders(overdue.map((f) => f.id)); toast.success(`Reminders sent to ${overdue.length} flats`); }}>
            <Send /> Send {overdue.length} reminders
          </Button>
        </div>
      </Hero>

      <Section title="Action center" action={<span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">{pendingPay + pendingReg + openC.length} pending</span>}>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {actions.map((a, i) => (
            <Link key={a.label} to={a.to} className={i === 0 ? "flex shrink-0 items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-ink-foreground" : "flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold"}>
              {a.label}
              <span className="grid min-w-5 place-items-center rounded-full bg-alert px-1 text-[10px] font-bold text-destructive-foreground">{a.count}</span>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-3 gap-2.5">
        {quick.map((q) => (
          <Link key={q.label} to={q.to} className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card px-2 py-3.5 text-center shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"><q.icon className="size-5" /></span>
            <span className="text-[11px] font-semibold leading-tight">{q.label}</span>
          </Link>
        ))}
      </div>

      <Section title="Open complaints" action={<Link to="/secretary/complaints" className="text-xs font-semibold text-primary">View all</Link>}>
        <Tile className="divide-y divide-border py-1">
          {openC.length === 0 && <div className="py-3 text-sm text-muted-foreground">No open complaints.</div>}
          {openC.slice(0, 3).map((c) => (
            <Row key={c.id} left={<span className="grid size-10 place-items-center rounded-xl bg-muted"><ClipboardList className="size-4 text-muted-foreground" /></span>}
              title={`${c.category} · ${c.flatId}`} subtitle={c.description} right={<Pill>{c.priority}</Pill>} />
          ))}
        </Tile>
      </Section>

      <Section title="Visitors today" action={<Link to="/secretary/visitors" className="text-xs font-semibold text-primary">Gate log</Link>}>
        <div className="grid grid-cols-3 gap-2">
          {([["Today", visitors.filter((v) => v.date === "Today").length], ["Inside", visitors.filter((v) => v.status === "Inside").length], ["Pending", visitors.filter((v) => v.status === "Pending").length]] as const).map(([l, n]) => (
            <Tile key={l} className="p-3 text-center">
              <div className="font-display text-xl font-bold">{n}</div>
              <div className="text-[11px] font-semibold text-muted-foreground">{l}</div>
            </Tile>
          ))}
        </div>
      </Section>
    </Screen>
  );
}
