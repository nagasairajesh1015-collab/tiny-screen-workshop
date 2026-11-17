import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/mobile/shell";
import { Screen } from "@/components/mobile/kit";
import { CommunityHub } from "@/components/mobile/community-hub";

export const Route = createFileRoute("/secretary/community")({
  head: pageHead("Community", "Publish notices, events, polls and funds for residents."),
  component: () => (
    <Screen title="Community" subtitle="Notices, events, polls and funds">
      <CommunityHub manage />
    </Screen>
  ),
});
