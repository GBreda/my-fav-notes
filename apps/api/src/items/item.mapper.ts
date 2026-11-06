import { Category, Item } from '@depois/shared';

export function toItemDto(item: {
  id: string;
  title: string;
  url: string | null;
  category: string;
  notes: string | null;
  seen: boolean;
  seenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Item {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    category: item.category as Category,
    notes: item.notes,
    seen: item.seen,
    seenAt: item.seenAt ? item.seenAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
