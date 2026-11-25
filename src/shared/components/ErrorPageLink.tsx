import type { ComponentProps } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';

/** Props de {@link ErrorPageLink}. */
type ErrorPageLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  /**
   * Aparência do link.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';
};

/** Link com aparência de botão para as páginas de erro. */
export function ErrorPageLink({ variant = 'primary', ...props }: ErrorPageLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        'inline-flex h-12 items-center rounded-button px-5.5 text-[15px] font-semibold',
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary-hover'
          : 'border border-field bg-surface text-ink hover:bg-canvas',
      )}
    />
  );
}
