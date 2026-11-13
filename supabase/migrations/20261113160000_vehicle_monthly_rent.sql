-- DreamEffect — Mode rémunération « loyer mensuel » (par véhicule)

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS monthly_rent numeric(10, 2);

COMMENT ON COLUMN public.vehicles.monthly_rent IS
  'Loyer mensuel fixe versé au propriétaire (mode revenue_mode = monthly_rent)';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_revenue_mode_check'
  ) THEN
    ALTER TABLE public.profiles
      DROP CONSTRAINT profiles_revenue_mode_check;
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_revenue_mode_check
    CHECK (revenue_mode IN ('percentage', 'pro_price', 'monthly_rent'));
END $$;

COMMENT ON COLUMN public.profiles.revenue_mode IS
  'percentage = part du CA client ; pro_price = grille tarifaire pro véhicule ; monthly_rent = loyer mensuel fixe par véhicule';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'vehicles_monthly_rent_check'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_monthly_rent_check
      CHECK (monthly_rent IS NULL OR monthly_rent >= 0);
  END IF;
END $$;
