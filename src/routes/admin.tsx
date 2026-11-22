import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Building, CreditCard, LayoutDashboard, Users } from "lucide-react";
import { RoleShell } from "@/components/mobile/shell";
import { RoleGate } from "@/components/auth/role-gate";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  return (
    <RoleGate area="/admin">
    <RoleShell role="admin" nav={[
      { to: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
      { to: "/admin/apartments", label: "Apartments", icon: Building },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/subscriptions", label: "Plans", icon: CreditCard },
    ]}>
      <Outlet />
    </RoleShell>
    </RoleGate>
  );
}
