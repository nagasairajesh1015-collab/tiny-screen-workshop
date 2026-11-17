import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Building, Home, KeyRound, Users } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Pill, Screen, Section, Stat, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/admin/")({
  head: pageHead("Admin dashboard", "Monitor apartments, users and approvals across ResiCore."),
  component: AdminHome,
});

const DAU = [62, 70, 66, 81, 77, 90, 96, 88, 102, 110, 104, 121];

function AdminHome() {
  const apartments = useDemo((s) => s.apartments);
  const setStatus = useDemo((s) => s.setApartmentStatus);
  const pending = apartments.filter((a) => a.status === "Pending");
  const active = apartments.filter((a) => a.status === "Active");
  const max = Math.max(...DAU);

  return (
    <Screen title="Overview" subtitle="All apartments on ResiCore">
      <div className="grid grid-cols-2 gap-2.5">
        <Stat label="Apartments" value={apartments.length} hint={`${active.length} active`} icon={<Building />} tone="coral" />
        <Stat label="Users" value="1,284" hint="+42 this week" icon={<Users />} tone="info" />
        <Stat label="Owners" value="836" icon={<Home />} tone="success" />
        <Stat label="Tenants" value="448" icon={<KeyRound />} tone="warning" />
      </div>

      <Tile className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" /> Daily active users</div>
          <span className="text-xs text-muted-foreground">Last 12 days</span>
        </div>
        <div className="flex h-24 items-end gap-1.5">
          {DAU.map((v, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-primary/80" style={{ height: `${(v / max) * 100}%`, opacity: 0.45 + (i / DAU.length) * 0.55 }} />
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Monthly active: <b className="text-foreground">1,021</b></div>
      </Tile>

      <Section title={`Waiting for approval (${pending.length})`} action={<Link to="/admin/apartments" className="text-xs font-semibold text-primary">See all</Link>}>
        {pending.length === 0 && <Tile className="text-sm text-muted-foreground">All caught up.</Tile>}
        {pending.map((a) => (
          <Tile key={a.id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.city} · {a.blocks} blocks · {a.flats} flats</div>
                <div className="text-xs text-muted-foreground">Secretary: {a.secretary}</div>
              </div>
              <Pill>Pending</Pill>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setStatus(a.id, "Rejected"); toast(`${a.name} rejected`); }}>Reject</Button>
              <Button variant="coral" onClick={() => { setStatus(a.id, "Active"); toast.success(`${a.name} approved — Secretary notified`); }}>Approve</Button>
            </div>
          </Tile>
        ))}
      </Section>

      <Section title="Recent activity">
        <Tile className="divide-y divide-border py-1">
          {["Green Meadows sent 118 dues reminders", "Lake View Residency approved 2 payments", "Riverside Towers added 3 flats", "Palm Heights registered"].map((t, i) => (
            <div key={i} className="py-2.5 text-sm">{t}<div className="text-[11px] text-muted-foreground">{i + 1}h ago</div></div>
          ))}
        </Tile>
      </Section>
    </Screen>
  );
}
