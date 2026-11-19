import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Link2, Search } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Pill, Screen, Section, Segmented, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { dueStatus } from "@/lib/finance";

export const Route = createFileRoute("/secretary/residents")({
  head: pageHead("Flats & residents", "Block-wise and floor-wise flat list with owners, tenants and approvals."),
  component: Residents,
});

function Residents() {
  const flats = useDemo((s) => s.flats);
  const updateFlat = useDemo((s) => s.updateFlat);
  const [block, setBlock] = useState<"all" | "A" | "B">("all");
  const [q, setQ] = useState("");
  const pending = flats.filter((f) => f.reg === "Pending");
  const shown = flats.filter((f) => (block === "all" || f.block === block) && (f.id + f.owner + (f.tenant ?? "")).toLowerCase().includes(q.toLowerCase()));
  const floors = [...new Set(shown.map((f) => `${f.block}·${f.floor}`))];

  return (
    <Screen title="Flats" subtitle={`${flats.length} units · 2 blocks · 4 floors`} action={
      <Button size="sm" variant="soft" onClick={() => toast.success("Invite link copied · expires in 7 days")}><Link2 /> Invite</Button>
    }>
      {pending.length > 0 && (
        <Section title="Waiting for approval">
          {pending.map((f) => (
            <Tile key={f.id} className="space-y-3 border-warning/40">
              <div className="flex items-center justify-between">
                <div><div className="font-semibold">{f.owner}</div><div className="text-xs text-muted-foreground">Owner registration · {f.id} · {f.phone}</div></div>
                <Pill>Pending</Pill>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { updateFlat(f.id, { reg: "Deactivated" }); toast("Registration rejected"); }}>Reject</Button>
                <Button variant="brand" onClick={() => { updateFlat(f.id, { reg: "Approved" }); toast.success(`${f.owner} approved — notified`); }}>Approve</Button>
              </div>
            </Tile>
          ))}
        </Section>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input className={inputCls + " pl-9"} placeholder="Search flat, owner or tenant" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Segmented value={block} onChange={setBlock} options={[{ value: "all", label: "All blocks" }, { value: "A", label: "Block A" }, { value: "B", label: "Block B" }]} />

      {floors.map((fl) => {
        const [b, n] = fl.split("·");
        return (
          <Section key={fl} title={`Block ${b} · Floor ${n}`}>
            <div className="space-y-2">
              {shown.filter((f) => f.block === b && String(f.floor) === n).map((f) => (
                <Link key={f.id} to="/secretary/flat/$flatId" params={{ flatId: f.id }} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary font-display text-xs font-bold">{f.id}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{f.owner}</div>
                    <div className="truncate text-xs text-muted-foreground">{f.tenant ? `Tenant: ${f.tenant}` : `${f.bhk} · Owner-occupied`}</div>
                    <div className="mt-1 flex gap-1"><Pill>{f.status}</Pill>{f.status !== "Vacant" && <Pill>{dueStatus(f.monthly, f.paid, f.prevDue)}</Pill>}</div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Section>
        );
      })}
    </Screen>
  );
}
