import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/mobile/shell";
import { Screen } from "@/components/mobile/kit";
import { CommunityHub } from "@/components/mobile/community-hub";

export const Route = createFileRoute("/resident/community")({
  head: pageHead("Community", "Notices, events, polls and funds from your apartment association."),
  component: () => (
    <Screen title="Community" subtitle="Notices, events, polls and funds">
      <CommunityHub manage={false} />
    </Screen>
  ),
});
