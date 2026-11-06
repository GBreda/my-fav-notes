import { BookmarkIcon } from './icons';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight text-ink ${className}`}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-onBrand">
        <BookmarkIcon className="h-5 w-5" />
      </span>
      Depois
    </span>
  );
}
