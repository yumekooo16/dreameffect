-- DreamEffect — durcissement sécurité : vues owner + storage + notifications RLS

-- ---------------------------------------------------------------------------
-- Vues propriétaire : security_invoker quand supporté (PG 15+)
-- sinon filtre explicite via policies sur tables sous-jacentes déjà en place.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'owner_vehicle_dashboard' AND c.relkind = 'v'
  ) THEN
    BEGIN
      EXECUTE 'ALTER VIEW public.owner_vehicle_dashboard SET (security_invoker = true)';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'owner_vehicle_dashboard: security_invoker non supporté (%)', SQLERRM;
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'owner_monthly_revenue' AND c.relkind = 'v'
  ) THEN
    BEGIN
      EXECUTE 'ALTER VIEW public.owner_monthly_revenue SET (security_invoker = true)';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'owner_monthly_revenue: security_invoker non supporté (%)', SQLERRM;
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'owner_current_month_revenue' AND c.relkind = 'v'
  ) THEN
    BEGIN
      EXECUTE 'ALTER VIEW public.owner_current_month_revenue SET (security_invoker = true)';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'owner_current_month_revenue: security_invoker non supporté (%)', SQLERRM;
    END;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Notifications : garantir RLS
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'notifications'
  ) THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
    CREATE POLICY "notifications_select_own"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (profile_id = auth.uid() OR public.auth_is_admin());

    DROP POLICY IF EXISTS "notifications_update_own_read" ON public.notifications;
    CREATE POLICY "notifications_update_own_read"
      ON public.notifications
      FOR UPDATE
      TO authenticated
      USING (profile_id = auth.uid())
      WITH CHECK (profile_id = auth.uid());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Storage vehicle-images : lecture limitée aux véhicules publiés
-- Chemin attendu : {vehicle_id}/...
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'vehicle-images') THEN
    DROP POLICY IF EXISTS "vehicle_images_anon_read" ON storage.objects;
    DROP POLICY IF EXISTS "vehicle_images_authenticated_read" ON storage.objects;

    CREATE POLICY "vehicle_images_anon_read_published"
      ON storage.objects
      FOR SELECT
      TO anon
      USING (
        bucket_id = 'vehicle-images'
        AND EXISTS (
          SELECT 1
          FROM public.vehicles v
          WHERE v.is_published = true
            AND (
              storage.objects.name LIKE v.id::text || '/%'
              OR storage.objects.name = v.id::text
            )
        )
      );

    CREATE POLICY "vehicle_images_authenticated_read_published"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'vehicle-images'
        AND (
          public.auth_is_admin()
          OR EXISTS (
            SELECT 1
            FROM public.vehicles v
            WHERE v.owner_id = auth.uid()
              AND (
                storage.objects.name LIKE v.id::text || '/%'
                OR storage.objects.name = v.id::text
              )
          )
          OR EXISTS (
            SELECT 1
            FROM public.vehicles v
            WHERE v.is_published = true
              AND (
                storage.objects.name LIKE v.id::text || '/%'
                OR storage.objects.name = v.id::text
              )
          )
        )
      );
  END IF;
END $$;
