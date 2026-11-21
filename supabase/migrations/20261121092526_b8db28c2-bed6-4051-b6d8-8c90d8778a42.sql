-- 1. Roles live in their own table (never on profiles)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  society_id uuid REFERENCES public.societies(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_roles_unique ON public.user_roles (user_id, role, COALESCE(society_id, '00000000-0000-0000-0000-000000000000'::uuid));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Role helpers (security definer avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'ADMIN' AND society_id IS NULL)
$$;

CREATE OR REPLACE FUNCTION public.has_society_role(_user_id uuid, _society_id uuid, _roles public.user_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND society_id = _society_id AND role = ANY(_roles))
$$;

CREATE OR REPLACE FUNCTION public.is_society_member(_user_id uuid, _society_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND society_id = _society_id)
$$;

CREATE OR REPLACE FUNCTION public.is_society_manager(_user_id uuid, _society_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_platform_admin(_user_id)
      OR public.has_society_role(_user_id, _society_id, ARRAY['SECRETARY','CHAIRMAN','TREASURER']::public.user_role[])
$$;

CREATE POLICY "Users see their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()) OR (society_id IS NOT NULL AND public.is_society_manager(auth.uid(), society_id)));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- 3. Lock down existing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_links ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.societies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.society_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.society_links TO authenticated;
GRANT ALL ON public.profiles, public.societies, public.units, public.society_settings, public.society_links TO service_role;

-- profiles
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_platform_admin(auth.uid())
    OR (active_society_id IS NOT NULL AND public.is_society_manager(auth.uid(), active_society_id)));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- societies
CREATE POLICY "Members read their society" ON public.societies FOR SELECT TO authenticated
  USING (public.is_society_member(auth.uid(), id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Managers update society" ON public.societies FOR UPDATE TO authenticated
  USING (public.is_society_manager(auth.uid(), id)) WITH CHECK (public.is_society_manager(auth.uid(), id));
CREATE POLICY "Admins add societies" ON public.societies FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- units
CREATE POLICY "Members read units" ON public.units FOR SELECT TO authenticated
  USING (public.is_society_member(auth.uid(), society_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Managers add units" ON public.units FOR INSERT TO authenticated
  WITH CHECK (public.is_society_manager(auth.uid(), society_id));
CREATE POLICY "Managers update units" ON public.units FOR UPDATE TO authenticated
  USING (public.is_society_manager(auth.uid(), society_id)) WITH CHECK (public.is_society_manager(auth.uid(), society_id));
CREATE POLICY "Managers delete units" ON public.units FOR DELETE TO authenticated
  USING (public.is_society_manager(auth.uid(), society_id));

-- society_settings
CREATE POLICY "Members read settings" ON public.society_settings FOR SELECT TO authenticated
  USING (public.is_society_member(auth.uid(), society_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Managers add settings" ON public.society_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_society_manager(auth.uid(), society_id));
CREATE POLICY "Managers update settings" ON public.society_settings FOR UPDATE TO authenticated
  USING (public.is_society_manager(auth.uid(), society_id)) WITH CHECK (public.is_society_manager(auth.uid(), society_id));

-- society_links (join tokens: managers only)
CREATE POLICY "Managers read links" ON public.society_links FOR SELECT TO authenticated
  USING (public.is_society_manager(auth.uid(), society_id));
CREATE POLICY "Managers add links" ON public.society_links FOR INSERT TO authenticated
  WITH CHECK (public.is_society_manager(auth.uid(), society_id));
CREATE POLICY "Managers update links" ON public.society_links FOR UPDATE TO authenticated
  USING (public.is_society_manager(auth.uid(), society_id)) WITH CHECK (public.is_society_manager(auth.uid(), society_id));

-- 4. Profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, mobile, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(COALESCE(NEW.email, ''), '@', 1), 'Resident'),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Automatic roles, only once the email is confirmed (so nobody can claim an email they don't own)
CREATE OR REPLACE FUNCTION public.grant_roles_on_confirm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s record;
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.email_confirmed_at IS NOT NULL THEN RETURN NEW; END IF;

  IF lower(NEW.email) = 'nagasairajesh1015@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role, society_id) VALUES (NEW.id, 'ADMIN', NULL) ON CONFLICT DO NOTHING;
  END IF;

  FOR s IN SELECT id FROM public.societies WHERE lower(contact_email) = lower(NEW.email) LOOP
    INSERT INTO public.user_roles (user_id, role, society_id) VALUES (NEW.id, 'SECRETARY', s.id) ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET active_society_id = s.id WHERE id = NEW.id AND active_society_id IS NULL;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER on_auth_user_created_roles AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_roles_on_confirm();
CREATE TRIGGER on_auth_user_confirmed_roles AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_roles_on_confirm();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_roles_on_confirm() FROM PUBLIC, anon, authenticated;