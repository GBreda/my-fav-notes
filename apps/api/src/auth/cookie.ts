export const COOKIE_NAME = 'depois_token';
export const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: TOKEN_MAX_AGE_MS,
  };
}
