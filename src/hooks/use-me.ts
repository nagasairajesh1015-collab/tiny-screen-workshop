import { queryOptions, useQuery } from "@tanstack/react-query";
import { useHydrated } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { homeForRoles, type RoleRow } from "@/lib/auth-roles";

export interface Me {
  id: string;
  email: string;
  name: string;
  roles: RoleRow[];
  home: ReturnType<typeof homeForRoles>;
}

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async (): Promise<Me | null> => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return null;
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role, society_id").eq("user_id", user.id),
      supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
    ]);
    const rows = (roles ?? []) as RoleRow[];
    return { id: user.id, email: user.email ?? "", name: profile?.name ?? user.email ?? "", roles: rows, home: homeForRoles(rows) };
  },
});

/** Signed-in person (null when signed out). Only runs in the browser, where the session lives. */
export function useMe() {
  const hydrated = useHydrated();
  return useQuery({ ...meQuery, enabled: hydrated });
}
