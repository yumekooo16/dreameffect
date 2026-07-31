-- Notifications (si la table n'existe pas encore en production)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'normal',
  related_id TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_profile_id_idx
  ON public.notifications (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_is_read_idx
  ON public.notifications (profile_id, is_read);

-- Journal d'audit administrateur
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx
  ON public.audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS audit_log_entity_idx
  ON public.audit_log (entity_type, entity_id);

-- Déduplication des automatisations planifiées (1 envoi / jour / entité)
CREATE TABLE IF NOT EXISTS public.automation_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  sent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (automation_key, entity_type, entity_id, sent_on)
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_sent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_admin_select" ON public.audit_log;
CREATE POLICY "audit_log_admin_select"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (auth_is_admin());

DROP POLICY IF EXISTS "audit_log_admin_insert" ON public.audit_log;
CREATE POLICY "audit_log_admin_insert"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "automation_sent_admin_all" ON public.automation_sent;
CREATE POLICY "automation_sent_admin_all"
  ON public.automation_sent
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Service role pour le cron (bypass RLS)
DROP POLICY IF EXISTS "automation_sent_service_role" ON public.automation_sent;
CREATE POLICY "automation_sent_service_role"
  ON public.automation_sent
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "audit_log_service_role" ON public.audit_log;
CREATE POLICY "audit_log_service_role"
  ON public.audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
