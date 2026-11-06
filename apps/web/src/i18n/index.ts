import enUS from './en-US';
import ptBR from './pt-BR';

export const LOCALES = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof LOCALES)[number];

const dictionaries = {
  'pt-BR': ptBR,
  'en-US': enUS,
} as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'pt-BR' || value === 'en-US';
}

export function translate(
  locale: Locale,
  path: string,
  vars?: Record<string, string | number>,
): string {
  const parts = path.split('.');
  let current: unknown = dictionaries[locale];
  for (const part of parts) {
    if (typeof current !== 'object' || current == null || !(part in current)) return path;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current !== 'string') return path;
  if (!vars) return current;
  return current.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function flattenKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value == null) return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child != null ? flattenKeys(child, next) : [next];
  });
}

export { dictionaries };
