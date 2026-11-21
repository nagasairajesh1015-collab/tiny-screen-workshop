<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Read zustand state with plain selectors (`useDemo((s) => s.list)`) and filter outside the hook; selectors that return new arrays cause an infinite render loop.
- Shared phone UI pieces live in `src/components/mobile/` (kit, shell); screens compose them so the design stays consistent.
- Pure business rules (dues, UTR duplicates, gate pass checks) live in `src/lib/*.ts` with tests beside them.
- Roles live only in `public.user_roles` (role + society_id + unit_id), checked in RLS via security-definer helpers (`is_platform_admin`, `is_society_member`, `is_society_manager`); never trust `profiles.role`, users can edit their own profile.
- Automatic roles are granted by DB triggers only after email confirmation, so nobody can claim an email they don't own; everyone else lands on `/pending` until approved.
- Where a signed-in person lands is decided by `homeForRoles` in `src/lib/auth-roles.ts`; the signed-in person is read with `useMe()` (browser only), refreshed by the single `onAuthStateChange` listener in `__root.tsx`.
