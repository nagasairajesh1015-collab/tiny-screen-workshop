import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CarFront, FileBarChart, HardHat, Megaphone, Receipt, Siren, Users, Wrench } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { Screen, Section } from "@/components/mobile/kit";

export const Route = createFileRoute("/secretary/more")({
  head: pageHead("All modules", "Every ResiCore module for secretaries in one place."),
  component: More,
});

const ITEMS = [
  { to: "/secretary/expenses", label: "Expenses & balance", icon: Receipt },
  { to: "/secretary/visitors", label: "Visitors", icon: Users },
  { to: "/secretary/parking", label: "Parking & vehicles", icon: CarFront },
  { to: "/secretary/community", label: "Notices, events, polls, funds", icon: Megaphone },
  { to: "/secretary/operations", label: "Staff, amenities, emergency", icon: HardHat },
] as const;

function More() {
  return (
    <Screen title="More" subtitle="All modules">
      <div className="grid grid-cols-2 gap-2.5">
        {ITEMS.map((i) => (
          <Link key={i.to} to={i.to} className="flex min-h-28 flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"><i.icon className="size-5" /></span>
            <span className="text-sm font-semibold leading-tight">{i.label}</span>
          </Link>
        ))}
        <Link to="/secretary/operations" className="flex min-h-28 flex-col justify-between rounded-2xl surface-coral p-4 shadow-coral">
          <Siren className="size-6" />
          <span className="text-sm font-semibold leading-tight">Emergency alert</span>
        </Link>
      </div>
      <Section title="Reports & exports">
        <div className="grid grid-cols-1 gap-2">
          {["Monthly financial report", "Yearly financial report", "Flat-wise statements", "Visitor report"].map((r) => (
            <button key={r} onClick={() => toast.success(`${r} ready to download (demo)`)} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 text-left text-sm font-semibold shadow-card">
              <FileBarChart className="size-5 text-muted-foreground" /> {r}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Coming next">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {[["Helpdesk", Wrench], ["Meetings", BookOpen]].map(([l]) => <span key={l as string} className="rounded-full border border-border px-3 py-1">{l as string}</span>)}
          {["Deliveries", "Feedback", "Service bookings"].map((l) => <span key={l} className="rounded-full border border-border px-3 py-1">{l}</span>)}
        </div>
      </Section>
    </Screen>
  );
}
