import { buildItemWhere, buildSummary } from './item-query';

describe('buildItemWhere', () => {
  it('always scopes the query to the owner', () => {
    expect(buildItemWhere('user-1', { status: 'all' })).toEqual({ userId: 'user-1' });
  });

  it('filters by category, pending status and text', () => {
    expect(
      buildItemWhere('user-1', { status: 'pending', category: 'movie', q: 'dune' }),
    ).toEqual({
      userId: 'user-1',
      category: 'movie',
      seen: false,
      OR: [
        { title: { contains: 'dune', mode: 'insensitive' } },
        { notes: { contains: 'dune', mode: 'insensitive' } },
        { url: { contains: 'dune', mode: 'insensitive' } },
      ],
    });
  });

  it('filters seen items', () => {
    expect(buildItemWhere('user-1', { status: 'seen' }).seen).toBe(true);
  });
});

describe('buildSummary', () => {
  it('counts pending, seen and each category', () => {
    expect(
      buildSummary(
        [
          { category: 'movie', count: 2 },
          { category: 'article', count: 1 },
        ],
        [
          { seen: false, count: 2 },
          { seen: true, count: 1 },
        ],
      ),
    ).toEqual({
      total: 3,
      pending: 2,
      seen: 1,
      byCategory: {
        movie: 2,
        series: 0,
        music: 0,
        podcast: 0,
        anime: 0,
        article: 1,
        other: 0,
      },
    });
  });
});
