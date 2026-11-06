'use client';

import { useAuth } from './auth-provider';
import { LibraryScreen } from './library-screen';
import { useI18n } from './i18n-provider';
import { Logo } from './logo';
import { Welcome } from './welcome';

export function Home() {
  const { user, status } = useAuth();
  const { t } = useI18n();

  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <p className="text-sm text-muted">{t('library.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return <Welcome />;
  return <LibraryScreen user={user} />;
}
