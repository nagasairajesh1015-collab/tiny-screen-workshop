import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Building, Clock, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Eyebrow, Hero, Pill, Screen, Section, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/admin/")({
  head: pageHead("Admin dashboard", "Monitor apartments, users and approvals across ResiCore."),
  component: AdminHome,
});

const DAU = [62, 70, 66, 81, 77, 90, 96, 88, 102, 110, 104, 121];
const USERS = { owners: 836, tenants: 448, secretaries: 12 };

function AdminHome() {
  const apartments = useDemo((s) => s.apartments);
  const setStatus = useDemo((s) => s.setApartmentStatus);
  const pending = apartments.filter((a) => a.status === "Pending");
  const active = apartments.filter((a) => a.status === "Active");
  const held = apartments.filter((a) => a.status === "Deactivated" || a.status === "Rejected");
  const max = Math.max(...DAU);
  const total = USERS.owners + USERS.tenants + USERS.secretaries;

  return (
    <Screen title="Platform operations" subtitle="Every apartment on ResiCore">
      <Hero className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-foreground/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"><span className="size-1.5 rounded-full bg-success" /> Live</span>
          <span className="text-[11px] font-semibold text-ink-foreground/70">99.98% uptime</span>
        </div>
        <div>
          <Eyebrow className="text-ink-foreground/60">Live governance</Eyebrow>
          <div className="mt-1 font-display text-2xl font-bold leading-tight">Platform health & approvals</div>
        </div>
        <Button asChild variant="brand" size="lg" className="w-full">
          <Link to="/register"><Plus /> Onboard an apartment</Link>
        </Button>
      </Hero>

      {pending.length > 0 && (
        <Section title="Needs your review" action={<Link to="/admin/apartments" className="text-xs font-semibold text-primary">View all</Link>}>
          {pending.map((a, i) => (
            <Tile key={a.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><ShieldAlert className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Priority {i + 1}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="size-3" /> Waiting</span>
                  </div>
                  <div className="mt-1 font-display font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.city} · {a.blocks} blocks · {a.flats} flats</div>
                  <div className="text-xs text-muted-foreground">Submitted by {a.secretary}</div>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button variant="brand" onClick={() => { setStatus(a.id, "Active"); toast.success(`${a.name} approved — Secretary notified`); }}><ShieldCheck /> Approve</Button>
                <Button variant="secondary" onClick={() => { setStatus(a.id, "Rejected"); toast(`${a.name} rejected`); }}>Reject</Button>
              </div>
            </Tile>
          ))}
        </Section>
      )}

      <Section title="Platform scale">
        <div className="grid grid-cols-2 gap-2.5">
          {([["Total apartments", apartments.length, Building], ["Approved & active", active.length, ShieldCheck], ["Awaiting review", pending.length, Clock], ["Rejected / held", held.length, ShieldAlert]] as const).map(([l, v, Icon]) => (
            <Tile key={l} className="p-3.5">
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-4" /></span>
              <div className="mt-3 font-display text-2xl font-bold">{v}</div>
              <div className="text-xs font-medium text-muted-foreground">{l}</div>
            </Tile>
          ))}
        </div>
      </Section>

      <Tile className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-semibold">Resident ecosystem</span>
          <span className="font-display text-xl font-bold">{total.toLocaleString("en-IN")} <span className="text-xs font-medium text-muted-foreground">users</span></span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="bg-ink" style={{ width: `${(USERS.owners / total) * 100}%` }} />
          <div className="bg-alert" style={{ width: `${(USERS.tenants / total) * 100}%` }} />
          <div className="bg-warning" style={{ width: `${(USERS.secretaries / total) * 100}%` }} />
        </div>
        <div className="grid grid-cols-3 text-xs">
          {([["Owners", USERS.owners, "bg-ink"], ["Tenants", USERS.tenants, "bg-alert"], ["Secretaries", USERS.secretaries, "bg-warning"]] as const).map(([l, n, c]) => (
            <div key={l}>
              <div className="flex items-center gap-1.5 font-semibold text-muted-foreground"><span className={`size-2 rounded-full ${c}`} />{l}</div>
              <div className="font-display text-base font-bold">{n}</div>
            </div>
          ))}
        </div>
      </Tile>

      <Tile className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" /> Daily active users</div>
          <span className="text-xs text-muted-foreground">Last 12 days</span>
        </div>
        <div className="flex h-24 items-end gap-1.5">
          {DAU.map((v, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-alert" style={{ height: `${(v / max) * 100}%`, opacity: 0.35 + (i / DAU.length) * 0.65 }} />
          ))}
        </div>
      </Tile>

      <Section title="Recently onboarded" action={<Link to="/admin/apartments" className="text-xs font-semibold text-primary">Directory</Link>}>
        <Tile className="divide-y divide-border py-1">
          {active.slice(0, 4).map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{a.name}</div>
                <div className="text-[11px] text-muted-foreground">{a.city} · {a.flats} flats</div>
              </div>
              <Pill tone="success">Live</Pill>
            </div>
          ))}
        </Tile>
      </Section>
    </Screen>
  );
}
