-- DreamEffect — ordre manuel des photos véhicule (galerie)

ALTER TABLE public.vehicle_images
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

COMMENT ON COLUMN public.vehicle_images.sort_order IS
  'Ordre d''affichage galerie (0 = première). Géré depuis l''admin.';

-- Backfill : ordre actuel ≈ created_at, primary en premier
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY vehicle_id
      ORDER BY is_primary DESC, created_at ASC NULLS LAST, id ASC
    ) - 1 AS rn
  FROM public.vehicle_images
)
UPDATE public.vehicle_images vi
SET sort_order = ranked.rn
FROM ranked
WHERE vi.id = ranked.id
  AND (vi.sort_order IS NULL);

UPDATE public.vehicle_images
SET sort_order = 0
WHERE sort_order IS NULL;

ALTER TABLE public.vehicle_images
  ALTER COLUMN sort_order SET DEFAULT 0,
  ALTER COLUMN sort_order SET NOT NULL;
