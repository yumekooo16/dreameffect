-- DreamEffect — Modes de rémunération propriétaire : pourcentage ou prix pro

-- Profil propriétaire : mode de calcul des gains
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS revenue_mode text NOT NULL DEFAULT 'percentage';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS owner_revenue_share numeric(5, 4) DEFAULT 0.6000;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_revenue_mode_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_revenue_mode_check
      CHECK (revenue_mode IN ('percentage', 'pro_price'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_owner_revenue_share_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_owner_revenue_share_check
      CHECK (
        owner_revenue_share IS NULL
        OR (owner_revenue_share >= 0 AND owner_revenue_share <= 1)
      );
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.revenue_mode IS
  'percentage = part du CA client ; pro_price = grille tarifaire pro véhicule';
COMMENT ON COLUMN public.profiles.owner_revenue_share IS
  'Part propriétaire (0–1) si revenue_mode = percentage. Défaut 0.60.';

-- Grille prix pro (reversement propriétaire) sur chaque véhicule
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS pro_price_24h_weekday numeric(10, 2),
  ADD COLUMN IF NOT EXISTS pro_price_24h_weekend numeric(10, 2),
  ADD COLUMN IF NOT EXISTS pro_price_48h_weekend numeric(10, 2),
  ADD COLUMN IF NOT EXISTS pro_price_72h_weekend numeric(10, 2),
  ADD COLUMN IF NOT EXISTS pro_price_7_days numeric(10, 2),
  ADD COLUMN IF NOT EXISTS pro_included_km integer DEFAULT 200,
  ADD COLUMN IF NOT EXISTS pro_extra_km_rate numeric(10, 2) DEFAULT 1.00;

COMMENT ON COLUMN public.vehicles.pro_price_24h_weekday IS
  'Reversement propriétaire — 24 h semaine (prix pro)';
COMMENT ON COLUMN public.vehicles.pro_included_km IS
  'Kilomètres inclus dans le forfait pro';
COMMENT ON COLUMN public.vehicles.pro_extra_km_rate IS
  'Tarif € / km supplémentaire (prix pro)';

-- AM Motion Cars + BMW Série 2 Gran Coupé : mode prix pro + grille fournie
UPDATE public.profiles AS p
SET
  revenue_mode = 'pro_price',
  owner_revenue_share = NULL
FROM auth.users AS u
WHERE p.id = u.id
  AND p.role = 'owner'
  AND lower(u.email) IN (
    'contact@ammotioncars.com',
    'ammotioncars@dreameffect.fr'
  );

UPDATE public.vehicles
SET
  pro_price_24h_weekday = 70,
  pro_price_24h_weekend = 120,
  pro_price_48h_weekend = 200,
  pro_price_72h_weekend = 300,
  pro_price_7_days = 500,
  pro_included_km = 200,
  pro_extra_km_rate = 1
WHERE slug = 'bmw-serie-2-gran-coupe'
   OR (
     lower(brand) = 'bmw'
     AND lower(model) LIKE '%serie%2%'
     AND lower(coalesce(version, '')) LIKE '%gran%coupe%'
   );
