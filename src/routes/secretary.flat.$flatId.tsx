import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BellRing, Car, Download, Phone } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { NativeSelect, Pill, Row, Section, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo, type FlatStatus } from "@/lib/demo-store";
import { dueStatus, pendingAmount } from "@/lib/finance";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/secretary/flat/$flatId")({
  head: ({ params }) => pageHead(`Flat ${params.flatId}`, `Owner, tenant, dues, vehicles and history for flat ${params.flatId}.`)(),
  component: FlatDetail,
  notFoundComponent: () => <div className="p-6 text-sm">Flat not found.</div>,
});

function FlatDetail() {
  const { flatId } = Route.useParams();
  const s = useDemo();
  const f = s.flats.find((x) => x.id === flatId);
  if (!f) throw notFound();
  const pays = s.payments.filter((p) => p.flatId === f.id);
  const vehicles = s.vehicles.filter((v) => v.flatId === f.id);
  const complaints = s.complaints.filter((c) => c.flatId === f.id);
  const visitors = s.visitors.filter((v) => v.flatId === f.id);
  const due = pendingAmount(f.monthly, f.paid, f.prevDue);

  return (
    <div className="animate-rise space-y-5 px-4 pb-8 pt-4">
      <Link to="/secretary/residents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> All flats</Link>
      <div className="rounded-3xl surface-ink p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-ink-foreground/60">Block {f.block} · Floor {f.floor} · {f.bhk}</div>
            <div className="font-display text-3xl font-semibold">{f.id}</div>
          </div>
          <Pill>{f.status}</Pill>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["Monthly", inr(f.monthly)], ["Paid", inr(f.paid)], ["Pending", inr(due)]].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-ink-foreground/10 py-2"><div className="text-[10px] uppercase tracking-wider text-ink-foreground/60">{l}</div><div className="text-sm font-semibold">{v}</div></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="coral" disabled={due === 0} onClick={() => { s.sendReminders([f.id]); toast.success("Reminder sent"); }}><BellRing /> Remind</Button>
        <Button variant="outline" onClick={() => toast.success(`${f.id} statement ready (demo)`)}><Download /> Statement</Button>
      </div>

      <Section title="People">
        <Tile className="divide-y divide-border py-1">
          <Row title={f.owner} subtitle="Owner" right={<a href={`tel:${f.phone}`} className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Phone className="size-4" /></a>} />
          {f.tenant && <Row title={f.tenant} subtitle="Current tenant" right={<Pill>Rented</Pill>} />}
          {f.tenant && <Row title="Previous: Harish B." subtitle="Tenant · Mar 2024 – Feb 2026" />}
        </Tile>
      </Section>

      <Section title="Flat status">
        <Tile className="space-y-3">
          <NativeSelect value={f.status} onChange={(v) => { s.updateFlat(f.id, { status: v as FlatStatus }); toast.success(`Marked ${v}`); }} options={["Occupied", "Vacant", "Rented", "Under Maintenance"]} />
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Registration</span><Pill>{f.reg}</Pill></div>
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Dues status</span><Pill>{dueStatus(f.monthly, f.paid, f.prevDue)}</Pill></div>
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Parking slot</span><span className="font-semibold">{f.slot ?? "Not assigned"}</span></div>
        </Tile>
      </Section>

      <Section title="Payments">
        <Tile className="divide-y divide-border py-1">
          {pays.length === 0 && <div className="py-3 text-sm text-muted-foreground">No payments yet.</div>}
          {pays.map((p) => <Row key={p.id} title={`${inr(p.amount)} · ${p.month}`} subtitle={`${p.mode} · ${p.date}`} right={<Pill>{p.status}</Pill>} />)}
        </Tile>
      </Section>

      <Section title="Vehicles">
        <Tile className="divide-y divide-border py-1">
          {vehicles.length === 0 && <div className="py-3 text-sm text-muted-foreground">No vehicles registered.</div>}
          {vehicles.map((v) => <Row key={v.id} left={<Car className="size-5 text-muted-foreground" />} title={v.number} subtitle={`${v.model} · ${v.type}`} right={<Pill>{v.status}</Pill>} />)}
        </Tile>
      </Section>

      <Section title="Complaints & visitors">
        <Tile className="divide-y divide-border py-1">
          {complaints.map((c) => <Row key={c.id} title={`${c.id} · ${c.category}`} subtitle={c.date} right={<Pill>{c.status}</Pill>} />)}
          {visitors.slice(0, 3).map((v) => <Row key={v.id} title={v.name} subtitle={`${v.type} · ${v.date}`} right={<Pill>{v.status}</Pill>} />)}
          {complaints.length + visitors.length === 0 && <div className="py-3 text-sm text-muted-foreground">No history yet.</div>}
        </Tile>
      </Section>

      <Button variant="ghost" className="w-full text-destructive" onClick={() => { s.updateFlat(f.id, { reg: "Deactivated" }); toast("Flat registration deactivated"); }}>Deactivate registration</Button>
    </div>
  );
}
