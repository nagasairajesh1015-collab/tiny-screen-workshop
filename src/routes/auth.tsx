import { useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { AuthLayout } from "@/components/mobile/auth-card";
import { Field, Segmented, Tile, inputCls } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { meQuery, useMe } from "@/hooks/use-me";
import { signOut } from "@/lib/sign-out";

export const Route = createFileRoute("/auth")({
  head: pageHead("Sign in", "Sign in or create your ResiCore account for your apartment."),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function friendly(msg: string) {
  if (/invalid login/i.test(msg)) return "Wrong email or password.";
  if (/not confirmed/i.test(msg)) return "Please confirm your email first — check your inbox.";
  if (/already registered/i.test(msg)) return "This email already has an account. Sign in instead.";
  if (/password/i.test(msg) && /6/.test(msg)) return "Password must be at least 6 characters.";
  return msg;
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"" | "confirm" | "reset">("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const who = await queryClient.fetchQuery({ ...meQuery, staleTime: 0 });
        toast.success("Signed in");
        navigate({ to: who?.home ?? "/pending", replace: true });
      } else if (mode === "signup") {
        if (!name.trim() || !/^\d{10}$/.test(mobile.replace(/\D/g, ""))) throw new Error("Enter your name and a 10-digit mobile number.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/auth`, data: { name: name.trim(), mobile: mobile.replace(/\D/g, "") } },
        });
        if (error) throw error;
        if (data.session) {
          const who = await queryClient.fetchQuery({ ...meQuery, staleTime: 0 });
          navigate({ to: who?.home ?? "/pending", replace: true });
        } else setSent("confirm");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("reset");
      }
    } catch (err) {
      toast.error(friendly(err instanceof Error ? err.message : "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  if (me) {
    return (
      <AuthLayout eyebrow="Signed in" title={`Hi, ${me.name.split(" ")[0]}`} subtitle={me.email}>
        <Button variant="brand" size="lg" className="w-full" onClick={() => navigate({ to: me.home })}>Continue <ArrowRight /></Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={async () => { await signOut(queryClient); toast("Signed out"); }}>Sign out</Button>
      </AuthLayout>
    );
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="Check your inbox" title={sent === "confirm" ? "Confirm your email" : "Reset link sent"} subtitle={`We sent an email to ${email}.`}>
        <Tile className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><MailCheck className="size-5" /></span>
          <p className="text-sm text-muted-foreground">{sent === "confirm" ? "Tap the link in the email to activate your account, then sign in here." : "Tap the link in the email to choose a new password."}</p>
        </Tile>
        <Button variant="ink" size="lg" className="w-full" onClick={() => { setSent(""); setMode("signin"); }}>Back to sign in</Button>
      </AuthLayout>
    );
  }

  const titles: Record<Mode, [string, string]> = {
    signin: ["Welcome back", "Sign in to manage dues, visitors and complaints."],
    signup: ["Create your account", "Owners, tenants, secretaries and guards all start here."],
    forgot: ["Forgot password", "Enter your email and we'll send a reset link."],
  };

  return (
    <AuthLayout eyebrow="Resident & staff login" title={titles[mode][0]} subtitle={titles[mode][1]}>
      {mode !== "forgot" && (
        <Segmented value={mode} onChange={setMode} options={[{ value: "signin", label: "Sign in" }, { value: "signup", label: "Create account" }]} />
      )}
      <form onSubmit={submit} className="space-y-3.5">
        {mode === "signup" && (
          <>
            <Field label="Full name"><IconInput icon={<User />}><input className={inputCls + " pl-10"} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></IconInput></Field>
            <Field label="Mobile number"><IconInput icon={<Phone />}><input className={inputCls + " pl-10"} value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" required /></IconInput></Field>
          </>
        )}
        <Field label="Email"><IconInput icon={<Mail />}><input type="email" className={inputCls + " pl-10"} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></IconInput></Field>
        {mode !== "forgot" && (
          <Field label="Password">
            <IconInput icon={<Lock />}>
              <input type={show ? "text" : "password"} className={inputCls + " pl-10 pr-11"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required />
              <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </IconInput>
          </Field>
        )}
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </Button>
      </form>
      <div className="text-center text-sm">
        {mode === "signin" && <button className="font-semibold text-primary" onClick={() => setMode("forgot")}>Forgot password?</button>}
        {mode === "forgot" && <button className="font-semibold text-primary" onClick={() => setMode("signin")}>Back to sign in</button>}
      </div>
      {mode === "signup" && <p className="text-center text-[11px] text-muted-foreground">After you sign up, your apartment's Secretary approves your flat before you can see it.</p>}
    </AuthLayout>
  );
}

function IconInput({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">{icon}</span>
      {children}
    </div>
  );
}
