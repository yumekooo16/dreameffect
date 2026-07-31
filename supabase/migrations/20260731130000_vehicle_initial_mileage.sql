-- Kilométrage au début du contrat (distinct du kilométrage actuel)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS initial_mileage INTEGER;
