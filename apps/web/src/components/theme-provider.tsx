'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark';

type ThemeValue = {
  theme: ThemeChoice | null;
  setTheme: (theme: ThemeChoice) => void;
  toggle: () => void;
  dark: boolean;
  ready: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function systemIsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemeChoice | null;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeChoice | null>(initialTheme);
  const [dark, setDark] = useState(initialTheme === 'dark');
  const [ready, setReady] = useState(initialTheme != null);

  useEffect(() => {
    const apply = (choice: ThemeChoice | null) => {
      if (choice) document.documentElement.dataset.theme = choice;
      else delete document.documentElement.dataset.theme;
      setDark(choice ? choice === 'dark' : systemIsDark());
    };
    apply(theme);
    setReady(true);
    if (theme) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = (next: ThemeChoice) => {
    setThemeState(next);
    document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
  };

  const toggle = () => {
    const next = (theme ? theme === 'dark' : systemIsDark()) ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, dark, ready }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
