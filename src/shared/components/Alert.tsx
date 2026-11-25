import type { ReactNode } from 'react';
import { Icon } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';

const STYLES = {
  error: 'bg-danger-soft text-danger-ink',
  warning: 'bg-warning-soft text-warning-ink',
  info: 'bg-primary-soft text-link-strong',
};

/** Props de {@link Alert}. */
type AlertProps = {
  /** Mensagem exibida. */
  children: ReactNode;
  /**
   * Tipo do aviso.
   * @default 'error'
   */
  variant?: keyof typeof STYLES;
};

/** Aviso de erro, atenção ou informação. */
export function Alert({ children, variant = 'error' }: AlertProps) {
  const isError = variant === 'error';
  return (
    <div
      role={isError ? 'alert' : 'note'}
      className={cn('flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm', STYLES[variant])}
    >
      <Icon name={variant === 'info' ? 'info' : 'alert'} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
