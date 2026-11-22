import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, LogIn, ShieldCheck, UserCog } from "lucide-react";
import { useMe } from "@/hooks/use-me";
import hero from "@/assets/resicore-hero.jpg";
import { PhoneFrame, pageHead } from "@/components/mobile/shell";

export const Route = createFileRoute("/")({
  head: pageHead("Welcome", "Sign in to ResiCore as Admin, Secretary, Owner / Tenant or Security Guard."),
  component: Welcome,
});

const ROLES = [
  { to: "/secretary", title: "Secretary", desc: "Dues, residents, expenses, complaints", icon: Building2 },
  { to: "/resident", title: "Owner / Tenant", desc: "Pay maintenance, visitors, community", icon: Home },
  { to: "/guard", title: "Security Guard", desc: "Gate entry, passes, deliveries", icon: ShieldCheck },
  { to: "/admin", title: "Admin", desc: "Approve apartments, monitor the app", icon: UserCog },
] as const;

function Welcome() {
  const { data: me } = useMe();
  return (
    <PhoneFrame>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="relative h-[330px] overflow-hidden">
          <img src={hero} alt="Apartment towers at dusk" width={864} height={1152} className="absolute inset-0 size-full object-cover object-[50%_35%]" />
          <div className="absolute inset-0 hero-fade" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-ink-foreground">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-ink/50 px-3 py-1 text-[11px] font-semibold backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" /> Sri Nilla Apartments · Vijayawada
            </div>
            <h1 className="font-display text-4xl font-semibold leading-none">ResiCore</h1>
            <p className="mt-2 max-w-[18rem] text-sm text-ink-foreground/80">Your whole apartment community — dues, visitors, complaints and more — in one app.</p>
          </div>
        </div>

        <div className="animate-rise space-y-3 px-4 pb-8 pt-5">
          {me ? (
            <Link to={me.home} className="flex h-12 items-center justify-center gap-2 rounded-2xl surface-brand text-sm font-semibold shadow-brand">
              Continue as {me.name.split(" ")[0]} <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link to="/auth" className="flex h-12 items-center justify-center gap-2 rounded-2xl surface-brand text-sm font-semibold shadow-brand">
              <LogIn className="size-4" /> Sign in or create account
            </Link>
          )}
          {!me && (
            <>
          <h2 className="pt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Explore the demo (sample data)</h2>
          {ROLES.map((r) => (
            <Link key={r.to} to={r.to} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-card transition active:scale-[0.99]">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><r.icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[15px] font-semibold">{r.title}</div>
                <div className="truncate text-xs text-muted-foreground">{r.desc}</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
            </>
          )}
          <Link to="/register" className="mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl surface-ink text-sm font-semibold shadow-card">
            Register a new apartment <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
