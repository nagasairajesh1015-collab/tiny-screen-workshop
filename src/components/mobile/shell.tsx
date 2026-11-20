import { useState, type ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { Bell, Building2, ChevronDown, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { APARTMENT, useDemo, type Role } from "@/lib/demo-store";
import { BottomSheet, Empty, Initials } from "./kit";
import { cn } from "@/lib/utils";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:phone-backdrop md:flex md:items-center md:justify-center md:py-8">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background md:h-[880px] md:max-h-[calc(100dvh-4rem)] md:rounded-[2.75rem] md:border-[10px] md:border-ink md:shadow-phone">
        {children}
        <div id="sheet-root" className="pointer-events-none absolute inset-0 z-40 [&:empty]:hidden" />
      </div>
    </div>
  );
}

export interface NavItem { to: NavTo; label: string; icon: LucideIcon; exact?: boolean | undefined }
type NavTo = Exclude<LinkProps["to"], undefined>;

const ROLE_LABEL: Record<Role, string> = { admin: "Super admin", secretary: "Secretary console", resident: "Owner · Flat A-302", guard: "Security · Gate 1" };
const ROLE_PERSON: Record<Role, string> = { admin: "Platform Admin", secretary: "Arvind Menon", resident: "Priya Sharma", guard: "Mohan Lal" };

export function RoleShell({ role, nav, profileTo, children }: { role: Role; nav: NavItem[]; profileTo?: NavTo | undefined; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const all = useDemo((s) => s.notifications);
  const markAllRead = useDemo((s) => s.markAllRead);
  const mine = all.filter((n) => n.role === role);
  const unread = mine.filter((n) => !n.read).length;
  const person = ROLE_PERSON[role];

  return (
    <PhoneFrame>
      <header className="surface-ink px-4 pb-3 pt-4 text-ink-foreground">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" aria-label="Switch role" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl surface-brand shadow-brand"><Building2 className="size-5" /></span>
            <div className="min-w-0 leading-tight">
              <div className="font-display text-[15px] font-bold">ResiCore</div>
              <div className="mt-0.5 flex max-w-[11rem] items-center gap-1 rounded-md bg-ink-foreground/10 px-1.5 py-0.5 text-[11px] font-medium text-ink-foreground/85">
                <span className="truncate">{role === "admin" ? "Platform management" : APARTMENT}</span>
                <ChevronDown className="size-3 shrink-0" />
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground">
              <Bell className="size-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-alert px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-ink">{unread}</span>
              )}
            </button>
            {profileTo ? (
              <Link to={profileTo} aria-label="My profile"><Initials name={person} className="size-10 rounded-full surface-brand" /></Link>
            ) : (
              <Link to="/" aria-label="Switch role" className="grid size-10 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground"><LogOut className="size-[18px]" /></Link>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-foreground/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
            <span className="size-1.5 rounded-full bg-alert" /> {ROLE_LABEL[role]}
          </span>
          <span className="text-xs font-medium text-ink-foreground/70">{person}</span>
        </div>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto pb-24">{children}</main>

      <nav className="absolute inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-30 flex items-center justify-between gap-1 rounded-[1.75rem] border border-border/70 bg-card/95 p-1.5 shadow-card backdrop-blur">
        {nav.map((n) => (
          <Link
            key={String(n.to)}
            to={n.to}
            activeOptions={{ exact: n.exact ?? false }}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-3xl py-1.5 text-[10px] font-semibold text-muted-foreground transition data-[status=active]:bg-ink data-[status=active]:text-ink-foreground data-[status=active]:[&_svg]:text-alert"
          >
            <n.icon className="size-[18px]" />
            <span className="truncate">{n.label}</span>
          </Link>
        ))}
      </nav>

      <BottomSheet open={open} onClose={() => { setOpen(false); markAllRead(role); }} title="Notifications">
        <div className="space-y-2">
          {mine.length === 0 && <Empty>No notifications yet.</Empty>}
          {mine.map((n) => (
            <div key={n.id} className={cn("rounded-2xl border p-3", n.read ? "border-border bg-card" : "border-primary/30 bg-accent")}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{n.title}</span>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
            </div>
          ))}
        </div>
      </BottomSheet>
    </PhoneFrame>
  );
}

export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · ResiCore` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · ResiCore` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
