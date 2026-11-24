import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

/** Props de {@link Avatar}. */
type AvatarProps = {
  /** Nome da pessoa. */
  name: string;
  /**
   * Endereço da foto; sem ela, mostra as iniciais.
   * @default null
   */
  src?: string | null;
  /** Classes adicionais, como o tamanho. */
  className?: string;
};

/** Foto ou iniciais da pessoa. */
export function Avatar({ name, src = null, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const parts = name.trim().split(/\s+/);
  const initials = [parts[0], parts.length > 1 ? parts.at(-1) : undefined]
    .map((part) => part?.charAt(0) ?? '')
    .join('')
    .toUpperCase();
  const shape = cn('size-10 shrink-0 rounded-full', className);
  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt=""
        className={cn('object-cover', shape)}
        onError={() => setFailedSrc(src)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center bg-primary-muted text-sm font-bold text-link-strong',
        shape,
      )}
    >
      {initials}
    </span>
  );
}
