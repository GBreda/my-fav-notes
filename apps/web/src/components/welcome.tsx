'use client';

import Link from 'next/link';
import { primaryButtonClass, secondaryButtonClass } from '@/lib/ui';
import { Controls } from './controls';
import { Logo } from './logo';
import { useI18n } from './i18n-provider';

const tickets = ['movie', 'podcast', 'article'] as const;

export function Welcome() {
  const { t } = useI18n();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-8 pt-5">
      <div className="flex items-center justify-between">
        <Logo />
        <Controls />
      </div>
      <div className="flex flex-1 flex-col justify-center py-8">
        <div className="mb-8 grid grid-cols-3 gap-2" aria-hidden="true">
          {tickets.map((key) => (
            <div key={key} className="rounded-2xl border border-line bg-surface px-3 py-3 shadow-card">
              <span className="block h-1.5 w-8 rounded-full bg-brand" />
              <span className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-brand">
                {t(`categories.${key}`)}
              </span>
            </div>
          ))}
        </div>
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{t('welcome.title')}</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">{t('welcome.body')}</p>
        <p className="mt-2 text-base font-medium text-brand">{t('welcome.note')}</p>
        <div className="mt-8 grid gap-3">
          <Link href="/register" className={primaryButtonClass}>
            {t('auth.create')}
          </Link>
          <Link href="/login" className={secondaryButtonClass}>
            {t('auth.enter')}
          </Link>
        </div>
      </div>
    </main>
  );
}
