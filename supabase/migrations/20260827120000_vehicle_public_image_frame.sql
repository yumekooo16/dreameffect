-- DreamEffect — cadrage image publique + limite galerie (5 photos max côté app)

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS public_image_fit TEXT NOT NULL DEFAULT 'cover',
  ADD COLUMN IF NOT EXISTS public_image_position_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS public_image_position_y SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS public_image_scale SMALLINT NOT NULL DEFAULT 100;

COMMENT ON COLUMN public.vehicles.public_image_fit IS
  'object-fit sur le site public : cover | contain';
COMMENT ON COLUMN public.vehicles.public_image_position_x IS
  'object-position X en % (0–100) pour le site public';
COMMENT ON COLUMN public.vehicles.public_image_position_y IS
  'object-position Y en % (0–100) pour le site public';
COMMENT ON COLUMN public.vehicles.public_image_scale IS
  'Zoom affiché sur le site public (100–150 %)';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_public_image_fit_check'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_public_image_fit_check
      CHECK (public_image_fit IN ('cover', 'contain'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_public_image_position_x_check'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_public_image_position_x_check
      CHECK (public_image_position_x BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_public_image_position_y_check'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_public_image_position_y_check
      CHECK (public_image_position_y BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_public_image_scale_check'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_public_image_scale_check
      CHECK (public_image_scale BETWEEN 100 AND 150);
  END IF;
END $$;
