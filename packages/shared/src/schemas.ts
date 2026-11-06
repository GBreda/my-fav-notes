import { z } from 'zod';

export const CATEGORIES = [
  'movie',
  'series',
  'music',
  'podcast',
  'anime',
  'article',
  'other',
] as const;

export const STATUSES = ['all', 'pending', 'seen'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Status = (typeof STATUSES)[number];

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export type Item = {
  id: string;
  title: string;
  url: string | null;
  category: Category;
  notes: string | null;
  seen: boolean;
  seenAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemSummary = {
  total: number;
  pending: number;
  seen: number;
  byCategory: Record<Category, number>;
};

export type ItemListResponse = {
  items: Item[];
  summary: ItemSummary;
};

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeUrl(value: string | null | undefined, ctx: z.RefinementCtx): string | null {
  const trimmed = emptyToNull(value);
  if (trimmed == null) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invalid_url' });
    return z.NEVER;
  }
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invalid_url' });
    return z.NEVER;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invalid_url' });
    return z.NEVER;
  }
  if (!parsed.hostname.includes('.')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invalid_url' });
    return z.NEVER;
  }
  if (parsed.pathname === '/' && !parsed.search && !parsed.hash) {
    return parsed.origin;
  }
  return parsed.toString();
}

export const createItemSchema = z.object({
  title: z.string().trim().min(1, 'title_required').max(200, 'title_too_long'),
  url: z
    .string()
    .max(2000, 'url_too_long')
    .nullable()
    .optional()
    .transform((value, ctx) => normalizeUrl(value, ctx)),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'category_invalid' }) }),
  notes: z
    .string()
    .max(2000, 'notes_too_long')
    .nullable()
    .optional()
    .transform((value) => emptyToNull(value)),
});

export const updateItemSchema = createItemSchema;

export const seenSchema = z.object({
  seen: z.boolean({ invalid_type_error: 'seen_required', required_error: 'seen_required' }),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'name_short').max(80, 'name_long'),
  email: z
    .string()
    .trim()
    .email('email_invalid')
    .max(200, 'email_invalid')
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'password_short').max(72, 'password_long'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('email_invalid')
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'password_required').max(72, 'password_long'),
});

export const listItemsQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(STATUSES).default('all'),
  q: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
