-- Corrige le mode rémunération AM Motion si l'email ne correspond pas
-- à ammotioncars@dreameffect.fr (UPDATE initial sans effet).

UPDATE public.profiles AS p
SET
  revenue_mode = 'pro_price',
  owner_revenue_share = NULL
FROM auth.users AS u
WHERE p.id = u.id
  AND p.role = 'owner'
  AND (
    lower(u.email) = 'ammotioncars@dreameffect.fr'
    OR lower(u.email) LIKE '%motion%'
    OR lower(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))) LIKE '%am motion%'
    OR lower(trim(coalesce(p.first_name, ''))) LIKE '%motion%'
  );

UPDATE public.vehicles AS v
SET
  pro_price_24h_weekday = COALESCE(pro_price_24h_weekday, 70),
  pro_price_24h_weekend = COALESCE(pro_price_24h_weekend, 120),
  pro_price_48h_weekend = COALESCE(pro_price_48h_weekend, 200),
  pro_price_72h_weekend = COALESCE(pro_price_72h_weekend, 300),
  pro_price_7_days = COALESCE(pro_price_7_days, 500),
  pro_included_km = COALESCE(pro_included_km, 200),
  pro_extra_km_rate = COALESCE(pro_extra_km_rate, 1)
FROM public.profiles AS p
WHERE v.owner_id = p.id
  AND p.role = 'owner'
  AND p.revenue_mode = 'pro_price'
  AND (
    lower(v.slug) = 'bmw-serie-2-gran-coupe'
    OR (
      lower(v.brand) = 'bmw'
      AND lower(v.model) LIKE '%serie%2%'
    )
  );
