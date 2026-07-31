import { config } from "dotenv";
import { resolve } from "node:path";

/**
 * Configuration centralisée du compte administrateur seed.
 *
 * Modifiez les variables dans `.env.local` (voir `scripts/create-admin.env.example`).
 * Ne dupliquez pas ces valeurs ailleurs dans le projet.
 */
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export type AdminSeedConfig = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}\n` +
        "Consultez scripts/create-admin.env.example pour la liste complète."
    );
  }
  return value;
}

export function loadAdminSeedConfig(): AdminSeedConfig {
  return {
    email: requireEnv("ADMIN_EMAIL"),
    password: requireEnv("ADMIN_PASSWORD"),
    firstName: requireEnv("ADMIN_FIRST_NAME"),
    lastName: requireEnv("ADMIN_LAST_NAME"),
  };
}
