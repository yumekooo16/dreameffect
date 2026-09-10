-- DreamEffect — autofill contrat de location (extraction + validation + PDF)
-- Ne modifie AUCUN texte juridique : stocke uniquement données extraites + PDF rempli.

-- ---------------------------------------------------------------------------
-- Statut pipeline contrat (distinct de docs_status)
-- ---------------------------------------------------------------------------

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS contract_status text NOT NULL DEFAULT 'not_started';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_contract_status_check'
  ) THEN
    ALTER TABLE public.reservations
      ADD CONSTRAINT reservations_contract_status_check
      CHECK (contract_status IN (
        'not_started',
        'awaiting_documents',
        'documents_received',
        'analyzing',
        'needs_review',
        'validated',
        'contract_generated',
        'signed',
        'closed'
      ));
  END IF;
END $$;

COMMENT ON COLUMN public.reservations.contract_status IS
  'Pipeline contrat : not_started → awaiting_documents → documents_received → analyzing → needs_review → validated → contract_generated → signed → closed';

-- ---------------------------------------------------------------------------
-- Types documents : CNI recto/verso séparés
-- ---------------------------------------------------------------------------

ALTER TABLE public.reservation_documents
  DROP CONSTRAINT IF EXISTS reservation_documents_type_check;

ALTER TABLE public.reservation_documents
  ADD CONSTRAINT reservation_documents_type_check
  CHECK (type IN (
    'id_card',
    'id_card_back',
    'driving_license',
    'proof_of_address'
  ));

ALTER TABLE public.reservation_documents
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'uploaded';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reservation_documents_processing_status_check'
  ) THEN
    ALTER TABLE public.reservation_documents
      ADD CONSTRAINT reservation_documents_processing_status_check
      CHECK (processing_status IN (
        'uploaded',
        'analyzing',
        'analyzed',
        'unreadable',
        'failed'
      ));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Données extraites (une ligne par champ)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reservation_extracted_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  value text,
  confidence text NOT NULL DEFAULT 'unknown'
    CHECK (confidence IN ('high', 'medium', 'low', 'unknown')),
  source_document text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'validated', 'rejected', 'manual')),
  needs_review boolean NOT NULL DEFAULT true,
  inconsistency_note text,
  validated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservation_extracted_fields_unique
    UNIQUE (reservation_id, field_name)
);

CREATE INDEX IF NOT EXISTS reservation_extracted_fields_reservation_id_idx
  ON public.reservation_extracted_fields (reservation_id);

ALTER TABLE public.reservation_extracted_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_extracted_fields_admin_all"
  ON public.reservation_extracted_fields;
CREATE POLICY "reservation_extracted_fields_admin_all"
  ON public.reservation_extracted_fields
  FOR ALL
  TO authenticated
  USING (public.auth_is_admin())
  WITH CHECK (public.auth_is_admin());

-- ---------------------------------------------------------------------------
-- Contrats générés (PDF rempli à partir du modèle officiel)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reservation_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generated', 'downloaded', 'signed', 'archived')),
  template_version text NOT NULL DEFAULT 'v1',
  storage_path text,
  file_name text,
  generated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  generated_at timestamptz,
  payload_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS reservation_contracts_one_active_uidx
  ON public.reservation_contracts (reservation_id)
  WHERE status IN ('draft', 'generated', 'downloaded');

CREATE INDEX IF NOT EXISTS reservation_contracts_reservation_id_idx
  ON public.reservation_contracts (reservation_id, created_at DESC);

ALTER TABLE public.reservation_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_contracts_admin_all"
  ON public.reservation_contracts;
CREATE POLICY "reservation_contracts_admin_all"
  ON public.reservation_contracts
  FOR ALL
  TO authenticated
  USING (public.auth_is_admin())
  WITH CHECK (public.auth_is_admin());

-- Bucket dédié contrats remplis (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reservation-contracts',
  'reservation-contracts',
  false,
  20971520,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "reservation_contracts_storage_admin_read" ON storage.objects;
CREATE POLICY "reservation_contracts_storage_admin_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reservation-contracts'
    AND public.auth_is_admin()
  );

DROP POLICY IF EXISTS "reservation_contracts_storage_admin_delete" ON storage.objects;
CREATE POLICY "reservation_contracts_storage_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reservation-contracts'
    AND public.auth_is_admin()
  );

-- Inserts via service role uniquement.
