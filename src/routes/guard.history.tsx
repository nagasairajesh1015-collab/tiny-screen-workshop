import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { Initials, inputCls, Pill, Row, Screen, Segmented, Tile } from "@/components/mobile/kit";
import { useDemo, type VisitorStatus } from "@/lib/demo-store";

export const Route = createFileRoute("/guard/history")({
  head: pageHead("Gate log", "Every entry and exit recorded at the gate."),
  component: GateLog,
});

function GateLog() {
  const visitors = useDemo((s) => s.visitors);
  const [tab, setTab] = useState<"all" | VisitorStatus>("all");
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const shown = visitors.filter((v) => (tab === "all" || v.status === tab) && (!term || `${v.name} ${v.flatId} ${v.phone}`.toLowerCase().includes(term)));
  const n = (s: VisitorStatus) => visitors.filter((v) => v.status === s).length;

  return (
    <Screen title="Gate log" subtitle="Entries and exits">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input className={`${inputCls} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search visitor, phone or flat…" aria-label="Search gate log" />
      </div>
      <Segmented value={tab} onChange={setTab} options={[
        { value: "all", label: `All (${visitors.length})` },
        { value: "Inside", label: "Inside", count: n("Inside") },
        { value: "Pending", label: "Waiting", count: n("Pending") },
        { value: "Exited", label: "Exited" },
        { value: "Rejected", label: "Denied" },
      ]} />
      <Tile className="divide-y divide-border py-1">
        {shown.map((v) => (
          <Row key={v.id} left={<Initials name={v.name} />} title={v.name}
            subtitle={`${v.flatId} · ${v.type} · ${v.entry ? `in ${v.entry}` : v.date}${v.exit ? ` · out ${v.exit}` : ""}`}
            right={<Pill>{v.status}</Pill>} />
        ))}
        {shown.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No entries match.</div>}
      </Tile>
    </Screen>
  );
}
