-- Kilomètres parcourus par le client pendant la location
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS distance_km INTEGER;
