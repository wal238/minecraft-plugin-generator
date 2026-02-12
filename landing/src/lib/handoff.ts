import crypto from 'node:crypto';

const HANDOFF_TTL_SECONDS = 120;

function getHandoffKey(): Buffer {
  const raw = process.env.HANDOFF_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('HANDOFF_ENCRYPTION_KEY must be set');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('HANDOFF_ENCRYPTION_KEY must be base64-encoded 32-byte key');
  }
  return key;
}

export function createHandoffCode(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashHandoffCode(code: string): string {
  return crypto.createHash('sha256').update(code, 'utf8').digest('hex');
}

export function encryptSessionPayload(payload: unknown): string {
  const key = getHandoffKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  });
}

export function decryptSessionPayload(encrypted: string): Record<string, unknown> {
  const key = getHandoffKey();
  const parsed = JSON.parse(encrypted) as { iv: string; tag: string; ciphertext: string };
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(parsed.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(parsed.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8')) as Record<string, unknown>;
}

export function handoffExpiryIso(now = new Date()): string {
  return new Date(now.getTime() + HANDOFF_TTL_SECONDS * 1000).toISOString();
}

export function getHandoffTtlSeconds(): number {
  return HANDOFF_TTL_SECONDS;
}
