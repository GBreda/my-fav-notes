'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { loginSchema, registerSchema } from '@depois/shared';
import { ApiError } from '@/lib/api';
import { api } from '@/lib/api';
import { fieldErrors } from '@/lib/forms';
import { fieldClass, primaryButtonClass } from '@/lib/ui';
import { useAuth } from './auth-provider';
import { Controls } from './controls';
import { useI18n } from './i18n-provider';
import { Logo } from './logo';

export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useI18n();
  const { setUser, user, status } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === 'ready' && user) router.replace('/');
  }, [status, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (mode === 'register' && password !== confirm) {
      setErrors({ confirmPassword: 'password_mismatch' });
      return;
    }
    const parsed =
      mode === 'register'
        ? registerSchema.safeParse({ name, email, password })
        : loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const result =
        mode === 'register'
          ? await api.register(registerSchema.parse({ name, email, password }))
          : await api.login(loginSchema.parse({ email, password }));
      setUser(result.user);
      router.replace('/');
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'GENERIC';
      setFormError(t(`errors.${code}`));
    } finally {
      setPending(false);
    }
  }

  const title = mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="rounded-xl">
          <Logo />
        </Link>
        <Controls />
      </div>
      <form onSubmit={onSubmit} className="mt-10 flex flex-1 flex-col" noValidate>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="mt-8 grid gap-4">
          {mode === 'register' ? (
            <label className="grid gap-2 text-sm font-medium">
              {t('auth.name')}
              <input
                className={fieldClass}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.name ? <span className="font-normal text-danger">{t(`validation.${errors.name}`)}</span> : null}
            </label>
          ) : null}
          <label className="grid gap-2 text-sm font-medium">
            {t('auth.email')}
            <input
              className={fieldClass}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? (
              <span className="font-normal text-danger">{t(`validation.${errors.email}`)}</span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span className="flex items-center justify-between gap-3">
              {t('auth.password')}
              <button
                type="button"
                className="text-xs font-medium text-brand"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </span>
            <input
              className={fieldClass}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password ? (
              <span className="font-normal text-danger">{t(`validation.${errors.password}`)}</span>
            ) : null}
          </label>
          {mode === 'register' ? (
            <label className="grid gap-2 text-sm font-medium">
              {t('auth.confirmPassword')}
              <input
                className={fieldClass}
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              {errors.confirmPassword ? (
                <span className="font-normal text-danger">{t(`validation.${errors.confirmPassword}`)}</span>
              ) : null}
            </label>
          ) : null}
        </div>
        {formError ? (
          <p role="alert" className="mt-4 rounded-2xl bg-brandSoft px-4 py-3 text-sm text-ink">
            {formError}
          </p>
        ) : null}
        <div className="mt-8 grid gap-3">
          <button className={primaryButtonClass} type="submit" disabled={pending}>
            {pending ? t('library.saving') : mode === 'login' ? t('auth.submitLogin') : t('auth.submitRegister')}
          </button>
          <Link href={mode === 'login' ? '/register' : '/login'} className="py-2 text-center text-sm font-medium text-brand">
            {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
          </Link>
        </div>
      </form>
    </main>
  );
}
