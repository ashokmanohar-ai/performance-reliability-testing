import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export interface TokenPayload {
  sub: string;
  exp: number;
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function passwordMatches(password: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPassword(password));
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function issueToken(userId: string, secret: string, lifetimeSeconds = 3600): string {
  const payload: TokenPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + lifetimeSeconds
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyToken(token: string, secret: string): TokenPayload | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    return payload.exp > Math.floor(Date.now() / 1000) && payload.sub ? payload : null;
  } catch {
    return null;
  }
}
