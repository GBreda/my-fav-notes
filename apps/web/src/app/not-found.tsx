'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useI18n } from '@/components/i18n-provider';
import { primaryButtonClass } from '@/lib/ui';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-5">
      <Logo />
      <h1 className="text-3xl font-bold">{t('notFound.title')}</h1>
      <Link href="/" className={primaryButtonClass}>
        {t('notFound.back')}
      </Link>
    </main>
  );
}
