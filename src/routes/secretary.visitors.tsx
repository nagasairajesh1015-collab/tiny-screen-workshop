import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/mobile/shell";
import { Initials, Pill, Row, Screen, Segmented, Stat, Tile } from "@/components/mobile/kit";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/secretary/visitors")({
  head: pageHead("Visitors", "Visitor log, pending approvals and visitor reports."),
  component: Visitors,
});

function Visitors() {
  const visitors = useDemo((s) => s.visitors);
  const [tab, setTab] = useState<"today" | "pending" | "all">("today");
  const shown = visitors.filter((v) => (tab === "all" ? true : tab === "pending" ? v.status === "Pending" : v.date === "Today"));
  const byFlat = Object.entries(visitors.reduce<Record<string, number>>((a, v) => ({ ...a, [v.flatId]: (a[v.flatId] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <Screen title="Visitors" subtitle="Gate log and reports">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Today" value={visitors.filter((v) => v.date === "Today").length} />
        <Stat label="Inside now" value={visitors.filter((v) => v.status === "Inside").length} />
        <Stat label="This month" value={214} />
      </div>
      <Tile className="space-y-1">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Most visited flats</div>
        {byFlat.map(([f, n]) => <div key={f} className="flex justify-between text-sm"><span>{f}</span><span className="font-semibold">{n} visits</span></div>)}
      </Tile>
      <Segmented value={tab} onChange={setTab} options={[
        { value: "today", label: "Today" },
        { value: "pending", label: "Pending", count: visitors.filter((v) => v.status === "Pending").length },
        { value: "all", label: "History" },
      ]} />
      <Tile className="divide-y divide-border py-1">
        {shown.map((v) => (
          <Row key={v.id} left={<Initials name={v.name} />} title={v.name}
            subtitle={`${v.flatId} · ${v.type} · ${v.entry ? `in ${v.entry}` : v.date}${v.exit ? ` · out ${v.exit}` : ""}`}
            right={<Pill>{v.status}</Pill>} />
        ))}
      </Tile>
    </Screen>
  );
}
