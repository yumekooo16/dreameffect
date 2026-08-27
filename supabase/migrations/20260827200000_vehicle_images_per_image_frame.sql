-- DreamEffect — cadrage par photo (accueil / galerie)

ALTER TABLE public.vehicle_images
  ADD COLUMN IF NOT EXISTS image_fit TEXT NOT NULL DEFAULT 'cover',
  ADD COLUMN IF NOT EXISTS image_position_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_position_y SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_scale SMALLINT NOT NULL DEFAULT 100;

COMMENT ON COLUMN public.vehicle_images.image_fit IS
  'object-fit de cette photo : cover | contain';
COMMENT ON COLUMN public.vehicle_images.image_position_x IS
  'object-position X en % (0–100) pour cette photo';
COMMENT ON COLUMN public.vehicle_images.image_position_y IS
  'object-position Y en % (0–100) pour cette photo';
COMMENT ON COLUMN public.vehicle_images.image_scale IS
  'Zoom affiché pour cette photo (100–150 %)';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_images_image_fit_check'
  ) THEN
    ALTER TABLE public.vehicle_images
      ADD CONSTRAINT vehicle_images_image_fit_check
      CHECK (image_fit IN ('cover', 'contain'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_images_image_position_x_check'
  ) THEN
    ALTER TABLE public.vehicle_images
      ADD CONSTRAINT vehicle_images_image_position_x_check
      CHECK (image_position_x BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_images_image_position_y_check'
  ) THEN
    ALTER TABLE public.vehicle_images
      ADD CONSTRAINT vehicle_images_image_position_y_check
      CHECK (image_position_y BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_images_image_scale_check'
  ) THEN
    ALTER TABLE public.vehicle_images
      ADD CONSTRAINT vehicle_images_image_scale_check
      CHECK (image_scale BETWEEN 100 AND 150);
  END IF;
END $$;

-- Backfill : photos « site web » / principale héritent du cadrage véhicule
UPDATE public.vehicle_images vi
SET
  image_fit = COALESCE(NULLIF(v.public_image_fit, ''), 'cover'),
  image_position_x = COALESCE(v.public_image_position_x, 50),
  image_position_y = COALESCE(v.public_image_position_y, 50),
  image_scale = COALESCE(v.public_image_scale, 100)
FROM public.vehicles v
WHERE vi.vehicle_id = v.id
  AND (
    (v.public_image_url IS NOT NULL AND vi.image_url = v.public_image_url)
    OR (
      (v.public_image_url IS NULL OR btrim(v.public_image_url) = '')
      AND vi.is_primary = true
    )
  );
