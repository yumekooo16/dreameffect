-- DreamEffect — Grille tarifaire par véhicule

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS price_24h_weekday numeric(10, 2),
  ADD COLUMN IF NOT EXISTS price_24h_weekend numeric(10, 2),
  ADD COLUMN IF NOT EXISTS price_48h_weekend numeric(10, 2),
  ADD COLUMN IF NOT EXISTS price_72h_weekend numeric(10, 2),
  ADD COLUMN IF NOT EXISTS price_7_days numeric(10, 2),
  ADD COLUMN IF NOT EXISTS deposit numeric(10, 2);

-- Rétrocompatibilité : daily_rate = tarif semaine si présent
UPDATE public.vehicles
SET daily_rate = price_24h_weekday
WHERE daily_rate IS NULL
  AND price_24h_weekday IS NOT NULL;
