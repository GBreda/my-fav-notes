export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const fieldClass =
  'w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base text-ink shadow-none outline-none ring-brand placeholder:text-muted focus:border-brand';

export const primaryButtonClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-base font-medium text-onBrand transition hover:bg-brandDark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-base font-medium text-ink transition hover:border-brand active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60';

export const ghostButtonClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl text-muted transition hover:bg-brandSoft hover:text-ink';
