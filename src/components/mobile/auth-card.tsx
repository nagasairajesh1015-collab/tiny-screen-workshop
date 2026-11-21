import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PhoneFrame } from "./shell";

/** Navy brand header + cream body used by sign-in, reset and pending screens. */
export function AuthLayout({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="surface-ink rounded-b-[2rem] px-5 pb-8 pt-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl surface-brand shadow-brand"><Building2 className="size-5" /></span>
            <span className="font-display text-lg font-bold">ResiCore</span>
          </Link>
          <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.14em] text-alert">{eyebrow}</div>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{title}</h1>
          <p className="mt-2 text-sm text-ink-foreground/75">{subtitle}</p>
        </div>
        <div className="animate-rise space-y-4 px-4 pb-10 pt-5">{children}</div>
      </div>
    </PhoneFrame>
  );
}
