import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { AuthLayout } from "@/components/mobile/auth-card";
import { Field, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: pageHead("Choose a new password", "Set a new password for your ResiCore account."),
  component: ResetPassword,
});

function ResetPassword() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const recovery = window.location.hash.includes("type=recovery");
    supabase.auth.getSession().then(({ data }) => setReady(recovery || !!data.session));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) return void toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return void toast.error("The two passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AuthLayout eyebrow="Account recovery" title="Choose a new password" subtitle="Use at least 6 characters.">
      {ready === false ? (
        <Tile className="space-y-3 text-sm text-muted-foreground">
          This reset link is missing or has expired. Ask for a new one from the sign-in screen.
          <Button variant="ink" className="w-full" onClick={() => navigate({ to: "/auth" })}>Go to sign in</Button>
        </Tile>
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <Field label="New password"><input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></Field>
          <Field label="Confirm new password"><input type="password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required /></Field>
          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy || ready === null}>{busy ? "Saving…" : "Save new password"}</Button>
        </form>
      )}
    </AuthLayout>
  );
}
