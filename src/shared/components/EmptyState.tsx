import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/shared/components/Icon';

/** Props de {@link EmptyState}. */
type EmptyStateProps = {
  /** Ícone do estado. */
  icon: IconName;
  /** Título do estado. */
  title: string;
  /** Explicação do estado. */
  text?: string;
  /** Ação sugerida. */
  action?: ReactNode;
};

/** Estado vazio de listas e painéis. */
export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-field bg-white px-7 py-9 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} className="size-6.5" />
      </span>
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="max-w-md text-sm text-muted wrap-anywhere">{text}</p>}
      {action}
    </div>
  );
}
