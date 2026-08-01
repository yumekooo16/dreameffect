-- DreamEffect — Image hero premium (PNG détouré) pour l'espace propriétaire

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN public.vehicles.hero_image_url IS
  'PNG détouré haute résolution pour la présentation premium espace propriétaire';
