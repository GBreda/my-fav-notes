import { COOKIE_NAME } from '../auth/cookie';

export function readToken(req: {
  cookies?: Record<string, string | undefined>;
  headers?: { authorization?: string };
}): string | null {
  const cookie = req.cookies?.[COOKIE_NAME];
  if (cookie) return cookie;
  const header = req.headers?.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length).trim() || null;
  return null;
}
