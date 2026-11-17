import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Empty, Pill, Screen, Segmented, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo, type Apartment } from "@/lib/demo-store";

export const Route = createFileRoute("/admin/apartments")({
  head: pageHead("Apartments", "Approve, reject or deactivate registered apartments."),
  component: Apartments,
});

function Apartments() {
  const apartments = useDemo((s) => s.apartments);
  const setStatus = useDemo((s) => s.setApartmentStatus);
  const [tab, setTab] = useState<"all" | Apartment["status"]>("all");
  const shown = apartments.filter((a) => tab === "all" || a.status === tab);
  const count = (s: Apartment["status"]) => apartments.filter((a) => a.status === s).length;

  return (
    <Screen title="Apartments" subtitle={`${apartments.length} registered`}>
      <Segmented value={tab} onChange={setTab} options={[
        { value: "all", label: "All" },
        { value: "Pending", label: "Pending", count: count("Pending") },
        { value: "Active", label: "Active" },
        { value: "Rejected", label: "Rejected" },
        { value: "Deactivated", label: "Deactivated" },
      ]} />
      <div className="space-y-2.5">
        {shown.length === 0 && <Empty>No apartments here.</Empty>}
        {shown.map((a) => (
          <Tile key={a.id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-[15px] font-semibold">{a.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{a.city} · {a.blocks} blocks · {a.flats} flats</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{a.secretary} · {a.phone}</div>
              </div>
              <div className="flex flex-col items-end gap-1"><Pill>{a.status}</Pill><Pill>{a.plan}</Pill></div>
            </div>
            {a.status === "Pending" && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setStatus(a.id, "Rejected"); toast(`${a.name} rejected`); }}>Reject</Button>
                <Button variant="coral" onClick={() => { setStatus(a.id, "Active"); toast.success(`${a.name} is now active`); }}>Approve</Button>
              </div>
            )}
            {a.status === "Active" && (
              <Button size="sm" variant="outline" onClick={() => { setStatus(a.id, "Deactivated"); toast(`${a.name} deactivated`); }}>Deactivate</Button>
            )}
            {(a.status === "Deactivated" || a.status === "Rejected") && (
              <Button size="sm" variant="soft" onClick={() => { setStatus(a.id, "Active"); toast.success(`${a.name} activated`); }}>Activate</Button>
            )}
          </Tile>
        ))}
      </div>
    </Screen>
  );
}
