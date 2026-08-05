-- À exécuter dans Supabase → SQL Editor si le catalogue public est vide côté site
-- (véhicules visibles en admin mais pas sur le site vitrine)

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
