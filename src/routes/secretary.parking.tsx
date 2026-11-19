import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Camera, Car } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { BottomSheet, Empty, Field, NativeSelect, Pill, Row, Screen, Segmented, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo, type Slot } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/secretary/parking")({
  head: pageHead("Parking & vehicles", "Assign parking slots, approve vehicles and handle wrong parking."),
  component: Parking,
});

function Parking() {
  const s = useDemo();
  const [tab, setTab] = useState<"slots" | "vehicles" | "reports">("slots");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [report, setReport] = useState(false);
  const types: Slot["type"][] = ["Car", "Bike", "Visitor"];

  return (
    <Screen title="Parking" subtitle={`${s.slots.filter((x) => x.flatId).length}/${s.slots.length} slots occupied`}>
      <Segmented value={tab} onChange={setTab} options={[
        { value: "slots", label: "Slots" },
        { value: "vehicles", label: "Vehicles", count: s.vehicles.filter((v) => v.status === "Pending").length },
        { value: "reports", label: "Wrong parking", count: s.parkingReports.filter((r) => r.status === "Open").length },
      ]} />

      {tab === "slots" && types.map((t) => {
        const list = s.slots.filter((x) => x.type === t);
        return (
          <div key={t} className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <span>{t} slots</span><span>{list.filter((x) => !x.flatId).length} free</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {list.map((x) => (
                <button key={x.id} onClick={() => setSlot(x)} className={cn("rounded-xl border p-2 text-left", x.flatId ? "border-ink bg-ink text-ink-foreground" : "border-dashed border-border bg-card")}>
                  <div className="text-[11px] font-bold">{x.id}</div>
                  <div className={cn("text-[10px]", x.flatId ? "text-ink-foreground/70" : "text-muted-foreground")}>{x.flatId ?? "Free"}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {tab === "vehicles" && (
        <Tile className="divide-y divide-border py-1">
          {s.vehicles.map((v) => (
            <Row key={v.id} left={<span className="grid size-10 place-items-center rounded-xl bg-muted"><Car className="size-4 text-muted-foreground" /></span>}
              title={v.number} subtitle={`${v.model} · ${v.flatId} · ${v.owner}`}
              right={v.status === "Pending"
                ? <Button size="sm" variant="brand" onClick={() => { s.approveVehicle(v.id); toast.success("Vehicle approved"); }}>Approve</Button>
                : <Pill>{v.type}</Pill>} />
          ))}
        </Tile>
      )}

      {tab === "reports" && (
        <div className="space-y-2.5">
          <Button variant="brand" className="w-full" onClick={() => setReport(true)}><AlertTriangle /> Report wrong parking</Button>
          {s.parkingReports.length === 0 && <Empty>No reports.</Empty>}
          {s.parkingReports.map((r) => (
            <Tile key={r.id} className="space-y-2">
              <div className="flex items-center justify-between"><span className="font-mono text-sm font-semibold">{r.vehicle}</span><Pill>{r.status}</Pill></div>
              <p className="text-sm text-muted-foreground">{r.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{r.flatId} · {r.date}</span>
                {r.status === "Open" && <Button size="sm" variant="outline" onClick={() => { s.resolveParking(r.id); toast.success("Marked resolved"); }}>Mark resolved</Button>}
              </div>
            </Tile>
          ))}
        </div>
      )}

      <BottomSheet open={!!slot} onClose={() => setSlot(null)} title={`Slot ${slot?.id}`}>
        {slot && (
          <div className="space-y-3.5">
            <Field label="Assigned flat">
              <NativeSelect value={slot.flatId ?? "— Free —"} onChange={(v) => setSlot({ ...slot, flatId: v === "— Free —" ? undefined : v })} options={["— Free —", ...s.flats.map((f) => f.id)]} />
            </Field>
            <Button variant="brand" size="lg" className="w-full" onClick={() => { s.assignSlot(slot.id, slot.flatId); toast.success(slot.flatId ? `${slot.id} assigned to ${slot.flatId}` : `${slot.id} freed`); setSlot(null); }}>Save</Button>
          </div>
        )}
      </BottomSheet>
      <ReportSheet open={report} onClose={() => setReport(false)} />
    </Screen>
  );
}

function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useDemo();
  const [vehicle, setVehicle] = useState(s.vehicles[0]?.number ?? "");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const v = s.vehicles.find((x) => x.number === vehicle);
  return (
    <BottomSheet open={open} onClose={onClose} title="Wrong parking">
      <div className="space-y-3.5">
        <Field label="Vehicle"><NativeSelect value={vehicle} onChange={setVehicle} options={s.vehicles.map((x) => x.number)} /></Field>
        <div className="text-xs text-muted-foreground">Flat: <b className="text-foreground">{v?.flatId}</b> · {v?.owner}</div>
        <Field label="What happened"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Blocking the driveway" /></Field>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
          <Camera className="size-4" /> {photo || "Add parking photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0]?.name ?? "")} />
        </label>
        <Button variant="brand" size="lg" className="w-full" onClick={() => {
          if (!v || !description) return void toast.error("Add a short description.");
          s.reportParking({ vehicle, flatId: v.flatId, description });
          toast.success(`Report sent to ${v.flatId}`);
          setDescription(""); setPhoto(""); onClose();
        }}>Send to resident</Button>
      </div>
    </BottomSheet>
  );
}
