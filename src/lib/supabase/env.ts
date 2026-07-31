function sanitizeEnvValue(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    console.warn(
      `[Supabase] ${name} contains extra whitespace or duplicate values — using the first token only.`
    );
    return parts[0];
  }

  return trimmed;
}

export function getSupabaseUrl(): string {
  let url = sanitizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  );

  // Supprimer slash final et endpoints REST/auth collés par erreur dans Vercel
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/auth\/v1\/?$/i, "");

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    console.warn(
      `[Supabase] NEXT_PUBLIC_SUPABASE_URL looks unusual: "${url}". Expected https://<project-ref>.supabase.co`
    );
  }

  return url;
}

export function getSupabaseAnonKey(): string {
  return sanitizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}
