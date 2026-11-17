import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Phone, Siren } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Initials, Pill, Row, Screen, Segmented, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDemo } from "@/lib/demo-store";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/secretary/operations")({
  head: pageHead("Operations", "Staff attendance, amenities, documents and emergency contacts."),
  component: Operations,
});

const AMENITIES = [
  { name: "Clubhouse", hours: "6 AM – 10 PM", booked: "Sat 6 PM · A-202" },
  { name: "Gym", hours: "5 AM – 10 PM", booked: "Open access" },
  { name: "Swimming pool", hours: "6 AM – 9 PM", booked: "Closed Mon" },
  { name: "Community hall", hours: "On booking", booked: "30 Nov · AGM" },
];
const EMERGENCY = [["Ambulance", "108"], ["Fire department", "101"], ["Police", "100"], ["Apollo Hospital", "040 2360 7777"], ["Gate security", "+91 90001 10001"]];
const DOCS = ["Association bye-laws.pdf", "AGM minutes — Aug 2026.pdf", "Lift AMC agreement.pdf", "Fire NOC 2026.pdf"];

function Operations() {
  const staff = useDemo((s) => s.staff);
  const toggleStaff = useDemo((s) => s.toggleStaff);
  const notify = useDemo((s) => s.notify);
  const [tab, setTab] = useState<"staff" | "amenities" | "emergency" | "docs">("staff");

  return (
    <Screen title="Operations" subtitle="Staff, amenities and safety">
      <Segmented value={tab} onChange={setTab} options={[
        { value: "staff", label: "Staff" }, { value: "amenities", label: "Amenities" }, { value: "emergency", label: "Emergency" }, { value: "docs", label: "Documents" },
      ]} />
      {tab === "staff" && (
        <Tile className="divide-y divide-border py-1">
          {staff.map((p) => (
            <Row key={p.id} left={<Initials name={p.name} />} title={p.name} subtitle={`${p.role} · ${p.shift} · ${inr(p.salary)}/mo`}
              right={<div className="flex items-center gap-2"><Pill>{p.present ? "Present" : "Absent"}</Pill><Switch checked={p.present} onCheckedChange={() => toggleStaff(p.id)} aria-label={`Attendance for ${p.name}`} /></div>} />
          ))}
        </Tile>
      )}
      {tab === "amenities" && (
        <div className="grid grid-cols-2 gap-2.5">
          {AMENITIES.map((a) => (
            <Tile key={a.name} className="space-y-1">
              <div className="font-display font-semibold">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.hours}</div>
              <div className="text-xs font-semibold text-primary">{a.booked}</div>
            </Tile>
          ))}
        </div>
      )}
      {tab === "emergency" && (
        <div className="space-y-3">
          <Button variant="coral" size="lg" className="w-full" onClick={() => { notify("resident", "Emergency announcement", "Please follow security instructions immediately."); notify("guard", "Emergency announcement", "Emergency alert sent to all residents."); toast.success("Emergency alert sent to all residents"); }}>
            <Siren /> Send emergency alert
          </Button>
          <Tile className="divide-y divide-border py-1">
            {EMERGENCY.map(([n, p]) => (
              <Row key={n} title={n} subtitle={p} right={<a href={`tel:${p}`} className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Phone className="size-4" /></a>} />
            ))}
          </Tile>
        </div>
      )}
      {tab === "docs" && (
        <Tile className="divide-y divide-border py-1">
          {DOCS.map((d) => <Row key={d} left={<FileText className="size-5 text-muted-foreground" />} title={d} onClick={() => toast(`Opening ${d} (demo)`)} />)}
        </Tile>
      )}
    </Screen>
  );
}
