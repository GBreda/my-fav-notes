'use client';

import { cx } from '@/lib/ui';
import { MoonIcon, SunIcon } from './icons';
import { useI18n } from './i18n-provider';
import { useTheme } from './theme-provider';

export function Controls() {
  const { locale, setLocale, t } = useI18n();
  const { dark, ready, toggle } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex rounded-full border border-line bg-surface p-1"
        role="group"
        aria-label={t('controls.language')}
      >
        {(['pt-BR', 'en-US'] as const).map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={locale === code}
            onClick={() => setLocale(code)}
            className={cx(
              'min-h-9 rounded-full px-3 text-sm font-medium',
              locale === code ? 'bg-brand text-onBrand' : 'text-muted',
            )}
          >
            {code === 'pt-BR' ? t('controls.pt') : t('controls.en')}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? t('controls.themeToLight') : t('controls.themeToDark')}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink"
      >
        {ready ? dark ? <SunIcon /> : <MoonIcon /> : <span className="h-5 w-5" />}
      </button>
    </div>
  );
}
