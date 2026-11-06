'use client';

import { CATEGORIES, Category, type Item, type ItemListResponse, type PublicUser, type Status } from '@depois/shared';
import { useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api';
import { cx, primaryButtonClass } from '@/lib/ui';
import { useAuth } from './auth-provider';
import { Controls } from './controls';
import { CategoryIcon, PlusIcon, SearchIcon } from './icons';
import { useI18n } from './i18n-provider';
import { ItemCard } from './item-card';
import { ItemForm } from './item-form';
import { Logo } from './logo';

const statuses: Status[] = ['all', 'pending', 'seen'];

export function LibraryScreen({ user }: { user: PublicUser }) {
  const { t, locale } = useI18n();
  const { logout } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [status, setStatus] = useState<Status>('all');
  const [data, setData] = useState<ItemListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [removing, setRemoving] = useState<Item | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      setLoading(true);
      api
        .listItems({ category, status, q: query.trim() || undefined })
        .then((result) => {
          if (!cancelled) {
            setData(result);
            setError(null);
          }
        })
        .catch((reason: unknown) => {
          if (!cancelled) setError(t(`errors.${reason instanceof ApiError ? reason.code : 'GENERIC'}`));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, query.trim() ? 220 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [category, status, query, t]);

  async function reload() {
    const result = await api.listItems({ category, status, q: query.trim() || undefined });
    setData(result);
  }

  async function toggleSeen(item: Item, seen: boolean) {
    setBusyId(item.id);
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((entry) =>
              entry.id === item.id
                ? { ...entry, seen, seenAt: seen ? new Date().toISOString() : null }
                : entry,
            ),
          }
        : current,
    );
    try {
      await api.setSeen(item.id, seen);
      await reload();
    } catch (reason) {
      setError(t(`errors.${reason instanceof ApiError ? reason.code : 'GENERIC'}`));
      await reload().catch(() => undefined);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    const id = removing.id;
    setRemoving(null);
    try {
      await api.removeItem(id);
      await reload();
    } catch (reason) {
      setError(t(`errors.${reason instanceof ApiError ? reason.code : 'GENERIC'}`));
    }
  }

  const summary = data?.summary;
  const filtered = Boolean(category || status !== 'all' || query.trim());
  const pendingLabel = summary?.pending === 1 ? t('library.pendingOne') : t('library.pendingMany');
  const seenLabel = summary?.seen === 1 ? t('library.seenOne') : t('library.seenMany');

  return (
    <div className="mx-auto min-h-dvh w-full max-w-xl px-4 pb-28 pt-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2">
          <Controls />
          <button
            type="button"
            aria-expanded={accountOpen}
            aria-label={t('auth.account')}
            onClick={() => setAccountOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-onBrand"
          >
            {user.name.slice(0, 1).toUpperCase()}
          </button>
        </div>
      </header>
      {accountOpen ? (
        <div className="mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-brand"
            onClick={() => {
              void logout();
            }}
          >
            {t('auth.logout')}
          </button>
        </div>
      ) : null}

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('library.greeting', { name: user.name.split(' ')[0] })}</h1>
          <p className="mt-1 text-sm text-muted">
            {summary ? `${summary.pending} ${pendingLabel} · ${summary.seen} ${seenLabel}` : t('library.loading')}
          </p>
        </div>
        <button type="button" className={`${primaryButtonClass} hidden sm:inline-flex`} onClick={() => setComposing(true)}>
          <PlusIcon />
          {t('library.add')}
        </button>
      </div>

      <label className="relative mt-5 block">
        <span className="sr-only">{t('library.search')}</span>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('library.search')}
          className="w-full rounded-2xl border border-line bg-surface py-3 pl-12 pr-4 text-base outline-none focus:border-brand"
        />
      </label>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface2 p-1" role="tablist" aria-label={t('status.all')}>
        {statuses.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={status === value}
            onClick={() => setStatus(value)}
            className={cx(
              'min-h-11 rounded-xl text-sm font-medium',
              status === value ? 'bg-brand text-onBrand' : 'text-muted',
            )}
          >
            {t(`status.${value}`)}
          </button>
        ))}
      </div>

      <div className="chip-row -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => setCategory(undefined)}
          className={cx(
            'shrink-0 rounded-full border px-4 py-2 text-sm font-medium',
            !category ? 'border-brand bg-brand text-onBrand' : 'border-line bg-surface text-ink',
          )}
        >
          {t('categories.all')}
          {summary ? <span className="ml-1 opacity-80">{summary.total}</span> : null}
        </button>
        {CATEGORIES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => setCategory(category === value ? undefined : value)}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
              category === value ? 'border-brand bg-brand text-onBrand' : 'border-line bg-surface text-ink',
            )}
          >
            <CategoryIcon category={value} className="h-4 w-4" />
            {t(`categories.${value}`)}
            {summary ? <span className="opacity-80">{summary.byCategory[value]}</span> : null}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-brandSoft px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3" aria-busy={loading}>
        {loading && !data
          ? [0, 1, 2].map((key) => <div key={key} className="h-28 animate-pulse rounded-card bg-surface" />)
          : null}
        {data?.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            locale={locale}
            pending={busyId === item.id}
            onToggleSeen={(seen) => void toggleSeen(item, seen)}
            onEdit={() => setEditing(item)}
            onDelete={() => setRemoving(item)}
            labels={{
              seen: t('library.seen'),
              markSeen: t('library.markSeen', { title: item.title }),
              markUnseen: t('library.markUnseen', { title: item.title }),
              edit: t('library.edit'),
              remove: t('library.remove'),
              noLink: t('library.noLink'),
              openLink: t('library.openLink', { host: '{host}' }),
              category: t(`categories.${item.category}`),
            }}
          />
        ))}
      </div>

      {data && data.items.length === 0 && !loading ? (
        <div className="mt-10 rounded-card border border-dashed border-line bg-surface px-5 py-10 text-center">
          <h2 className="text-xl font-bold">{filtered ? t('library.emptyFilterTitle') : t('library.emptyTitle')}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            {filtered ? t('library.emptyFilterBody') : t('library.emptyBody')}
          </p>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:hidden">
        <button type="button" className={`${primaryButtonClass} w-full`} onClick={() => setComposing(true)}>
          <PlusIcon />
          {t('library.add')}
        </button>
      </div>

      {composing || editing ? (
        <ItemForm
          initial={editing}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
          onSaved={() => {
            setComposing(false);
            setEditing(null);
            void reload();
          }}
        />
      ) : null}

      {removing ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-sm rounded-card bg-surface p-5 shadow-card">
            <h2 id="delete-title" className="text-xl font-bold">
              {t('library.deleteTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t('library.deleteBody')}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" className="min-h-12 rounded-2xl border border-line font-medium" onClick={() => setRemoving(null)}>
                {t('library.cancel')}
              </button>
              <button type="button" className="min-h-12 rounded-2xl bg-brand font-medium text-onBrand" onClick={() => void confirmRemove()}>
                {t('library.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
