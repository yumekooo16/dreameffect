-- DreamEffect — dossier locataire (CNI / permis / justif) lié à une réservation

-- ---------------------------------------------------------------------------
-- Colonnes réservation
-- ---------------------------------------------------------------------------

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS docs_status text NOT NULL DEFAULT 'missing';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reservations_docs_status_check'
  ) THEN
    ALTER TABLE public.reservations
      ADD CONSTRAINT reservations_docs_status_check
      CHECK (docs_status IN ('missing', 'partial', 'complete', 'reviewed'));
  END IF;
END $$;

COMMENT ON COLUMN public.reservations.docs_status IS
  'Statut des pièces locataire : missing | partial | complete | reviewed';

-- ---------------------------------------------------------------------------
-- Tokens d'upload publics (lien sécurisé)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reservation_upload_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS reservation_upload_tokens_reservation_id_idx
  ON public.reservation_upload_tokens (reservation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS reservation_upload_tokens_expires_at_idx
  ON public.reservation_upload_tokens (expires_at);

ALTER TABLE public.reservation_upload_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_upload_tokens_admin_all" ON public.reservation_upload_tokens;
CREATE POLICY "reservation_upload_tokens_admin_all"
  ON public.reservation_upload_tokens
  FOR ALL
  TO authenticated
  USING (public.auth_is_admin())
  WITH CHECK (public.auth_is_admin());

-- ---------------------------------------------------------------------------
-- Documents locataire (distincts des documents flotte)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reservation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  type text NOT NULL,
  storage_path text NOT NULL,
  original_filename text,
  mime_type text,
  file_size integer,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservation_documents_type_check
    CHECK (type IN ('id_card', 'driving_license', 'proof_of_address'))
);

CREATE UNIQUE INDEX IF NOT EXISTS reservation_documents_reservation_type_uidx
  ON public.reservation_documents (reservation_id, type);

CREATE INDEX IF NOT EXISTS reservation_documents_reservation_id_idx
  ON public.reservation_documents (reservation_id);

ALTER TABLE public.reservation_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_documents_admin_select" ON public.reservation_documents;
CREATE POLICY "reservation_documents_admin_select"
  ON public.reservation_documents
  FOR SELECT
  TO authenticated
  USING (public.auth_is_admin());

DROP POLICY IF EXISTS "reservation_documents_admin_delete" ON public.reservation_documents;
CREATE POLICY "reservation_documents_admin_delete"
  ON public.reservation_documents
  FOR DELETE
  TO authenticated
  USING (public.auth_is_admin());

-- Inserts publics passent par le service role (bypass RLS).

-- ---------------------------------------------------------------------------
-- Storage privé
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reservation-documents',
  'reservation-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "reservation_documents_storage_admin_read" ON storage.objects;
CREATE POLICY "reservation_documents_storage_admin_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reservation-documents'
    AND public.auth_is_admin()
  );

DROP POLICY IF EXISTS "reservation_documents_storage_admin_delete" ON storage.objects;
CREATE POLICY "reservation_documents_storage_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reservation-documents'
    AND public.auth_is_admin()
  );

-- Uploads via service role uniquement (pas de policy INSERT anon).
