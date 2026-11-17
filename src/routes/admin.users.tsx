import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Initials, Pill, Row, Screen, Section, Stat, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/admin/users")({
  head: pageHead("Users & secretaries", "View secretaries, owners and tenants across all apartments."),
  component: Users,
});

function Users() {
  const apartments = useDemo((s) => s.apartments);
  const [q, setQ] = useState("");
  const [off, setOff] = useState<string[]>([]);
  const shown = apartments.filter((a) => (a.secretary + a.name).toLowerCase().includes(q.toLowerCase()));

  return (
    <Screen title="Users" subtitle="Secretaries and residents">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Secretaries" value={apartments.length} />
        <Stat label="Active today" value="312" />
        <Stat label="Guards" value="58" />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input className={inputCls + " pl-9"} placeholder="Search secretary or apartment" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Section title="Secretaries">
        <Tile className="divide-y divide-border py-1">
          {shown.map((a) => {
            const disabled = off.includes(a.id);
            return (
              <Row key={a.id} left={<Initials name={a.secretary} />} title={a.secretary} subtitle={`${a.name} · ${a.phone}`}
                right={
                  <div className="flex flex-col items-end gap-1">
                    <Pill>{disabled ? "Deactivated" : a.status === "Active" ? "Active" : "Pending"}</Pill>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => {
                      setOff(disabled ? off.filter((x) => x !== a.id) : [...off, a.id]);
                      toast(disabled ? "Account reactivated" : "Account deactivated");
                    }}>{disabled ? "Activate" : "Deactivate"}</Button>
                  </div>
                } />
            );
          })}
        </Tile>
      </Section>
      <Section title="Residents by apartment">
        <Tile className="divide-y divide-border py-1">
          {apartments.filter((a) => a.status === "Active").map((a) => (
            <Row key={a.id} title={a.name} subtitle={`${Math.round(a.flats * 0.62)} owners · ${Math.round(a.flats * 0.33)} tenants`} right={<span className="text-sm font-semibold">{a.flats}</span>} />
          ))}
        </Tile>
      </Section>
    </Screen>
  );
}
