import type { ReactNode } from 'react';
import { Icon } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';

/** Props de {@link Alert}. */
type AlertProps = {
  /** Mensagem exibida. */
  children: ReactNode;
  /**
   * Tipo do aviso.
   * @default 'error'
   */
  variant?: 'error' | 'info';
};

/** Aviso de erro ou informação. */
export function Alert({ children, variant = 'error' }: AlertProps) {
  const isError = variant === 'error';
  return (
    <div
      role={isError ? 'alert' : 'note'}
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm',
        isError ? 'bg-danger-soft text-danger-ink' : 'bg-primary-soft text-primary-active',
      )}
    >
      <Icon name={isError ? 'alert' : 'info'} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
