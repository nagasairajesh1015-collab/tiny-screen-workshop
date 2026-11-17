import { useState, type ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { Bell, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { APARTMENT, useDemo, type Role } from "@/lib/demo-store";
import { BottomSheet, Empty } from "./kit";
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

export interface NavItem { to: LinkProps["to"]; label: string; icon: LucideIcon; exact?: boolean }

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", secretary: "Secretary", resident: "Owner · A-302", guard: "Security · Gate 1" };

export function RoleShell({ role, nav, children }: { role: Role; nav: NavItem[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const all = useDemo((s) => s.notifications);
  const markAllRead = useDemo((s) => s.markAllRead);
  const mine = all.filter((n) => n.role === role);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <PhoneFrame>
      <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/90 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl surface-coral font-display text-sm font-bold">R</span>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-sm font-semibold">{role === "admin" ? "ResiCore Admin" : APARTMENT}</div>
            <div className="truncate text-[11px] font-medium text-muted-foreground">{ROLE_LABEL[role]}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setOpen(true)} aria-label="Notifications" className="relative grid size-10 place-items-center rounded-xl bg-card text-foreground shadow-card">
            <Bell className="size-[18px]" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>
            )}
          </button>
          <Link to="/" aria-label="Switch role" className="grid size-10 place-items-center rounded-xl bg-card text-muted-foreground shadow-card">
            <LogOut className="size-[18px]" />
          </Link>
        </div>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>

      <nav className="grid border-t border-border/60 bg-card px-2 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
        {nav.map((n) => (
          <Link
            key={String(n.to)}
            to={n.to}
            activeOptions={{ exact: n.exact }}
            className="group flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold text-muted-foreground data-[status=active]:text-foreground"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <span className={cn("grid h-8 w-12 place-items-center rounded-full transition", isActive && "bg-accent text-accent-foreground")}>
                  <n.icon className="size-5" />
                </span>
                {n.label}
              </>
            )}
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
