import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, ChevronRight, Headset, IndianRupee, Megaphone, ShieldAlert, Siren, Ticket, UserRoundCheck, Users, Wrench } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { Eyebrow, Hero, Initials, Pill, Section, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { ME_FLAT, MONTH, useDemo } from "@/lib/demo-store";
import { dueStatus, pendingAmount } from "@/lib/finance";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/resident/")({
  head: pageHead("Home", "Your dues, visitors, complaints and community updates at a glance."),
  component: ResidentHome,
});

const QUICK = [
  { to: "/resident/visitors", label: "Guest pass", hint: "Pre-approve", icon: Ticket },
  { to: "/resident/pay", label: "Pay dues", hint: "Maintenance", icon: IndianRupee },
  { to: "/resident/complaints", label: "Helpdesk", hint: "Repairs", icon: Wrench },
  { to: "/resident/community", label: "Community", hint: "Events & polls", icon: Users },
] as const;

function ResidentHome() {
  const flat = useDemo((s) => s.flats.find((f) => f.id === ME_FLAT));
  const payments = useDemo((s) => s.payments);
  const visitors = useDemo((s) => s.visitors);
  const complaints = useDemo((s) => s.complaints);
  const notices = useDemo((s) => s.notices);
  const events = useDemo((s) => s.events);
  const notify = useDemo((s) => s.notify);
  const setVisitorStatus = useDemo((s) => s.setVisitorStatus);

  if (!flat) return null;
  const due = pendingAmount(flat.monthly, flat.paid, flat.prevDue);
  const status = dueStatus(flat.monthly, flat.paid, flat.prevDue);
  const pendingPay = payments.find((p) => p.flatId === ME_FLAT && p.status === "Pending");
  const atGate = visitors.find((v) => v.flatId === ME_FLAT && v.status === "Pending");
  const expected = visitors.find((v) => v.flatId === ME_FLAT && v.status === "Approved");
  const active = complaints.find((c) => c.flatId === ME_FLAT && c.status !== "Resolved" && c.status !== "Rejected");
  const nextEvent = events.find((e) => !e.past);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const sos = () => {
    notify("guard", "SOS from A-302", "Priya Sharma pressed SOS. Please go to A-302 now.");
    notify("secretary", "SOS from A-302", "Emergency alert raised by Priya Sharma.");
    toast.success("SOS sent to the gate and the Secretary");
  };

  return (
    <div className="animate-rise space-y-5 px-4 pb-8 pt-1">
      <Tile className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight">{greet}, Priya</h1>
          <p className="truncate text-xs text-muted-foreground">Flat {ME_FLAT} · Block A · {flat.bhk}</p>
        </div>
        <button onClick={sos} className="flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/30 bg-danger-soft px-3 py-2 text-xs font-bold text-destructive">
          <Siren className="size-4" /> SOS Gate
        </button>
      </Tile>

      <div className="grid grid-cols-4 gap-2">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card px-1 py-3 text-center shadow-card">
            <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground"><q.icon className="size-5" /></span>
            <span className="text-[11px] font-bold leading-tight">{q.label}</span>
            <span className="text-[9.5px] leading-tight text-muted-foreground">{q.hint}</span>
          </Link>
        ))}
      </div>

      <Hero>
        <div className="flex items-center justify-between">
          <Eyebrow className="flex items-center gap-1.5 text-ink-foreground/70"><ShieldAlert className="size-3.5" /> Maintenance · {MONTH}</Eyebrow>
          <span className={due === 0 ? "rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground" : "rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold text-destructive-foreground"}>
            {due === 0 ? "Paid in full" : pendingPay ? "Awaiting approval" : status}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-bold">{inr(due === 0 ? flat.monthly : due)}</span>
          <span className="text-xs text-ink-foreground/60">{due === 0 ? "paid this month" : "to pay"}</span>
        </div>
        <p className="mt-1 text-xs text-ink-foreground/60">Monthly {inr(flat.monthly)}{flat.prevDue > 0 ? ` · Previous due ${inr(flat.prevDue)}` : ""} · Due on 10 Nov</p>
        <Button asChild variant="brand" size="lg" className="mt-4 w-full">
          <Link to="/resident/pay">{due === 0 ? "View receipts" : pendingPay ? "Track payment" : "Pay maintenance"}</Link>
        </Button>
      </Hero>

      {atGate && (
        <Tile className="space-y-3 border-warning/40">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-display text-[15px] font-bold"><span className="size-2 animate-pulse rounded-full bg-alert" /> Waiting at the gate</span>
            <Pill tone="warning">Needs approval</Pill>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Initials name={atGate.name} className="rounded-full bg-ink text-ink-foreground" />
            <div className="min-w-0"><div className="truncate text-sm font-bold">{atGate.name}</div><div className="truncate text-xs text-muted-foreground">{atGate.type} · {atGate.purpose}</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => { setVisitorStatus(atGate.id, "Rejected"); notify("guard", "Entry denied", `${ME_FLAT} denied ${atGate.name}.`); toast("Entry denied"); }}>Deny</Button>
            <Button variant="ink" onClick={() => { setVisitorStatus(atGate.id, "Approved"); notify("guard", "Entry approved", `${ME_FLAT} approved ${atGate.name}. Code ${atGate.code}.`); toast.success("Approved — the guard can let them in"); }}>Approve entry</Button>
          </div>
        </Tile>
      )}

      {expected && (
        <Tile className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-display text-[15px] font-bold"><span className="size-2 rounded-full bg-primary" /> Expected visitor</span>
            <Pill tone="success">Pre-approved</Pill>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Initials name={expected.name} className="rounded-full bg-ink text-ink-foreground" />
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{expected.name}</div><div className="truncate text-xs text-muted-foreground">Pass {expected.code} · {expected.purpose}</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => { setVisitorStatus(expected.id, "Rejected"); toast("Pass revoked"); }}>Revoke</Button>
            <Button asChild variant="ink"><Link to="/resident/visitors">Show pass</Link></Button>
          </div>
        </Tile>
      )}

      {active && (
        <Section title="Active request" action={<Link to="/resident/complaints" className="flex items-center text-xs font-bold text-primary">All tickets <ChevronRight className="size-3.5" /></Link>}>
          <Tile className="space-y-2 border-l-4 border-l-primary">
            <div className="flex items-center justify-between gap-2">
              <Eyebrow className="text-muted-foreground">{active.id} · {active.category}</Eyebrow>
              <Pill>{active.status}</Pill>
            </div>
            <p className="text-sm font-semibold">{active.description}</p>
            {active.assigned && (
              <div className="flex items-center gap-2 rounded-xl bg-muted p-2.5 text-xs"><Headset className="size-4 text-primary" /> <span className="font-semibold">{active.assigned}</span> assigned</div>
            )}
          </Tile>
        </Section>
      )}

      <Section title="Estate notices" action={<Link to="/resident/community" className="text-xs font-bold text-primary">View all</Link>}>
        <div className="space-y-2.5">
          {notices.slice(0, 2).map((n) => (
            <Tile key={n.id} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-destructive"><Megaphone className="size-[18px]" /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><Pill>{n.tag}</Pill><span className="text-[11px] text-muted-foreground">{n.date}</span></div>
                <div className="mt-1 text-sm font-bold">{n.title}</div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
              </div>
            </Tile>
          ))}
        </div>
      </Section>

      {nextEvent && (
        <Section title="Society spotlight">
          <Link to="/resident/community" className="block overflow-hidden rounded-3xl surface-ink p-5 shadow-card">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-foreground/10 px-2.5 py-1 text-[11px] font-semibold"><CalendarDays className="size-3.5" /> {nextEvent.date}</span>
            <div className="mt-6 font-display text-xl font-bold">{nextEvent.title}</div>
            <div className="mt-1 text-xs text-ink-foreground/70">{nextEvent.venue} · {nextEvent.going} going{nextEvent.my ? ` · You: ${nextEvent.my}` : ""}</div>
          </Link>
        </Section>
      )}

      <Tile className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl surface-ink"><UserRoundCheck className="size-5" /></span>
        <div className="min-w-0 flex-1"><div className="text-sm font-bold">24/7 gate & facility desk</div><div className="text-xs text-muted-foreground">Intercom #100 · Gate 1 #104</div></div>
        <Button size="sm" variant="alert" onClick={() => toast("Calling the gate desk…")}>Call</Button>
      </Tile>
    </div>
  );
}
