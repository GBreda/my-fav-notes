import { readToken } from './read-token';

describe('readToken', () => {
  it('prefers the httpOnly cookie', () => {
    expect(
      readToken({
        cookies: { depois_token: 'from-cookie' },
        headers: { authorization: 'Bearer from-header' },
      }),
    ).toBe('from-cookie');
  });

  it('falls back to a bearer token', () => {
    expect(readToken({ headers: { authorization: 'Bearer abc' } })).toBe('abc');
  });

  it('returns null when nothing is present', () => {
    expect(readToken({})).toBeNull();
  });
});
