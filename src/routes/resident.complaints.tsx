import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/mobile/shell";
import { Screen } from "@/components/mobile/kit";
import { ComplaintsBoard } from "@/components/mobile/complaints-board";

export const Route = createFileRoute("/resident/complaints")({
  head: pageHead("Helpdesk", "Raise complaints and follow repairs for your flat and common areas."),
  component: () => (
    <Screen title="Helpdesk" subtitle="Your complaints and repair requests">
      <ComplaintsBoard manage={false} />
    </Screen>
  ),
});
