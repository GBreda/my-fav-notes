import { describe, expect, it } from 'vitest';
import { formatRelative, linkHost } from './relative-time';

describe('linkHost', () => {
  it('drops www and keeps the hostname', () => {
    expect(linkHost('https://www.imdb.com/title/tt1')).toBe('imdb.com');
  });

  it('returns null without a link', () => {
    expect(linkHost(null)).toBeNull();
  });
});

describe('formatRelative', () => {
  const now = Date.parse('2026-11-06T15:00:00.000Z');

  it('formats a recent save in Portuguese', () => {
    expect(formatRelative('2026-11-06T13:00:00.000Z', 'pt-BR', now)).toMatch(/hora/);
  });

  it('says just now when the save is a few seconds old', () => {
    expect(formatRelative('2026-11-06T15:00:10.000Z', 'pt-BR', now)).toBe('agora');
    expect(formatRelative('2026-11-06T15:00:10.000Z', 'en-US', now)).toBe('now');
  });

  it('uses a calendar date after a month', () => {
    expect(formatRelative('2026-08-01T15:00:00.000Z', 'en-US', now)).toMatch(/2026/);
  });
});
