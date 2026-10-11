# Contrats DreamEffect — remplissage automatique

## Règle absolue

Le système **n’écrit jamais** le contrat juridique et **ne modifie jamais** une clause.
Il extrait des données documents + réservation, les fait valider par un admin,
puis superpose **uniquement les variables** sur le PDF avocat officiel.

## Modèle officiel branché

Fichier : `contracts/templates/contrat-location-dreameffect-v2.pdf`

Le générateur (`src/lib/contracts/generate-pdf.ts`) :

1. charge ce PDF intact ;
2. écrit les champs locataire / véhicule / dates / tarifs / caution dans les zones à underscores ;
3. renseigne lieu + date sur la page signatures ;
4. laisse toutes les pages de clauses juridiques inchangées.

## Pipeline

Réservation → lien dossier client → upload docs → OCR (OpenAI optionnel) →
vérification admin → génération PDF officiel rempli → téléchargement.

## Variables d’environnement

- `OPENAI_API_KEY` (optionnel) : extraction automatique
- `OPENAI_OCR_MODEL` (optionnel, défaut `gpt-4o-mini`) : modèle vision OCR
- Sans clé / en cas de 429 (quota) : saisie manuelle des champs dans l’admin — le contrat reste générable
- Mentions légales en-tête : `NEXT_PUBLIC_LEGAL_*` (voir `src/lib/public/legal.ts`)

### Erreur 429 OpenAI

Le 429 signifie quota ou rate-limit OpenAI (pas un bug app). Solutions :
1. Ajouter des crédits sur https://platform.openai.com/settings/organization/billing
2. Attendre 1–2 min puis réessayer l’analyse
3. Ou remplir les champs manuellement puis générer le contrat

## Migration SQL

Appliquer `supabase/migrations/20260910230000_reservation_contract_autofill.sql`
