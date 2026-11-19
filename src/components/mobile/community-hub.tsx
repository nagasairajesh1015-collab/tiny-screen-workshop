import { useState } from "react";
import { BellRing, Camera, Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo, type Notice } from "@/lib/demo-store";
import { inr } from "@/lib/format";
import { BottomSheet, Field, NativeSelect, Pill, Progress, Segmented, Tile, inputCls } from "./kit";
import { cn } from "@/lib/utils";

type Tab = "notices" | "events" | "polls" | "funds";

export function CommunityHub({ manage }: { manage: boolean }) {
  const [tab, setTab] = useState<Tab>("notices");
  const [creating, setCreating] = useState(false);
  const s = useDemo();
  const upcoming = s.events.filter((e) => !e.past);
  const past = s.events.filter((e) => e.past);

  return (
    <div className="space-y-4">
      <Segmented value={tab} onChange={setTab} options={[
        { value: "notices", label: "Notices" },
        { value: "events", label: "Events", count: upcoming.length },
        { value: "polls", label: "Polls", count: s.polls.filter((p) => p.my === undefined).length },
        { value: "funds", label: "Funds" },
      ]} />
      {manage && (
        <Button variant="ink" className="w-full" onClick={() => setCreating(true)}>
          <Plus /> New {tab.slice(0, -1)}
        </Button>
      )}

      {tab === "notices" && (
        <div className="space-y-2.5">
          {s.notices.map((n) => (
            <Tile key={n.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><Megaphone className="size-3.5" />{n.date}</span>
                <Pill>{n.tag}</Pill>
              </div>
              <div className="font-display font-semibold">{n.title}</div>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </Tile>
          ))}
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-2.5">
          {upcoming.map((e) => (
            <Tile key={e.id} className="space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{e.date}</div>
                <div className="font-display text-lg font-semibold">{e.title}</div>
                <p className="text-sm text-muted-foreground">{e.venue} · {e.description}</p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span><b className="text-foreground">{e.going}</b> going</span>
                <span><b className="text-foreground">{e.maybe}</b> maybe</span>
                <span><b className="text-foreground">{e.no}</b> can't</span>
              </div>
              {manage ? (
                <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent to all residents")}><BellRing /> Send reminder</Button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {(["Going", "Maybe", "No"] as const).map((r) => (
                    <button key={r} onClick={() => s.rsvp(e.id, r)} className={cn("rounded-xl border py-2 text-sm font-semibold", e.my === r ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card")}>
                      {r === "No" ? "Can't go" : r}
                    </button>
                  ))}
                </div>
              )}
            </Tile>
          ))}
          <h3 className="pt-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Past events</h3>
          {past.map((e) => (
            <Tile key={e.id} className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Camera className="size-5" /></span>
              <div className="flex-1">
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-muted-foreground">{e.date} · {e.going} attended · {e.photos} photos</div>
              </div>
            </Tile>
          ))}
        </div>
      )}

      {tab === "polls" && (
        <div className="space-y-2.5">
          {s.polls.map((p) => {
            const total = p.options.reduce((a, o) => a + o.votes, 0) || 1;
            const voted = p.my !== undefined || manage;
            return (
              <Tile key={p.id} className="space-y-3">
                <div>
                  <div className="font-display font-semibold">{p.question}</div>
                  <div className="text-xs text-muted-foreground">Closes {p.closes} · {total} votes</div>
                </div>
                <div className="space-y-2">
                  {p.options.map((o, i) => (
                    <button key={o.label} disabled={voted} onClick={() => { s.vote(p.id, i); toast.success("Vote recorded"); }}
                      className={cn("relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm font-semibold", p.my === i ? "border-primary" : "border-border", !voted && "active:bg-muted")}>
                      {voted && <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${(o.votes / total) * 100}%` }} />}
                      <span className="relative flex justify-between">
                        <span>{o.label}</span>
                        {voted && <span className="text-muted-foreground">{Math.round((o.votes / total) * 100)}%</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </Tile>
            );
          })}
        </div>
      )}

      {tab === "funds" && (
        <div className="space-y-2.5">
          {s.funds.map((fd) => {
            const pct = (fd.collected / fd.target) * 100;
            const closed = fd.collected >= fd.target;
            return (
              <Tile key={fd.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display font-semibold">{fd.name}</div>
                    <p className="text-sm text-muted-foreground">{fd.purpose}</p>
                  </div>
                  <Pill tone={closed ? "success" : "brand"}>{closed ? "Completed" : `Closes ${fd.closes.slice(0, 6)}`}</Pill>
                </div>
                <Progress value={pct} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span><b className="text-foreground">{inr(fd.collected)}</b> of {inr(fd.target)}</span>
                  <span>Pending {inr(Math.max(0, fd.target - fd.collected))}</span>
                </div>
                {!manage && (
                  fd.mine > 0 ? (
                    <div className="rounded-xl bg-success-soft px-3 py-2 text-xs font-semibold text-success">You contributed {inr(fd.mine)}</div>
                  ) : !closed && (
                    <Button variant="brand" className="w-full" onClick={() => { s.contribute(fd.id, fd.perUnit); toast.success(`Contributed ${inr(fd.perUnit)}`); }}>
                      Contribute {inr(fd.perUnit)} (suggested)
                    </Button>
                  )
                )}
                {manage && <div className="text-xs text-muted-foreground">Suggested per unit: {inr(fd.perUnit)}</div>}
              </Tile>
            );
          })}
        </div>
      )}

      {manage && <CreateSheet tab={tab} open={creating} onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateSheet({ tab, open, onClose }: { tab: Tab; open: boolean; onClose: () => void }) {
  const s = useDemo();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [tag, setTag] = useState<Notice["tag"]>("General");
  const reset = () => { setA(""); setB(""); setC(""); setD(""); onClose(); };
  const labels: Record<Tab, [string, string, string?, string?]> = {
    notices: ["Title", "Message"],
    events: ["Event name", "Description", "Date & time", "Venue"],
    polls: ["Question", "Options (comma separated)", "Closes on"],
    funds: ["Fund name", "Purpose", "Target amount (₹)", "Suggested per unit (₹)"],
  };
  const [l1, l2, l3, l4] = labels[tab];
  const save = () => {
    if (!a.trim() || !b.trim()) return void toast.error("Please fill in the first two fields.");
    if (tab === "notices") s.addNotice({ title: a, body: b, tag });
    if (tab === "events") s.addEvent({ title: a, description: b, date: c || "TBA", venue: d || "Clubhouse" });
    if (tab === "polls") s.addPoll(a, b.split(",").map((x) => x.trim()).filter(Boolean), c || "In 7 days");
    if (tab === "funds") s.addFund({ name: a, purpose: b, target: Number(c) || 50000, perUnit: Number(d) || 2000, closes: "31 Dec 2026" });
    toast.success("Published — residents notified");
    reset();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title={`New ${tab.slice(0, -1)}`}>
      <div className="space-y-3.5">
        <Field label={l1}><input className={inputCls} value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label={l2}><textarea className={cn(inputCls, "h-20 py-2")} value={b} onChange={(e) => setB(e.target.value)} /></Field>
        {l3 && <Field label={l3}><input className={inputCls} value={c} onChange={(e) => setC(e.target.value)} /></Field>}
        {l4 && <Field label={l4}><input className={inputCls} value={d} onChange={(e) => setD(e.target.value)} /></Field>}
        {tab === "notices" && <Field label="Type"><NativeSelect value={tag} onChange={(v) => setTag(v as Notice["tag"])} options={["General", "Maintenance", "Urgent", "Event"]} /></Field>}
        <Button variant="brand" size="lg" className="w-full" onClick={save}>Publish</Button>
      </div>
    </BottomSheet>
  );
}
