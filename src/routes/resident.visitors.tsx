import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Share2 } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { BottomSheet, Empty, Eyebrow, Field, Initials, inputCls, NativeSelect, PassMark, Pill, Row, Screen, Section, Segmented, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { ME_FLAT, useDemo, type Visitor } from "@/lib/demo-store";

export const Route = createFileRoute("/resident/visitors")({
  head: pageHead("Visitors", "Create guest passes and approve visitors waiting at the gate."),
  component: ResidentVisitors,
});

const TYPES: Visitor["type"][] = ["Guest", "Delivery", "Cab", "Service Provider", "Other"];

function ResidentVisitors() {
  const all = useDemo((s) => s.visitors);
  const setVisitorStatus = useDemo((s) => s.setVisitorStatus);
  const notify = useDemo((s) => s.notify);
  const mine = all.filter((v) => v.flatId === ME_FLAT);
  const [tab, setTab] = useState<"active" | "history">("active");
  const [creating, setCreating] = useState(false);
  const [passId, setPassId] = useState<string | null>(null);
  const waiting = mine.filter((v) => v.status === "Pending");
  const passes = mine.filter((v) => v.status === "Approved" || v.status === "Inside");
  const history = mine.filter((v) => v.status === "Exited" || v.status === "Rejected");
  const pass = mine.find((v) => v.id === passId) ?? passes[0];

  const decide = (v: Visitor, ok: boolean) => {
    setVisitorStatus(v.id, ok ? "Approved" : "Rejected");
    notify("guard", ok ? "Entry approved" : "Entry denied", `${ME_FLAT} ${ok ? "approved" : "denied"} ${v.name}.`);
    toast.success(ok ? "Approved — the guard can let them in" : "Entry denied");
  };

  return (
    <Screen title="Visitors" subtitle="Guest passes and gate approvals" action={<Button variant="ink" size="sm" onClick={() => setCreating(true)}><Plus /> Guest pass</Button>}>
      {waiting.length > 0 && (
        <Section title="Waiting at the gate">
          {waiting.map((v) => (
            <Tile key={v.id} className="space-y-3 border-warning/40">
              <Row left={<Initials name={v.name} className="rounded-full bg-ink text-ink-foreground" />} title={v.name} subtitle={`${v.type} · ${v.purpose} · ${v.phone}`} right={<Pill tone="warning">At gate</Pill>} />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => decide(v, false)}>Deny</Button>
                <Button variant="ink" onClick={() => decide(v, true)}>Approve</Button>
              </div>
            </Tile>
          ))}
        </Section>
      )}

      {pass ? (
        <Tile className="overflow-hidden p-0">
          <div className="h-1.5 surface-brand" />
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Initials name={pass.name} className="rounded-full bg-ink text-ink-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-lg font-bold">{pass.name}</div>
                <div className="text-xs text-muted-foreground">{pass.type} · {pass.purpose}</div>
              </div>
              <Pill>{pass.status}</Pill>
            </div>
            <div className="grid place-items-center rounded-2xl bg-muted p-4">
              <PassMark value={pass.code} className="rounded-xl shadow-card" />
              <Eyebrow className="mt-3 text-muted-foreground">Gate pass code</Eyebrow>
              <div className="mt-1 rounded-xl bg-card px-4 py-1.5 font-display text-3xl font-bold tracking-[0.25em]">{pass.code.slice(0, 3)}-{pass.code.slice(3)}</div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">Show this at the gate or read out the code to the guard</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ink" onClick={() => toast.success("Pass link copied — share it on WhatsApp")}><Share2 /> Share pass</Button>
              <Button variant="secondary" disabled={pass.status === "Inside"} onClick={() => { setVisitorStatus(pass.id, "Rejected"); setPassId(null); toast("Pass revoked"); }}>Revoke</Button>
            </div>
          </div>
        </Tile>
      ) : (
        <Empty>No active passes. Create a guest pass so the guard can let your visitor in quickly.</Empty>
      )}

      <Segmented value={tab} onChange={setTab} options={[
        { value: "active", label: "Active passes", count: passes.length },
        { value: "history", label: "History" },
      ]} />
      <Tile className="divide-y divide-border py-1">
        {(tab === "active" ? passes : history).map((v) => (
          <Row key={v.id} onClick={tab === "active" ? () => setPassId(v.id) : undefined} left={<Initials name={v.name} />} title={v.name}
            subtitle={`${v.type} · ${v.entry ? `in ${v.entry}` : v.date}${v.exit ? ` · out ${v.exit}` : ""}`} right={<Pill>{v.status}</Pill>} />
        ))}
        {(tab === "active" ? passes : history).length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">Nothing here yet.</div>}
      </Tile>

      <NewPass open={creating} onClose={() => setCreating(false)} onCreated={(id) => { setPassId(id); setTab("active"); }} />
    </Screen>
  );
}

function NewPass({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const addVisitor = useDemo((s) => s.addVisitor);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<Visitor["type"]>("Guest");
  const [purpose, setPurpose] = useState("");
  return (
    <BottomSheet open={open} onClose={onClose} title="New guest pass">
      <div className="space-y-3.5">
        <Field label="Visitor name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
        <Field label="Phone"><input className={inputCls} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type"><NativeSelect value={type} onChange={(v) => setType(v as Visitor["type"])} options={TYPES} /></Field>
          <Field label="Purpose"><input className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Family visit" /></Field>
        </div>
        <Button variant="brand" size="lg" className="w-full" onClick={() => {
          if (!name.trim()) return void toast.error("Enter the visitor's name.");
          const v = addVisitor({ name: name.trim(), phone: phone || "—", flatId: ME_FLAT, type, purpose: purpose || type, status: "Approved" });
          toast.success(`Pass ${v.code} created — the gate has been told`);
          onCreated(v.id);
          setName(""); setPhone(""); setPurpose(""); onClose();
        }}>Create pass</Button>
      </div>
    </BottomSheet>
  );
}
