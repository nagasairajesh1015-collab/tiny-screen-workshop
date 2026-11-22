import { useEffect, type ReactNode } from "react";
import { useHydrated, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-me";
import { AREA_NAME, areasForRoles, type Area } from "@/lib/auth-roles";

/**
 * Signed-in people only see the sections their roles allow; anyone else is sent to their own home.
 * Signed-out visitors can still browse the sample-data demo.
 */
export function RoleGate({ area, children }: { area: Area; children: ReactNode }) {
  const hydrated = useHydrated();
  const { data: me, isPending } = useMe();
  const navigate = useNavigate();
  const blocked = !!me && !areasForRoles(me.roles).includes(area);

  useEffect(() => {
    if (!blocked || !me) return;
    toast.error(`The ${AREA_NAME[area]} section isn't available for your account.`);
    navigate({ to: me.home, replace: true });
  }, [blocked, me, area, navigate]);

  if (hydrated && (isPending || blocked)) {
    return <div className="grid min-h-dvh place-items-center bg-background text-sm text-muted-foreground">Checking access…</div>;
  }
  return <>{children}</>;
}
