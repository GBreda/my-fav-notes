import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { cookies } from 'next/headers';
import { isLocale } from '@/i18n';
import { Providers } from '@/components/providers';
import type { ThemeChoice } from '@/components/theme-provider';
import './globals.css';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Depois',
  description: 'Guarde filmes, séries, músicas e links para ver depois. Save it for later.',
};

export const viewport: Viewport = {
  themeColor: '#a83264',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const localeCookie = jar.get('locale')?.value;
  const themeCookie = jar.get('theme')?.value;
  const locale = isLocale(localeCookie) ? localeCookie : 'pt-BR';
  const theme: ThemeChoice | null = themeCookie === 'light' || themeCookie === 'dark' ? themeCookie : null;

  return (
    <html lang={locale} data-theme={theme ?? undefined} className={roboto.variable} suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <Providers locale={locale} theme={theme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
