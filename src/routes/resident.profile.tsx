import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Car, LogOut, Phone, Plus, SquareParking, TriangleAlert } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { BottomSheet, Eyebrow, Field, Hero, Initials, inputCls, NativeSelect, Pill, Row, Screen, Section, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { APARTMENT, ME_FLAT, useDemo, type Vehicle } from "@/lib/demo-store";

export const Route = createFileRoute("/resident/profile")({
  head: pageHead("My profile", "Your flat, household, vehicles and parking details."),
  component: Profile,
});

function Profile() {
  const flat = useDemo((s) => s.flats.find((f) => f.id === ME_FLAT));
  const vehicles = useDemo((s) => s.vehicles).filter((v) => v.flatId === ME_FLAT);
  const reports = useDemo((s) => s.parkingReports).filter((r) => r.flatId === ME_FLAT && r.status === "Open");
  const removeVehicle = useDemo((s) => s.removeVehicle);
  const [adding, setAdding] = useState(false);
  if (!flat) return null;

  return (
    <Screen title="My profile" subtitle="Flat, household and vehicles">
      <Hero className="flex items-center gap-4">
        <Initials name={flat.owner} className="size-16 rounded-2xl bg-primary text-xl text-primary-foreground" />
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-bold">{flat.owner}</div>
          <div className="text-xs text-ink-foreground/70">Owner · Flat {flat.id} · {APARTMENT}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink-foreground/10 px-2.5 py-1 text-[11px]"><Phone className="size-3" /> {flat.phone}</div>
        </div>
      </Hero>

      <div className="grid grid-cols-3 gap-2">
        {[["Block", flat.block], ["Floor", String(flat.floor)], ["Type", flat.bhk]].map(([l, v]) => (
          <Tile key={l} className="p-3 text-center"><Eyebrow className="text-muted-foreground">{l}</Eyebrow><div className="mt-1 font-display font-bold">{v}</div></Tile>
        ))}
      </div>

      <Section title="Parking">
        <Tile className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl surface-ink"><SquareParking className="size-5" /></span>
          <div className="flex-1"><div className="text-sm font-bold">{flat.slot ? `Slot ${flat.slot}` : "No slot assigned"}</div><div className="text-xs text-muted-foreground">Assigned by the Secretary</div></div>
          <Pill tone={flat.slot ? "success" : "muted"}>{flat.slot ? "Active" : "Free"}</Pill>
        </Tile>
        {reports.map((r) => (
          <Tile key={r.id} className="flex gap-3 border-destructive/30 bg-danger-soft">
            <TriangleAlert className="size-5 shrink-0 text-destructive" />
            <div className="text-xs"><div className="font-bold text-destructive">Wrong parking report · {r.vehicle}</div><div className="text-foreground/80">{r.description}</div></div>
          </Tile>
        ))}
      </Section>

      <Section title="My vehicles" action={<Button size="sm" variant="ink" onClick={() => setAdding(true)}><Plus /> Add</Button>}>
        <Tile className="divide-y divide-border py-1">
          {vehicles.map((v) => (
            <Row key={v.id} left={<span className="grid size-10 place-items-center rounded-xl bg-muted"><Car className="size-4 text-muted-foreground" /></span>}
              title={v.number} subtitle={`${v.model} · ${v.type}`}
              right={<div className="flex items-center gap-2"><Pill>{v.status}</Pill><button className="text-xs font-semibold text-destructive" onClick={() => { removeVehicle(v.id); toast("Vehicle removed"); }}>Remove</button></div>} />
          ))}
          {vehicles.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No vehicles added.</div>}
        </Tile>
      </Section>

      <Button asChild variant="secondary" size="lg" className="w-full"><Link to="/"><LogOut /> Switch role</Link></Button>
      <AddVehicle open={adding} onClose={() => setAdding(false)} owner={flat.owner} />
    </Screen>
  );
}

function AddVehicle({ open, onClose, owner }: { open: boolean; onClose: () => void; owner: string }) {
  const addVehicle = useDemo((s) => s.addVehicle);
  const [number, setNumber] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<Vehicle["type"]>("Car");
  return (
    <BottomSheet open={open} onClose={onClose} title="Add vehicle">
      <div className="space-y-3.5">
        <Field label="Number plate"><input className={inputCls} value={number} onChange={(e) => setNumber(e.target.value.toUpperCase())} placeholder="TS 09 AB 1234" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Model"><input className={inputCls} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Honda City" /></Field>
          <Field label="Type"><NativeSelect value={type} onChange={(v) => setType(v as Vehicle["type"])} options={["Car", "Bike", "Scooter", "Other"]} /></Field>
        </div>
        <Button variant="brand" size="lg" className="w-full" onClick={() => {
          if (!number.trim()) return void toast.error("Enter the number plate.");
          addVehicle({ number: number.trim(), model: model || type, type, flatId: ME_FLAT, owner });
          toast.success("Sent to the Secretary for approval");
          setNumber(""); setModel(""); onClose();
        }}>Add vehicle</Button>
      </div>
    </BottomSheet>
  );
}
