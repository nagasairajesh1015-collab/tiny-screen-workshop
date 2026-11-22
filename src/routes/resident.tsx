import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, IndianRupee, Headset, UserRoundCheck, Users } from "lucide-react";
import { RoleShell } from "@/components/mobile/shell";
import { RoleGate } from "@/components/auth/role-gate";

export const Route = createFileRoute("/resident")({ component: ResidentLayout });

function ResidentLayout() {
  return (
    <RoleGate area="/resident">
    <RoleShell role="resident" profileTo="/resident/profile" nav={[
      { to: "/resident", label: "Home", icon: Home, exact: true },
      { to: "/resident/visitors", label: "Visitors", icon: UserRoundCheck },
      { to: "/resident/pay", label: "Pay", icon: IndianRupee },
      { to: "/resident/complaints", label: "Helpdesk", icon: Headset },
      { to: "/resident/community", label: "Community", icon: Users },
    ]}>
      <Outlet />
    </RoleShell>
    </RoleGate>
  );
}
