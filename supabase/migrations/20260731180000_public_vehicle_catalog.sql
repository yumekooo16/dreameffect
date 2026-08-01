-- DreamEffect — Colonnes catalogue public + accès lecture anon

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS daily_rate numeric(10, 2),
  ADD COLUMN IF NOT EXISTS fuel text,
  ADD COLUMN IF NOT EXISTS transmission text,
  ADD COLUMN IF NOT EXISTS power integer,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS vehicles_slug_unique
  ON public.vehicles (slug)
  WHERE slug IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Lecture publique (anon) — véhicules publiés uniquement
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "vehicles_public_select" ON public.vehicles;
CREATE POLICY "vehicles_public_select"
  ON public.vehicles
  FOR SELECT
  TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "vehicle_images_public_select" ON public.vehicle_images;
CREATE POLICY "vehicle_images_public_select"
  ON public.vehicle_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.vehicles v
      WHERE v.id = vehicle_id
        AND v.is_published = true
    )
  );

-- ---------------------------------------------------------------------------
-- Storage : lecture publique des images véhicules publiés
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'vehicle-images'
  ) THEN
    DROP POLICY IF EXISTS "vehicle_images_anon_read" ON storage.objects;
    CREATE POLICY "vehicle_images_anon_read"
      ON storage.objects
      FOR SELECT
      TO anon
      USING (bucket_id = 'vehicle-images');
  END IF;
END $$;
