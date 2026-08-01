-- DreamEffect — Image de couverture pour le site public (catalogue + fiche)

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS public_image_url TEXT;

COMMENT ON COLUMN public.vehicles.public_image_url IS
  'Image affichée sur le catalogue et en couverture de la fiche publique — peut différer de la photo principale admin';
