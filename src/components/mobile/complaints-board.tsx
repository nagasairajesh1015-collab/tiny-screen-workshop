import { useState } from "react";
import { MessageSquarePlus, Paperclip, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ME_FLAT, useDemo, type Complaint, type ComplaintStatus } from "@/lib/demo-store";
import { BottomSheet, Empty, Field, NativeSelect, Pill, Segmented, Tile, inputCls } from "./kit";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Plumbing", "Electrical", "Lift", "Housekeeping", "Security", "Parking", "Water", "Noise", "Other"];
const STATUSES: ComplaintStatus[] = ["Submitted", "Approved", "In Progress", "Resolved", "Rejected"];

export function ComplaintsBoard({ manage }: { manage: boolean }) {
  const all = useDemo((s) => s.complaints);
  const updateComplaint = useDemo((s) => s.updateComplaint);
  const list = manage ? all : all.filter((c) => c.flatId === ME_FLAT);
  const [tab, setTab] = useState<"open" | "resolved" | "all">("open");
  const [editing, setEditing] = useState<Complaint | null>(null);
  const [creating, setCreating] = useState(false);
  const isOpen = (c: Complaint) => c.status !== "Resolved" && c.status !== "Rejected";
  const shown = list.filter((c) => (tab === "all" ? true : tab === "open" ? isOpen(c) : !isOpen(c)));

  return (
    <div className="space-y-4">
      {!manage && (
        <Button variant="brand" size="lg" className="w-full" onClick={() => setCreating(true)}>
          <MessageSquarePlus /> Raise a complaint
        </Button>
      )}
      <Segmented value={tab} onChange={setTab} options={[
        { value: "open", label: "Open", count: list.filter(isOpen).length },
        { value: "resolved", label: "Closed" },
        { value: "all", label: "All" },
      ]} />
      <div className="space-y-2.5">
        {shown.length === 0 && <Empty>Nothing here.</Empty>}
        {shown.map((c) => (
          <Tile key={c.id} onClick={manage ? () => setEditing(c) : undefined} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-muted-foreground">{c.id} · {c.flatId} · {c.area}</span>
              <Pill>{c.status}</Pill>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display font-semibold">{c.category}</div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <Pill>{c.priority}</Pill>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span>{c.date}</span>
              {manage && <span>{c.resident}</span>}
              {c.assigned && <span>Assigned: {c.assigned}</span>}
            </div>
            {c.comments.length > 0 && (
              <div className="rounded-xl bg-muted px-3 py-2 text-xs text-foreground">
                <span className="font-semibold">Secretary: </span>{c.comments[c.comments.length - 1]}
              </div>
            )}
            {!manage && c.status === "Resolved" && (
              <Button size="sm" variant="outline" onClick={() => { updateComplaint(c.id, { status: "Submitted" }, "Reopened by resident"); toast.success(`${c.id} reopened`); }}>
                <RotateCcw /> Reopen
              </Button>
            )}
          </Tile>
        ))}
      </div>

      {manage && editing && <ManageSheet c={editing} onClose={() => setEditing(null)} />}
      {!manage && <NewComplaint open={creating} onClose={() => setCreating(false)} />}
    </div>
  );
}

function ManageSheet({ c, onClose }: { c: Complaint; onClose: () => void }) {
  const updateComplaint = useDemo((s) => s.updateComplaint);
  const [status, setStatus] = useState<ComplaintStatus>(c.status);
  const [assigned, setAssigned] = useState(c.assigned ?? "");
  const [comment, setComment] = useState("");
  return (
    <BottomSheet open onClose={onClose} title={`${c.id} · ${c.category}`}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{c.description}</p>
        <Field label="Status">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", status === s ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card")}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="Assign to"><input className={inputCls} value={assigned} onChange={(e) => setAssigned(e.target.value)} placeholder="Staff or vendor" /></Field>
        <Field label="Comment to resident"><textarea className={cn(inputCls, "h-20 py-2")} value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
        <Button variant="brand" size="lg" className="w-full" onClick={() => {
          updateComplaint(c.id, { status, assigned: assigned || undefined }, comment || undefined);
          toast.success("Complaint updated — resident notified");
          onClose();
        }}>Save update</Button>
      </div>
    </BottomSheet>
  );
}

function NewComplaint({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addComplaint = useDemo((s) => s.addComplaint);
  const [category, setCategory] = useState<string>(CATEGORIES[0] ?? "Other");
  const [area, setArea] = useState<"Flat" | "Common area">("Flat");
  const [priority, setPriority] = useState<Complaint["priority"]>("Medium");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  return (
    <BottomSheet open={open} onClose={onClose} title="New complaint">
      <div className="space-y-3.5">
        <Field label="Category"><NativeSelect value={category} onChange={setCategory} options={CATEGORIES} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Where"><NativeSelect value={area} onChange={(v) => setArea(v as typeof area)} options={["Flat", "Common area"]} /></Field>
          <Field label="Priority"><NativeSelect value={priority} onChange={(v) => setPriority(v as Complaint["priority"])} options={["Low", "Medium", "High", "Emergency"]} /></Field>
        </div>
        <Field label="Describe the issue"><textarea className={cn(inputCls, "h-24 py-2")} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
          <Paperclip className="size-4" /> {file || "Attach photo or video"}
          <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
        </label>
        <Button variant="brand" size="lg" className="w-full" onClick={() => {
          if (!description.trim()) return void toast.error("Please describe the issue.");
          addComplaint({ flatId: ME_FLAT, resident: "Priya Sharma", category, area, priority, description });
          toast.success("Complaint submitted to the Secretary");
          setDescription(""); setFile(""); onClose();
        }}>Submit complaint</Button>
      </div>
    </BottomSheet>
  );
}
