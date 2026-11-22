import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Grid2x2, Home, IndianRupee, MessageSquareWarning, Building2 } from "lucide-react";
import { RoleShell } from "@/components/mobile/shell";
import { RoleGate } from "@/components/auth/role-gate";

export const Route = createFileRoute("/secretary")({ component: SecretaryLayout });

function SecretaryLayout() {
  return (
    <RoleGate area="/secretary">
    <RoleShell role="secretary" nav={[
      { to: "/secretary", label: "Home", icon: Home, exact: true },
      { to: "/secretary/maintenance", label: "Dues", icon: IndianRupee },
      { to: "/secretary/residents", label: "Flats", icon: Building2 },
      { to: "/secretary/complaints", label: "Complaints", icon: MessageSquareWarning },
      { to: "/secretary/more", label: "More", icon: Grid2x2 },
    ]}>
      <Outlet />
    </RoleShell>
    </RoleGate>
  );
}
