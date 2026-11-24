import { cn } from '@/shared/lib/cn';

const PATHS = {
  alert: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v6M12 17h.01',
  activities: 'M9 3h6v4H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4',
  attachment:
    'M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14 7.6',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19',
  check: 'M5 12l5 5L20 7',
  close: 'M6 6l12 12M18 6L6 18',
  disciplines: 'M4 19V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  exclamation: 'M12 6v7M12 18h.01',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM4 4l16 16',
  grades: 'M4 20V11M10 20V5M16 20v-6M3 20h18',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7h.01',
  lock: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
  plus: 'M12 5v14M5 12h14',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  remove: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  signOut: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  spinner: 'M21 12a9 9 0 0 0-9-9',
};

export type IconName = keyof typeof PATHS;

/** Props de {@link Icon}. */
type IconProps = {
  /** Ícone do design. */
  name: IconName;
  /** Classes adicionais, como tamanho e cor. */
  className?: string;
};

/** Ícone decorativo do design. */
export function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn(
        'size-5 shrink-0 fill-none stroke-current stroke-2',
        name === 'spinner' && 'animate-spin stroke-3',
        className,
      )}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
