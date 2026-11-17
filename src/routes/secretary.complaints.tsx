import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/mobile/shell";
import { Screen } from "@/components/mobile/kit";
import { ComplaintsBoard } from "@/components/mobile/complaints-board";

export const Route = createFileRoute("/secretary/complaints")({
  head: pageHead("Complaints", "Review, assign and resolve resident complaints."),
  component: () => (
    <Screen title="Complaints" subtitle="Tap a complaint to update it">
      <ComplaintsBoard manage />
    </Screen>
  ),
});
