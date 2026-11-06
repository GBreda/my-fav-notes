'use client';

import { CATEGORIES, Category, createItemSchema, type Item } from '@depois/shared';
import { FormEvent, useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api';
import { fieldErrors } from '@/lib/forms';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '@/lib/ui';
import { CategoryIcon } from './icons';
import { useI18n } from './i18n-provider';

const LAST_CATEGORY = 'depois-category';

function storedCategory(): Category {
  if (typeof window === 'undefined') return 'other';
  const value = window.localStorage.getItem(LAST_CATEGORY);
  return CATEGORIES.includes(value as Category) ? (value as Category) : 'movie';
}

export function ItemForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Item | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'movie');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!initial) setCategory(storedCategory());
  }, [initial]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = createItemSchema.safeParse({ title, url, notes, category });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFormError(null);
    setPending(true);
    try {
      if (initial) await api.updateItem(initial.id, parsed.data);
      else await api.createItem(parsed.data);
      window.localStorage.setItem(LAST_CATEGORY, parsed.data.category);
      onSaved();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'GENERIC';
      setFormError(t(`errors.${code}`));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
      <form onSubmit={onSubmit} className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-5" noValidate>
        <button type="button" onClick={onClose} className="self-start text-sm font-medium text-brand">
          {t('library.back')}
        </button>
        <h1 id="item-form-title" className="mt-4 text-3xl font-bold tracking-tight">
          {initial ? t('library.formEdit') : t('library.formCreate')}
        </h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            {t('library.title')}
            <input
              autoFocus
              className={fieldClass}
              value={title}
              placeholder={t('library.titlePlaceholder')}
              onChange={(event) => setTitle(event.target.value)}
            />
            {errors.title ? <span className="font-normal text-danger">{t(`validation.${errors.title}`)}</span> : null}
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">{t('library.category')}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((value) => {
                const selected = category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(value)}
                    className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-medium ${
                      selected ? 'border-brand bg-brand text-onBrand' : 'border-line bg-surface text-ink'
                    }`}
                  >
                    <CategoryIcon category={value} className="h-4 w-4 shrink-0" />
                    {t(`categories.${value}`)}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-medium">
            {t('library.link')}
            <input
              className={fieldClass}
              inputMode="url"
              autoComplete="off"
              placeholder={t('library.linkPlaceholder')}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <span className="font-normal text-muted">{t('library.linkHint')}</span>
            {errors.url ? <span className="font-normal text-danger">{t(`validation.${errors.url}`)}</span> : null}
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {t('library.notes')}
            <textarea
              className={`${fieldClass} min-h-28 resize-y`}
              placeholder={t('library.notesPlaceholder')}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            {errors.notes ? <span className="font-normal text-danger">{t(`validation.${errors.notes}`)}</span> : null}
          </label>
        </div>
        {formError ? (
          <p role="alert" className="mt-4 rounded-2xl bg-brandSoft px-4 py-3 text-sm">
            {formError}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="submit" className={primaryButtonClass} disabled={pending}>
            {pending ? t('library.saving') : t('library.save')}
          </button>
          <button type="button" className={secondaryButtonClass} onClick={onClose}>
            {t('library.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
