-- DreamEffect — Email propriétaire dénormalisé + synchro auth

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;

COMMENT ON COLUMN public.profiles.email IS
  'Email de connexion (copie auth.users.email) — pour contact admin / affichage';

-- Remplir depuis auth.users pour les comptes existants
UPDATE public.profiles AS p
SET email = lower(u.email)
FROM auth.users AS u
WHERE p.id = u.id
  AND u.email IS NOT NULL
  AND (p.email IS NULL OR p.email = '');
