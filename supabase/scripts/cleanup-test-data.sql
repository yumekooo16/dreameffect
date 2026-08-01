-- DreamEffect — nettoyage données test (conserve admin@dreameffect.fr)
-- À exécuter dans Supabase → SQL Editor si vous préférez le SQL direct.
-- Remplacez l'email admin si besoin.

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id
  FROM auth.users
  WHERE lower(email) = lower('admin@dreameffect.fr')
  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Compte admin@dreameffect.fr introuvable';
  END IF;

  DELETE FROM public.automation_sent;
  DELETE FROM public.audit_log;
  DELETE FROM public.notifications;
  DELETE FROM public.reservations;
  DELETE FROM public.maintenance;
  DELETE FROM public.documents;
  DELETE FROM public.vehicle_images;
  DELETE FROM public.owner_payouts;
  DELETE FROM public.vehicles;
  DELETE FROM public.profiles WHERE id <> admin_id;

  DELETE FROM auth.users
  WHERE id <> admin_id;

  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = admin_id;
END $$;

-- Pensez aussi à vider le bucket Storage "vehicle-images" dans Supabase → Storage.
