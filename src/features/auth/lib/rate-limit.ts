/**
 * Rate limiting in memoria per login e registrazione.
 * Su piattaforme serverless ogni istanza ha il proprio contatore: è una prima difesa
 * contro tentativi ripetuti, da affiancare a un limite distribuito (WAF/Redis) in produzione.
 */

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const IP_LIMIT = 20;
const NAME_LIMIT = 8;
const buckets = new Map<string, Bucket>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return candidate.slice(0, 64);
}

function consume(key: string, limit: number, now: number): number | null {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (bucket.count >= limit) return Math.ceil((bucket.resetAt - now) / 1000);
  bucket.count += 1;
  return null;
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export function checkAuthRateLimit(request: Request, name: string): RateLimitResult {
  if (buckets.size > 2000) {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  const now = Date.now();
  const ipRetry = consume(`ip:${clientIp(request)}`, IP_LIMIT, now);
  if (ipRetry !== null) return { ok: false, retryAfter: ipRetry };
  const nameRetry = consume(`name:${name.toLocaleLowerCase("it-IT")}`, NAME_LIMIT, now);
  if (nameRetry !== null) return { ok: false, retryAfter: nameRetry };
  return { ok: true };
}
