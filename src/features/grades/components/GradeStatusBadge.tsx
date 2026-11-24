import { useTranslation } from 'react-i18next';
import type { GradeSummary } from '@/features/grades/schemas/grade.schema';
import { Icon, type IconName } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';

const STYLES: Record<GradeSummary['status'], { className: string; icon?: IconName }> = {
  NO_GRADES: { className: 'border border-line bg-canvas text-muted' },
  APPROVED: { className: 'bg-success-soft text-success', icon: 'check' },
  RECOVERY: { className: 'bg-warning-soft text-warning', icon: 'exclamation' },
  FAILED: { className: 'bg-danger-soft text-danger', icon: 'close' },
};

/** Props de {@link GradeStatusBadge}. */
type GradeStatusBadgeProps = {
  /** Situação calculada pela API. */
  status: GradeSummary['status'];
  /**
   * Indica que ainda falta nota.
   * @default false
   */
  partial?: boolean;
};

/** Etiqueta da situação do aluno, com ícone e texto. */
export function GradeStatusBadge({ status, partial = false }: GradeStatusBadgeProps) {
  const { t } = useTranslation('grades');
  const { className, icon } = STYLES[status];
  const label = t(`status.${status}`);
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap',
        className,
      )}
    >
      {icon && <Icon name={icon} className="size-3 stroke-3" />}
      {partial && status !== 'NO_GRADES' ? t('partial', { status: label }) : label}
    </span>
  );
}
