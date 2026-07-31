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
  return sanitizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  ).replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  return sanitizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}
