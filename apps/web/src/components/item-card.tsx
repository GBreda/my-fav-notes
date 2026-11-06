import type { Item } from '@depois/shared';
import { formatRelative, linkHost } from '@/lib/relative-time';
import { CategoryIcon, CheckIcon, PencilIcon, TrashIcon } from './icons';

export type ItemCardLabels = {
  seen: string;
  markSeen: string;
  markUnseen: string;
  edit: string;
  remove: string;
  noLink: string;
  openLink: string;
  category: string;
};

export function ItemCard({
  item,
  labels,
  locale,
  pending,
  onToggleSeen,
  onEdit,
  onDelete,
}: {
  item: Item;
  labels: ItemCardLabels;
  locale: string;
  pending?: boolean;
  onToggleSeen: (seen: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const host = linkHost(item.url);
  return (
    <article className="flex gap-2 rounded-card border border-line bg-surface p-3 shadow-card">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.seen}
        aria-label={item.seen ? labels.markUnseen : labels.markSeen}
        disabled={pending}
        onClick={() => onToggleSeen(!item.seen)}
        className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand ${
            item.seen ? 'bg-brand text-onBrand' : 'bg-surface text-transparent'
          }`}
        >
          <CheckIcon />
        </span>
      </button>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand">
          <CategoryIcon category={item.category} className="h-4 w-4" />
          <span>{labels.category}</span>
          {item.seen ? <span className="rounded-full bg-brandSoft px-2 py-0.5 normal-case tracking-normal">{labels.seen}</span> : null}
        </div>
        <h2 className={`mt-1 text-lg font-medium leading-snug ${item.seen ? 'text-muted' : 'text-ink'}`}>{item.title}</h2>
        {host ? (
          <a
            href={item.url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            {labels.openLink.replace('{host}', host)}
          </a>
        ) : (
          <p className="mt-1 text-sm text-muted">{labels.noLink}</p>
        )}
        {item.notes ? <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{item.notes}</p> : null}
        <p className="mt-2 text-xs text-muted">{formatRelative(item.createdAt, locale)}</p>
      </div>
      <div className="flex flex-col">
        <button type="button" aria-label={labels.edit} onClick={onEdit} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-muted hover:bg-brandSoft hover:text-ink">
          <PencilIcon />
        </button>
        <button type="button" aria-label={labels.remove} onClick={onDelete} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-muted hover:bg-brandSoft hover:text-danger">
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}
