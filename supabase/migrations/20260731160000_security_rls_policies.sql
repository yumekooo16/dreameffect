-- DreamEffect — Sécurité : fonctions d'aide et politiques RLS
-- À exécuter sur Supabase après les migrations précédentes.

-- ---------------------------------------------------------------------------
-- Fonctions utilitaires (SECURITY DEFINER pour éviter la récursion RLS)
-- ---------------------------------------------------------------------------

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

CREATE OR REPLACE FUNCTION public.auth_is_owner()
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
      AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_owns_vehicle(p_vehicle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vehicles
    WHERE id = p_vehicle_id
      AND owner_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_is_owner() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_owns_vehicle(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_is_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_owns_vehicle(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR auth_is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND NOT auth_is_admin())
  WITH CHECK (id = auth.uid() AND role = 'owner');

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ---------------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------------

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;
CREATE POLICY "vehicles_select"
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (auth_is_admin() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "vehicles_admin_insert" ON public.vehicles;
CREATE POLICY "vehicles_admin_insert"
  ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "vehicles_admin_update" ON public.vehicles;
CREATE POLICY "vehicles_admin_update"
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "vehicles_admin_delete" ON public.vehicles;
CREATE POLICY "vehicles_admin_delete"
  ON public.vehicles
  FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- VEHICLE_IMAGES
-- ---------------------------------------------------------------------------

ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_images_select" ON public.vehicle_images;
CREATE POLICY "vehicle_images_select"
  ON public.vehicle_images
  FOR SELECT
  TO authenticated
  USING (auth_is_admin() OR auth_owns_vehicle(vehicle_id));

DROP POLICY IF EXISTS "vehicle_images_admin_insert" ON public.vehicle_images;
CREATE POLICY "vehicle_images_admin_insert"
  ON public.vehicle_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "vehicle_images_admin_update" ON public.vehicle_images;
CREATE POLICY "vehicle_images_admin_update"
  ON public.vehicle_images
  FOR UPDATE
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "vehicle_images_admin_delete" ON public.vehicle_images;
CREATE POLICY "vehicle_images_admin_delete"
  ON public.vehicle_images
  FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- RESERVATIONS
-- ---------------------------------------------------------------------------

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
CREATE POLICY "reservations_select"
  ON public.reservations
  FOR SELECT
  TO authenticated
  USING (auth_is_admin() OR auth_owns_vehicle(vehicle_id));

DROP POLICY IF EXISTS "reservations_admin_insert" ON public.reservations;
CREATE POLICY "reservations_admin_insert"
  ON public.reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "reservations_admin_update" ON public.reservations;
CREATE POLICY "reservations_admin_update"
  ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "reservations_admin_delete" ON public.reservations;
CREATE POLICY "reservations_admin_delete"
  ON public.reservations
  FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- MAINTENANCE
-- ---------------------------------------------------------------------------

ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maintenance_select" ON public.maintenance;
CREATE POLICY "maintenance_select"
  ON public.maintenance
  FOR SELECT
  TO authenticated
  USING (auth_is_admin() OR auth_owns_vehicle(vehicle_id));

DROP POLICY IF EXISTS "maintenance_admin_insert" ON public.maintenance;
CREATE POLICY "maintenance_admin_insert"
  ON public.maintenance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "maintenance_admin_update" ON public.maintenance;
CREATE POLICY "maintenance_admin_update"
  ON public.maintenance
  FOR UPDATE
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "maintenance_admin_delete" ON public.maintenance;
CREATE POLICY "maintenance_admin_delete"
  ON public.maintenance
  FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------------------------

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (auth_is_admin() OR auth_owns_vehicle(vehicle_id));

DROP POLICY IF EXISTS "documents_admin_insert" ON public.documents;
CREATE POLICY "documents_admin_insert"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "documents_admin_update" ON public.documents;
CREATE POLICY "documents_admin_update"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "documents_admin_delete" ON public.documents;
CREATE POLICY "documents_admin_delete"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR auth_is_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "notifications_admin_delete" ON public.notifications;
CREATE POLICY "notifications_admin_delete"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ---------------------------------------------------------------------------
-- OWNER_PAYOUTS (renforce la migration existante)
-- ---------------------------------------------------------------------------

ALTER TABLE public.owner_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage owner_payouts" ON public.owner_payouts;
DROP POLICY IF EXISTS "owner_payouts_admin_all" ON public.owner_payouts;
CREATE POLICY "owner_payouts_admin_all"
  ON public.owner_payouts
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- ---------------------------------------------------------------------------
-- Vues propriétaire — accès en lecture pour les utilisateurs authentifiés
-- (le filtrage repose sur les RLS des tables sous-jacentes)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'owner_vehicle_dashboard'
  ) THEN
    GRANT SELECT ON public.owner_vehicle_dashboard TO authenticated;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'owner_monthly_revenue'
  ) THEN
    GRANT SELECT ON public.owner_monthly_revenue TO authenticated;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'owner_current_month_revenue'
  ) THEN
    GRANT SELECT ON public.owner_current_month_revenue TO authenticated;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Storage : bucket vehicle-images (lecture authentifiée)
-- Les uploads restent via service role côté serveur admin.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'vehicle-images'
  ) THEN
    DROP POLICY IF EXISTS "vehicle_images_authenticated_read" ON storage.objects;
    CREATE POLICY "vehicle_images_authenticated_read"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'vehicle-images');
  END IF;
END $$;
