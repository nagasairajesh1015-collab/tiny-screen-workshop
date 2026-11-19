import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Car, Package, Plus, ShieldCheck, Users, Wrench } from "lucide-react";
import { pageHead } from "@/components/mobile/shell";
import { Empty, Eyebrow, Hero, inputCls, Section, Tile } from "@/components/mobile/kit";
import { GateVisitorCard } from "@/components/mobile/visitor-card";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { findPassByCode } from "@/lib/gate";

export const Route = createFileRoute("/guard/")({
  head: pageHead("Gate", "Verify passes, let visitors in and track who is inside."),
  component: GuardHome,
});

function GuardHome() {
  const visitors = useDemo((s) => s.visitors);
  const setVisitorStatus = useDemo((s) => s.setVisitorStatus);
  const [code, setCode] = useState("");
  const today = visitors.filter((v) => v.date === "Today");
  const inside = visitors.filter((v) => v.status === "Inside");
  const waiting = visitors.filter((v) => v.status === "Pending");
  const expected = visitors.filter((v) => v.status === "Approved");
  const count = (t: string) => today.filter((v) => v.type === t).length;

  const verify = () => {
    const r = findPassByCode(visitors, code);
    if (!r.ok) return void toast.error(r.error);
    setVisitorStatus(r.visitor.id, "Inside");
    toast.success(`Pass valid — ${r.visitor.name} let in for ${r.visitor.flatId}`);
    setCode("");
  };

  return (
    <div className="animate-rise space-y-5 px-4 pb-8 pt-1">
      <div>
        <Eyebrow className="text-alert">Security gate · Gate 1</Eyebrow>
        <h1 className="mt-1 text-2xl font-bold">Visitor management</h1>
        <p className="text-sm text-muted-foreground">Gate passes, deliveries and entries</p>
      </div>

      <Hero className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow className="text-ink-foreground/70">Today's gate footfall</Eyebrow>
            <div className="mt-1 flex items-baseline gap-1.5"><span className="font-display text-4xl font-bold">{today.length}</span><span className="text-sm text-ink-foreground/70">visitors</span></div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-alert/20 px-2.5 py-1 text-[11px] font-bold text-alert"><span className="size-1.5 rounded-full bg-alert" /> {inside.length} inside</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[["Guests", count("Guest"), Users], ["Deliveries", count("Delivery"), Package], ["Cabs", count("Cab"), Car], ["Services", count("Service Provider"), Wrench]].map(([l, n, I]) => {
            const Icon = I as typeof Users;
            return (
              <div key={l as string} className="flex items-center gap-2 rounded-xl bg-ink-foreground/10 p-2.5">
                <Icon className="size-4 text-ink-foreground/70" />
                <span className="flex-1 text-xs text-ink-foreground/80">{l as string}</span>
                <span className="font-display text-lg font-bold">{n as number}</span>
              </div>
            );
          })}
        </div>
        <Button asChild variant="alert" size="lg" className="w-full"><Link to="/guard/entry"><Plus /> Log gate entry</Link></Button>
      </Hero>

      <Tile className="space-y-3">
        <div className="flex items-center gap-2 font-display text-[15px] font-bold"><ShieldCheck className="size-5 text-primary" /> Verify pass code</div>
        <div className="flex gap-2">
          <input className={`${inputCls} text-center font-display text-lg font-bold tracking-[0.3em]`} inputMode="numeric" maxLength={7} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" aria-label="Pass code" />
          <Button variant="ink" className="h-11 px-5" onClick={verify}>Verify</Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Try a pre-approved pass: {expected[0]?.code ?? "create one from the Owner app"}</p>
      </Tile>

      <Section title={`Waiting for resident (${waiting.length})`}>
        {waiting.length === 0 ? <Empty>No one waiting at the gate.</Empty> : waiting.map((v) => <GateVisitorCard key={v.id} v={v} />)}
      </Section>

      <Section title={`Expected today (${expected.length})`}>
        {expected.length === 0 ? <Empty>No pre-approved visitors.</Empty> : expected.map((v) => <GateVisitorCard key={v.id} v={v} />)}
      </Section>

      <Section title={`Inside the society (${inside.length})`}>
        {inside.length === 0 ? <Empty>No visitors inside right now.</Empty> : inside.map((v) => <GateVisitorCard key={v.id} v={v} />)}
      </Section>
    </div>
  );
}
