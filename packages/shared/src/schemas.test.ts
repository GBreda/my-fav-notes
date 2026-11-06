import { describe, expect, it } from 'vitest';
import { createItemSchema, loginSchema, registerSchema, seenSchema } from './schemas';

describe('createItemSchema', () => {
  it('accepts a title without a link', () => {
    const parsed = createItemSchema.parse({ title: 'Past Lives', category: 'movie' });
    expect(parsed.url).toBeNull();
    expect(parsed.notes).toBeNull();
  });

  it('turns a bare domain into https', () => {
    const parsed = createItemSchema.parse({
      title: 'Ensaio',
      category: 'article',
      url: 'example.com/post',
      notes: '  ler no domingo  ',
    });
    expect(parsed.url).toBe('https://example.com/post');
    expect(parsed.notes).toBe('ler no domingo');
  });

  it('keeps an explicit http url', () => {
    const parsed = createItemSchema.parse({
      title: 'Demo',
      category: 'other',
      url: 'http://example.com/a',
    });
    expect(parsed.url).toBe('http://example.com/a');
  });

  it('rejects a title made only of spaces', () => {
    const result = createItemSchema.safeParse({ title: '   ', category: 'music' });
    expect(result.success).toBe(false);
  });

  it('rejects protocols that are not http', () => {
    const result = createItemSchema.safeParse({
      title: 'Nope',
      category: 'other',
      url: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'invalid_url')).toBe(true);
    }
  });

  it('treats an empty link as no link', () => {
    const parsed = createItemSchema.parse({ title: 'Só o nome', category: 'podcast', url: '   ' });
    expect(parsed.url).toBeNull();
  });
});

describe('registerSchema', () => {
  it('lowercases the email and trims the name', () => {
    const parsed = registerSchema.parse({
      name: '  Ana Lima  ',
      email: 'Ana@Example.com',
      password: 'senha1234',
    });
    expect(parsed).toEqual({
      name: 'Ana Lima',
      email: 'ana@example.com',
      password: 'senha1234',
    });
  });

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'curta',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('lowercases the email', () => {
    expect(loginSchema.parse({ email: 'Ana@Example.com', password: 'x' }).email).toBe(
      'ana@example.com',
    );
  });
});

describe('seenSchema', () => {
  it('requires a boolean', () => {
    expect(seenSchema.safeParse({ seen: 'yes' }).success).toBe(false);
    expect(seenSchema.parse({ seen: true })).toEqual({ seen: true });
  });
});
