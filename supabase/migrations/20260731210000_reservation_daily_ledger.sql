-- DreamEffect — Journal de revenus quotidiens (réservations confirmées)

CREATE TABLE IF NOT EXISTS public.reservation_daily_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ledger_date DATE NOT NULL,
  daily_total NUMERIC(10, 2) NOT NULL CHECK (daily_total >= 0),
  owner_amount NUMERIC(10, 2) NOT NULL CHECK (owner_amount >= 0),
  company_amount NUMERIC(10, 2) NOT NULL CHECK (company_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reservation_id, ledger_date)
);

CREATE INDEX IF NOT EXISTS idx_reservation_daily_ledger_owner_date
  ON public.reservation_daily_ledger (owner_id, ledger_date DESC);

CREATE INDEX IF NOT EXISTS idx_reservation_daily_ledger_vehicle_date
  ON public.reservation_daily_ledger (vehicle_id, ledger_date DESC);

CREATE INDEX IF NOT EXISTS idx_reservation_daily_ledger_reservation
  ON public.reservation_daily_ledger (reservation_id);

ALTER TABLE public.reservation_daily_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_daily_ledger_admin_all" ON public.reservation_daily_ledger;
CREATE POLICY "reservation_daily_ledger_admin_all"
  ON public.reservation_daily_ledger
  FOR ALL
  USING (public.auth_is_admin())
  WITH CHECK (public.auth_is_admin());

DROP POLICY IF EXISTS "reservation_daily_ledger_owner_read" ON public.reservation_daily_ledger;
CREATE POLICY "reservation_daily_ledger_owner_read"
  ON public.reservation_daily_ledger
  FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "reservation_daily_ledger_service_role" ON public.reservation_daily_ledger;
CREATE POLICY "reservation_daily_ledger_service_role"
  ON public.reservation_daily_ledger
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.reservation_daily_ledger IS
  'Écritures journalières de revenus pour les locations confirmées (60/40 automatique).';
