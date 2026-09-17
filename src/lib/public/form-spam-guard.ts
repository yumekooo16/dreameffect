import { headers } from "next/headers";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MIN_FORM_MS = 1800;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

async function clientKey() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = h.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

/** Rate-limit simple en mémoire (par instance serveur). */
export async function assertContactRateLimit(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const now = Date.now();
  prune(now);

  const key = await clientKey();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      ok: false,
      error: "Trop de demandes. Réessayez dans quelques minutes.",
    };
  }

  existing.count += 1;
  return { ok: true };
}

export function assertHumanTiming(formStartedAt?: number | null): boolean {
  if (!formStartedAt || !Number.isFinite(formStartedAt)) return true;
  return Date.now() - formStartedAt >= MIN_FORM_MS;
}

export function isHoneypotFilled(value?: string | null) {
  return Boolean(value?.trim());
}
