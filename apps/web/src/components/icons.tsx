import { Category } from '@depois/shared';

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function BookmarkIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z" />
    </Svg>
  );
}

export function CheckIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12.5 9.2 17 19 7" />
    </Svg>
  );
}

export function PencilIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="m13.5 6.5 3 3" />
    </Svg>
  );
}

export function TrashIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M8 7l.7 12h6.6L16 7" />
    </Svg>
  );
}

export function MoonIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M15 3.5A8 8 0 1 0 20.5 14 6.5 6.5 0 0 1 15 3.5z" />
    </Svg>
  );
}

export function SunIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function PlusIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function SearchIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </Svg>
  );
}

const paths: Record<Category, React.ReactNode> = {
  movie: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M8 5v14M3.5 9.5h4.5M3.5 14.5h4.5M16 5v14M16 9.5h4.5M16 14.5h4.5" />
    </>
  ),
  series: (
    <>
      <rect x="4" y="4" width="14" height="12" rx="2" />
      <path d="M8 20h8M7 16l-2 4M17 16l2 4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18a2.5 2.5 0 1 1-2-2.45V6l10-2v9" />
      <circle cx="17" cy="14.5" r="2.5" />
    </>
  ),
  podcast: (
    <>
      <rect x="9" y="3.5" width="6" height="10" rx="3" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M9 20h6" />
    </>
  ),
  anime: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 10.5c.8 1 1.8 1 2.6 0M13.4 10.5c.8 1 1.8 1 2.6 0M9 15c1 .8 2 .8 3 0" />
    </>
  ),
  article: (
    <>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h4.5M8.5 12h7M8.5 16h5" />
    </>
  ),
  other: (
    <>
      <path d="M12 4 4.5 8 12 12l7.5-4L12 4z" />
      <path d="M4.5 12 12 16l7.5-4" />
      <path d="M4.5 16 12 20l7.5-4" />
    </>
  ),
};

export function CategoryIcon({ category, className = 'h-5 w-5' }: { category: Category; className?: string }) {
  return <Svg className={className}>{paths[category]}</Svg>;
}
