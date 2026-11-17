import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, CarFront, ClipboardList, Megaphone, Receipt, UserCheck, Users, Wallet } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { Pill, Progress, Row, Screen, Section, Tile } from "@/components/mobile/kit";
import { MONTH, useDemo } from "@/lib/demo-store";
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
  const pendingPay = payments.filter((p) => p.status === "Pending").length;
  const pendingReg = flats.filter((f) => f.reg === "Pending").length;
  const openC = complaints.filter((c) => c.status !== "Resolved" && c.status !== "Rejected");
  const pct = (s.collections / s.expected) * 100;

  const quick = [
    { to: "/secretary/maintenance", label: "Verify payments", icon: BadgeCheck, badge: pendingPay },
    { to: "/secretary/residents", label: "Approvals", icon: UserCheck, badge: pendingReg },
    { to: "/secretary/expenses", label: "Expenses", icon: Receipt },
    { to: "/secretary/visitors", label: "Visitors", icon: Users, badge: visitors.filter((v) => v.status === "Pending").length },
    { to: "/secretary/community", label: "Notices", icon: Megaphone },
    { to: "/secretary/parking", label: "Parking", icon: CarFront },
  ] as const;

  return (
    <Screen title="Good evening, Arvind" subtitle={`${MONTH} · 16 flats`}>
      <div className="rounded-3xl surface-ink p-5 shadow-card">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-foreground/70">
          <span className="flex items-center gap-1.5"><Wallet className="size-4" /> Closing balance</span>
          <span>{MONTH}</span>
        </div>
        <div className="mt-1 font-display text-3xl font-semibold">{inr(s.closing)}</div>
        <div className="mt-1 text-[11px] text-ink-foreground/60">Opening {inr(s.opening)} + collected {inr(s.collections)} − spent {inr(s.expenses)}</div>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs"><span>Collected this month</span><span className="font-semibold">{Math.round(pct)}%</span></div>
          <Progress value={pct} className="bg-ink-foreground/15" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["Cash", s.cash], ["Bank", s.bank], ["Pending", s.pending]].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl bg-ink-foreground/10 py-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-foreground/60">{l}</div>
              <div className="text-sm font-semibold">{inr(v as number)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {quick.map((q) => (
          <Link key={q.to + q.label} to={q.to} className="relative flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card px-2 py-3.5 text-center shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"><q.icon className="size-5" /></span>
            <span className="text-[11px] font-semibold leading-tight">{q.label}</span>
            {"badge" in q && q.badge > 0 && <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{q.badge}</span>}
          </Link>
        ))}
      </div>

      <Section title="Open complaints" action={<Link to="/secretary/complaints" className="text-xs font-semibold text-primary">See all</Link>}>
        <Tile className="divide-y divide-border py-1">
          {openC.slice(0, 3).map((c) => (
            <Row key={c.id} left={<span className="grid size-10 place-items-center rounded-xl bg-muted"><ClipboardList className="size-4 text-muted-foreground" /></span>}
              title={`${c.category} · ${c.flatId}`} subtitle={c.description} right={<Pill>{c.priority}</Pill>} />
          ))}
        </Tile>
      </Section>
    </Screen>
  );
}
