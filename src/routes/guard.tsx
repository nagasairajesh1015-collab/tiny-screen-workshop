import { createFileRoute, Outlet } from "@tanstack/react-router";
import { History, LayoutDashboard, LogIn } from "lucide-react";
import { RoleShell } from "@/components/mobile/shell";

export const Route = createFileRoute("/guard")({ component: GuardLayout });

function GuardLayout() {
  return (
    <RoleShell role="guard" nav={[
      { to: "/guard", label: "Gate", icon: LayoutDashboard, exact: true },
      { to: "/guard/entry", label: "New entry", icon: LogIn },
      { to: "/guard/history", label: "History", icon: History },
    ]}>
      <Outlet />
    </RoleShell>
  );
}
