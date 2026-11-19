import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame, pageHead } from "@/components/mobile/shell";
import { Field, NativeSelect, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/register")({
  head: pageHead("Register apartment", "Register your apartment on ResiCore. Admin approval activates it."),
  component: Register,
});

function Register() {
  const registerApartment = useDemo((s) => s.registerApartment);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "Telangana", pin: "", blocks: "2", floors: "4", flats: "16", type: "Gated community", secretary: "", phone: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.secretary || !form.phone) return void toast.error("Fill apartment name, city, secretary and phone.");
    registerApartment({ name: form.name, city: form.city, blocks: Number(form.blocks), flats: Number(form.flats), secretary: form.secretary, phone: form.phone });
    setDone(true);
  };

  return (
    <PhoneFrame>
      <header className="flex items-center gap-3 border-b border-border/60 px-4 pb-3 pt-4">
        <Link to="/" aria-label="Back" className="grid size-10 place-items-center rounded-xl bg-card shadow-card"><ArrowLeft className="size-[18px]" /></Link>
        <div className="font-display font-semibold">Register apartment</div>
      </header>
      <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {done ? (
          <div className="animate-rise space-y-4 pt-10 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <h1 className="text-2xl font-semibold">Sent for approval</h1>
            <p className="text-sm text-muted-foreground">{form.name} is waiting for Admin approval. You'll get a notification once it's active.</p>
            <div className="flex flex-col gap-2 pt-4">
              <Button asChild variant="brand" size="lg"><Link to="/admin/apartments">See it as Admin</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/">Back to start</Link></Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="animate-rise space-y-4">
            <p className="text-sm text-muted-foreground">Secretaries register the apartment. Admin approval is required before it becomes active.</p>
            <Tile className="space-y-3">
              <Field label="Apartment name"><input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Sunrise Enclave" /></Field>
              <Field label="Address"><input className={inputCls} value={form.address} onChange={set("address")} placeholder="Street, area" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City"><input className={inputCls} value={form.city} onChange={set("city")} /></Field>
                <Field label="PIN code"><input className={inputCls} value={form.pin} onChange={set("pin")} inputMode="numeric" /></Field>
              </div>
              <Field label="State"><input className={inputCls} value={form.state} onChange={set("state")} /></Field>
            </Tile>
            <Tile className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Blocks"><input className={inputCls} value={form.blocks} onChange={set("blocks")} inputMode="numeric" /></Field>
                <Field label="Floors"><input className={inputCls} value={form.floors} onChange={set("floors")} inputMode="numeric" /></Field>
                <Field label="Flats"><input className={inputCls} value={form.flats} onChange={set("flats")} inputMode="numeric" /></Field>
              </div>
              <Field label="Apartment type">
                <NativeSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["Gated community", "Standalone building", "Villa community", "Township"]} />
              </Field>
              <Field label="Logo (optional)"><input type="file" accept="image/*" className="text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:font-semibold file:text-accent-foreground" /></Field>
            </Tile>
            <Tile className="space-y-3">
              <Field label="Secretary name"><input className={inputCls} value={form.secretary} onChange={set("secretary")} /></Field>
              <Field label="Contact number"><input className={inputCls} value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="+91" /></Field>
            </Tile>
            <Button type="submit" variant="brand" size="lg" className="w-full">Submit for approval</Button>
          </form>
        )}
      </main>
    </PhoneFrame>
  );
}
