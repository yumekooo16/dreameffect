# Contrats DreamEffect — remplissage automatique

## Règle absolue

Le système **n’écrit jamais** le contrat juridique.
Il extrait des données documents + réservation, les fait valider par un admin,
puis produit une **fiche de remplissage PDF** (ou remplira un modèle officiel
pourvu de placeholders).

## Brancher le contrat avocat officiel

1. Prenez le contrat Word/PDF validé par l’avocat.
2. Remplacez uniquement les zones variables par des placeholders, ex. :
   - `{{last_name}}` `{{first_name}}` `{{birth_date}}` `{{address}}`
   - `{{vehicle_label}}` `{{vehicle_plate}}` `{{start_date}}` `{{end_date}}`
   - `{{total_price}}` `{{deposit}}`
3. Déposez le fichier dans `contracts/templates/contrat-location-officiel.docx`
   (ou PDF AcroForm fillable).
4. Demandez à brancher le générateur sur ce modèle (remplacer
   `buildFilledContractPdf` dans `src/lib/contracts/generate-pdf.ts`).

Tant que le modèle officiel n’est pas branché, l’admin télécharge une
**fiche de valeurs** à reporter manuellement dans le contrat avocat.

## Pipeline

Réservation → lien dossier client → upload docs → OCR (OpenAI optionnel) →
vérification admin → génération PDF → téléchargement.

## Variables d’environnement

- `OPENAI_API_KEY` (optionnel) : extraction automatique
- Sans clé : saisie manuelle des champs dans l’admin

## Migration SQL

Appliquer `supabase/migrations/20260910230000_reservation_contract_autofill.sql`
