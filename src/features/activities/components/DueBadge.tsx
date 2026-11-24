import { useTranslation } from 'react-i18next';
import { getDueStatus } from '@/features/activities/lib/due-date';
import { cn } from '@/shared/lib/cn';

const STYLES = {
  open: 'bg-primary-soft text-link-strong',
  dueSoon: 'bg-warning-soft text-warning',
  closed: 'border border-line bg-canvas text-muted',
};

/** Props de {@link DueBadge}. */
type DueBadgeProps = {
  /** Prazo da atividade. */
  dueAt: string | null;
  /** Momento da comparação, em milissegundos. */
  now: number;
};

/** Etiqueta do prazo da atividade. */
export function DueBadge({ dueAt, now }: DueBadgeProps) {
  const { t } = useTranslation('activities');
  const due = getDueStatus(dueAt, now);
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap',
        STYLES[due.status],
      )}
    >
      {t(`status.${due.status}`, { count: due.status === 'dueSoon' ? due.days : undefined })}
    </span>
  );
}
