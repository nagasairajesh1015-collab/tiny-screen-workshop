import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, IndianRupee, MessageSquareWarning, UserRound, Users } from "lucide-react";
import { RoleShell } from "@/components/mobile/shell";

export const Route = createFileRoute("/resident")({ component: ResidentLayout });

function ResidentLayout() {
  return (
    <RoleShell role="resident" nav={[
      { to: "/resident", label: "Home", icon: Home, exact: true },
      { to: "/resident/pay", label: "Pay", icon: IndianRupee },
      { to: "/resident/complaints", label: "Help", icon: MessageSquareWarning },
      { to: "/resident/community", label: "Community", icon: Users },
      { to: "/resident/profile", label: "Profile", icon: UserRound },
    ]}>
      <Outlet />
    </RoleShell>
  );
}
