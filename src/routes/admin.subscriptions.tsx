import { createFileRoute } from "@tanstack/react-router";
import { Check, FileText } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Pill, Row, Screen, Section, Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/subscriptions")({
  head: pageHead("Subscriptions", "Manage Free, Trial and Premium plans for each apartment."),
  component: Subscriptions,
});

const PLANS = [
  { name: "Free", price: "₹0", note: "Up to 25 flats", perks: ["Dues tracking", "Notices", "Complaints"] },
  { name: "Premium", price: "₹1,499/mo", note: "or ₹14,999/yr", perks: ["Everything in Free", "Visitor & gate app", "Reports & exports", "Unlimited flats"], featured: true },
];

function Subscriptions() {
  const apartments = useDemo((s) => s.apartments);
  return (
    <Screen title="Plans" subtitle="Apartment-wise subscriptions">
      <div className="grid grid-cols-2 gap-2.5">
        {PLANS.map((p) => (
          <div key={p.name} className={cn("rounded-2xl p-4 shadow-card", p.featured ? "surface-ink" : "border border-border/60 bg-card")}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-70">{p.name}</div>
            <div className="mt-1 font-display text-xl font-semibold">{p.price}</div>
            <div className="text-[11px] opacity-70">{p.note}</div>
            <ul className="mt-3 space-y-1 text-xs">
              {p.perks.map((x) => <li key={x} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-primary" />{x}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">New apartments get a 30-day Premium trial.</p>
      <Section title="Apartments">
        <Tile className="divide-y divide-border py-1">
          {apartments.map((a) => (
            <Row key={a.id} title={a.name} subtitle={a.renews === "—" ? "No renewal date" : `Renews ${a.renews}`}
              right={
                <div className="flex items-center gap-2">
                  <Pill>{a.plan}</Pill>
                  <Button size="sm" variant="soft" onClick={() => toast.success(`Invoice for ${a.name} generated`)} aria-label="Invoice"><FileText /></Button>
                </div>
              } />
          ))}
        </Tile>
      </Section>
    </Screen>
  );
}
