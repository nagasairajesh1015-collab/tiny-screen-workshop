import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Car, Search } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { Field, inputCls, NativeSelect, Pill, Row, Screen, Section, Segmented, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo, type Visitor } from "@/lib/demo-store";
import { normalizePlate } from "@/lib/gate";

export const Route = createFileRoute("/guard/entry")({
  head: pageHead("New gate entry", "Log a visitor, delivery or cab and ask the flat for approval."),
  component: NewEntry,
});

const TYPES: { value: Visitor["type"]; label: string }[] = [
  { value: "Guest", label: "Guest" }, { value: "Delivery", label: "Delivery" }, { value: "Cab", label: "Cab" },
  { value: "Service Provider", label: "Service" }, { value: "Other", label: "Other" },
];

function NewEntry() {
  const flats = useDemo((s) => s.flats).filter((f) => f.status !== "Vacant");
  const vehicles = useDemo((s) => s.vehicles);
  const addVisitor = useDemo((s) => s.addVisitor);
  const navigate = useNavigate();
  const [type, setType] = useState<Visitor["type"]>("Delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatId, setFlatId] = useState(flats[0]?.id ?? "");
  const [purpose, setPurpose] = useState("");
  const [plate, setPlate] = useState("");
  const q = normalizePlate(plate);
  const matches = q.length >= 3 ? vehicles.filter((v) => normalizePlate(v.number).includes(q)) : [];

  const save = () => {
    if (!name.trim()) return void toast.error("Enter the visitor's name.");
    if (!flatId) return void toast.error("Choose the flat they are visiting.");
    addVisitor({ name: name.trim(), phone: phone || "—", flatId, type, purpose: purpose || type });
    toast.success(`Approval request sent to ${flatId}`);
    void navigate({ to: "/guard" });
  };

  return (
    <Screen title="New gate entry" subtitle="The flat gets a request to approve">
      <Segmented value={type} onChange={setType} options={TYPES} />
      <Tile className="space-y-3.5">
        <Field label={type === "Delivery" ? "Company / person" : type === "Cab" ? "Cab & vehicle no." : "Visitor name"}>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "Delivery" ? "Swiggy — Ramesh" : "Full name"} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input className={inputCls} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" /></Field>
          <Field label="Visiting flat"><NativeSelect value={flatId} onChange={setFlatId} options={flats.map((f) => f.id)} /></Field>
        </div>
        <Field label="Purpose"><input className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Food delivery, AC repair…" /></Field>
        <Button variant="alert" size="lg" className="w-full" onClick={save}>Request approval</Button>
      </Tile>

      <Section title="Vehicle lookup">
        <Tile className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className={`${inputCls} pl-9`} value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="Search number plate, e.g. 4512" aria-label="Number plate" />
          </div>
          {q.length >= 3 && matches.length === 0 && <div className="rounded-xl bg-danger-soft p-3 text-xs font-semibold text-destructive">Not a registered resident vehicle — treat as a visitor.</div>}
          <div className="divide-y divide-border">
            {matches.map((v) => (
              <Row key={v.id} left={<span className="grid size-10 place-items-center rounded-xl surface-ink"><Car className="size-4" /></span>}
                title={v.number} subtitle={`${v.model} · ${v.owner} · Flat ${v.flatId}`} right={<Pill>{v.status}</Pill>} />
            ))}
          </div>
        </Tile>
      </Section>
    </Screen>
  );
}
