'use client';

import { Locale } from '@/i18n';
import { AuthProvider } from './auth-provider';
import { I18nProvider } from './i18n-provider';
import { ThemeChoice, ThemeProvider } from './theme-provider';

export function Providers({
  locale,
  theme,
  children,
}: {
  locale: Locale;
  theme: ThemeChoice | null;
  children: React.ReactNode;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <ThemeProvider initialTheme={theme}>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
