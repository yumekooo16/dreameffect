-- Demandes de contact depuis le site public
-- (inclut auth_is_admin si absent sur ce projet)

CREATE OR REPLACE FUNCTION public.auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
  ON public.contact_submissions (created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_submissions_admin_select" ON public.contact_submissions;
CREATE POLICY "contact_submissions_admin_select"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "contact_submissions_service_role" ON public.contact_submissions;
CREATE POLICY "contact_submissions_service_role"
  ON public.contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
