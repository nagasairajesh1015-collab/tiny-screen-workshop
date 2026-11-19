import { toast } from "sonner";
import { Bike, Car, LogOut, Package, Phone, UserRound, Wrench } from "lucide-react";
import { Eyebrow, Pill, Tile } from "./kit";
import { Button } from "@/components/ui/button";
import { useDemo, type Visitor } from "@/lib/demo-store";

const ICON = { Guest: UserRound, Delivery: Package, Cab: Car, "Service Provider": Wrench, Other: Bike } as const;

export function GateVisitorCard({ v }: { v: Visitor }) {
  const setVisitorStatus = useDemo((s) => s.setVisitorStatus);
  const Icon = ICON[v.type];
  return (
    <Tile className="space-y-3 border-t-4 border-t-alert/70 p-0 pb-3">
      <div className="flex items-center gap-3 px-4 pt-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-danger-soft text-destructive"><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[15px] font-bold">{v.name}</div>
          <div className="truncate text-xs text-muted-foreground">{v.type} · {v.purpose}</div>
        </div>
        <Pill>{v.status}</Pill>
      </div>
      <div className="mx-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-3 text-xs">
        <div><Eyebrow className="text-muted-foreground">Visiting</Eyebrow><div className="font-semibold">Flat {v.flatId}</div></div>
        <div><Eyebrow className="text-muted-foreground">{v.entry ? "Entry" : "Status"}</Eyebrow><div className="font-semibold">{v.entry ? `${v.date} · ${v.entry}` : v.status === "Pending" ? "Asking the flat" : "Pre-approved"}</div></div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4">
        <Button variant="secondary" onClick={() => toast(`Calling ${v.flatId}…`)}><Phone /> Call flat</Button>
        {v.status === "Approved" && <Button variant="brand" onClick={() => { setVisitorStatus(v.id, "Inside"); toast.success(`${v.name} let in`); }}>Allow entry</Button>}
        {v.status === "Inside" && <Button variant="ink" onClick={() => { setVisitorStatus(v.id, "Exited"); toast.success(`${v.name} checked out`); }}><LogOut /> Mark exit</Button>}
        {v.status === "Pending" && <Button variant="secondary" disabled>Waiting for flat</Button>}
      </div>
    </Tile>
  );
}
