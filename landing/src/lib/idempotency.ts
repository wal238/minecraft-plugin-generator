const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

type LockEntry = { inFlight: boolean; response?: unknown; expiresAt: number };
const locks = new Map<string, LockEntry>();

export async function acquireIdempotencyLock(
  userId: string, key: string, scope: string
): Promise<{ cached: boolean; cachedResponse?: unknown; inFlight: boolean }> {
  const compositeKey = `${scope}:${userId}:${key}`;
  const existing = locks.get(compositeKey);

  if (existing && existing.expiresAt > Date.now()) {
    if (existing.response) {
      return { cached: true, cachedResponse: existing.response, inFlight: false };
    }
    return { cached: false, inFlight: true };
  }

  locks.set(compositeKey, { inFlight: true, expiresAt: Date.now() + LOCK_TTL_MS });
  return { cached: false, inFlight: false };
}

export async function cacheIdempotencyResponse(
  userId: string, key: string, scope: string, response: unknown
): Promise<void> {
  const compositeKey = `${scope}:${userId}:${key}`;
  const existing = locks.get(compositeKey);
  if (existing?.inFlight) {
    locks.set(compositeKey, { inFlight: false, response, expiresAt: existing.expiresAt });
  }
}

// Periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of locks) {
      if (entry.expiresAt <= now) locks.delete(key);
    }
  }, 60_000);
}
