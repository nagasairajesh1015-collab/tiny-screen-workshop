import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { pageHead } from "@/components/mobile/shell";
import { AuthLayout } from "@/components/mobile/auth-card";
import { Tile } from "@/components/mobile/kit";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { signOut } from "@/lib/sign-out";

export const Route = createFileRoute("/pending")({
  head: pageHead("Waiting for approval", "Your ResiCore account is waiting for your apartment's approval."),
  component: Pending,
});

function Pending() {
  const { data: me, isLoading, refetch, isFetching } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!isLoading && !me) {
    return (
      <AuthLayout eyebrow="Not signed in" title="Sign in first" subtitle="Sign in to see the status of your account.">
        <Button variant="brand" size="lg" className="w-full" onClick={() => navigate({ to: "/auth" })}>Go to sign in</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="Account pending approval" title="You're almost in" subtitle={me ? `Signed in as ${me.email}` : "Checking your account…"}>
      <Tile className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning"><Clock className="size-5" /></span>
        <div className="text-sm">
          <div className="font-semibold">Waiting for your Secretary</div>
          <p className="mt-0.5 text-muted-foreground">Your apartment's Secretary needs to approve your flat (or your role as staff). You'll see your screens here as soon as they do.</p>
        </div>
      </Tile>
      <Button variant="ink" size="lg" className="w-full" disabled={isFetching} onClick={async () => {
        const r = await refetch();
        if (r.data && r.data.home !== "/pending") navigate({ to: r.data.home });
        else toast("Still waiting for approval");
      }}><RefreshCw /> Check again</Button>
      <Button variant="secondary" size="lg" className="w-full" onClick={async () => { await signOut(queryClient); navigate({ to: "/auth", replace: true }); }}>Sign out</Button>
    </AuthLayout>
  );
}
