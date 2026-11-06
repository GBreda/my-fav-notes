import { CATEGORIES, Category, ItemSummary, ListItemsQuery } from '@depois/shared';

export type ItemWhere = {
  userId: string;
  category?: string;
  seen?: boolean;
  OR?: Array<
    | { title: { contains: string; mode: 'insensitive' } }
    | { notes: { contains: string; mode: 'insensitive' } }
    | { url: { contains: string; mode: 'insensitive' } }
  >;
};

export function buildItemWhere(userId: string, query: ListItemsQuery): ItemWhere {
  const where: ItemWhere = { userId };
  if (query.category) where.category = query.category;
  if (query.status === 'pending') where.seen = false;
  if (query.status === 'seen') where.seen = true;
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { notes: { contains: query.q, mode: 'insensitive' } },
      { url: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

export function buildSummary(
  byCategory: { category: string; count: number }[],
  bySeen: { seen: boolean; count: number }[],
): ItemSummary {
  const counts = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    Category,
    number
  >;
  for (const row of byCategory) {
    if (row.category in counts) {
      counts[row.category as Category] = row.count;
    }
  }
  const seen = bySeen.find((row) => row.seen)?.count ?? 0;
  const pending = bySeen.find((row) => !row.seen)?.count ?? 0;
  return {
    total: seen + pending,
    seen,
    pending,
    byCategory: counts,
  };
}
