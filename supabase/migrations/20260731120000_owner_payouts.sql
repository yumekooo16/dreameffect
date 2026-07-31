-- Suivi interne des reversements propriétaires (sans paiement automatique)
CREATE TABLE IF NOT EXISTS owner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_due NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_payouts_owner_id ON owner_payouts(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_payouts_status ON owner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_owner_payouts_period ON owner_payouts(period_start, period_end);

ALTER TABLE owner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage owner_payouts"
  ON owner_payouts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
