import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Screen({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="animate-rise space-y-5 px-4 pb-8 pt-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Tile({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: (() => void) | undefined }) {
  return (
    <div
      onClick={onClick}
      className={cn("rounded-2xl border border-border/60 bg-card p-4 shadow-card", onClick && "cursor-pointer transition active:scale-[0.99]", className)}
    >
      {children}
    </div>
  );
}

const TONES = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive",
  info: "bg-info-soft text-info",
  brand: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
} as const;
export type Tone = keyof typeof TONES;

const STATUS_TONE: Record<string, Tone> = {
  Paid: "success", Approved: "success", Active: "success", Resolved: "success", Inside: "info", Going: "success", Present: "success",
  Pending: "warning", "Partially Paid": "warning", "In Progress": "info", Submitted: "warning", Trial: "warning", Open: "warning", Maybe: "warning", Medium: "warning",
  Unpaid: "danger", Rejected: "danger", Emergency: "danger", High: "danger", Deactivated: "danger", Absent: "danger", Urgent: "danger",
  Occupied: "info", Rented: "brand", Vacant: "muted", "Under Maintenance": "warning", Exited: "muted", Low: "muted", Free: "muted", Premium: "brand",
  Maintenance: "info", General: "muted", Event: "brand",
};

export function Pill({ children, tone, className }: { children: ReactNode; tone?: Tone; className?: string }) {
  const t = tone ?? (typeof children === "string" ? STATUS_TONE[children] : undefined) ?? "muted";
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold", TONES[t], className)}>{children}</span>;
}

export function Stat({ label, value, hint, tone = "muted", icon }: { label: string; value: ReactNode; hint?: string; tone?: Tone; icon?: ReactNode }) {
  return (
    <Tile className="p-3.5">
      <div className="flex items-center gap-2">
        {icon && <span className={cn("grid size-8 place-items-center rounded-xl [&_svg]:size-4", TONES[tone])}>{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 font-display text-xl font-semibold text-foreground">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </Tile>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
            value === o.value ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card text-muted-foreground",
          )}
        >
          {o.label}
          {o.count !== undefined && o.count > 0 && (
            <span className={cn("rounded-full px-1.5 text-[10px]", value === o.value ? "bg-primary text-primary-foreground" : "bg-muted")}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const ini = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-secondary font-display text-sm font-semibold text-secondary-foreground", className)}>{ini}</span>;
}

export function Row({ left, title, subtitle, right, onClick }: { left?: ReactNode; title: ReactNode; subtitle?: ReactNode; right?: ReactNode; onClick?: (() => void) | undefined }) {
  return (
    <div onClick={onClick} className={cn("flex items-center gap-3 py-3", onClick && "cursor-pointer")}>
      {left}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

export function NativeSelect({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "appearance-none", className)}>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/** Bottom sheet that stays inside the phone frame. */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.getElementById("sheet-root")), []);
  if (!open || !host) return null;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/50 animate-in fade-in" onClick={onClose} />
      <div className="animate-sheet relative max-h-[88%] overflow-y-auto rounded-t-3xl bg-background px-4 pb-8 pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    host,
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/** Decorative QR-style pass mark generated from the pass code (not a scannable QR). */
export function PassMark({ value, className }: { value: string; className?: string }) {
  const n = 21;
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    if (finder) continue;
    h = (h * 1103515245 + 12345) >>> 0;
    if ((h >> 16) % 2 === 0) cells.push([x, y]);
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.2} className="fill-ink" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.8} className="fill-card" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.5} className="fill-ink" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className={cn("size-40", className)} role="img" aria-label={`Pass ${value}`}>
      <rect x={-1} y={-1} width={n + 2} height={n + 2} rx={2} className="fill-card" />
      {cells.map(([x, y]) => <rect key={`${x}:${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.2} className="fill-ink" />)}
      {finder(0, 0)}{finder(n - 7, 0)}{finder(0, n - 7)}
    </svg>
  );
}

export function Hero({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-3xl surface-ink p-5 shadow-card", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[10px] font-bold uppercase tracking-[0.14em]", className)}>{children}</div>;
}

/** Circular progress ring used on Stitch hero cards. */
export function Ring({ value, size = 64, children, className }: { value: number; size?: number; children?: ReactNode; className?: string }) {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.2" className="stroke-ink-foreground/15" />
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.2" strokeLinecap="round" className="stroke-alert" strokeDasharray={`${(v / 100) * c} ${c}`} />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
