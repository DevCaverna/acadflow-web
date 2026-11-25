import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useAreaRoutes } from '@/features/auth/hooks/useAreaRoutes';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import { GradeStatusBadge } from '@/features/grades/components/GradeStatusBadge';
import { useMyGrades } from '@/features/grades/hooks/useGrades';
import type { GradeSummary } from '@/features/grades/schemas/grade.schema';
import { EmptyState } from '@/shared/components/EmptyState';
import { QueryState } from '@/shared/components/QueryState';
import { cn } from '@/shared/lib/cn';
import { formatDateTime, formatGrade } from '@/shared/lib/format';

const RING_COLORS: Record<GradeSummary['status'], string> = {
  NO_GRADES: 'var(--color-subtle)',
  APPROVED: 'var(--color-success)',
  RECOVERY: 'var(--color-accent)',
  FAILED: 'var(--color-danger)',
};

const LEGEND = [
  { key: 'legendApproved', className: 'bg-success' },
  { key: 'legendRecovery', className: 'bg-accent' },
  { key: 'legendFailed', className: 'bg-danger' },
] as const;

const DEGREES_PER_POINT = 36;

/** Props de {@link MyGrades}. */
type MyGradesProps = {
  /** Disciplina das notas. */
  discipline: Discipline;
};

/** Notas, média e situação do aluno; parciais enquanto falta nota. */
export function MyGrades({ discipline }: MyGradesProps) {
  const { t, i18n } = useTranslation(['grades', 'activities']);
  const area = useAreaRoutes();
  const activities = useActivities(discipline.id);
  const summary = useMyGrades(discipline.id);
  return (
    <QueryState query={activities}>
      {(activityData) => (
        <QueryState query={summary}>
          {({ grades, average, status }) => {
            const missing = activityData.length - grades.length;
            const partial = missing > 0;
            const values = new Map(grades.map(({ activityId, value }) => [activityId, value]));
            const averageText = average === null ? '—' : formatGrade(average, i18n.language);
            const ring = `conic-gradient(${RING_COLORS[status]} ${(average ?? 0) * DEGREES_PER_POINT}deg, var(--color-subtle) 0)`;
            return (
              <div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
                <section className="flex flex-col gap-4.5 rounded-panel border border-line bg-surface p-6">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold wrap-anywhere">{discipline.name}</h2>
                    <p className="text-sm text-muted">{discipline.professor.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-5">
                    <div
                      role="img"
                      aria-label={t('averageOf', { average: averageText })}
                      className="flex size-28 shrink-0 items-center justify-center rounded-full"
                      style={{ background: ring }}
                    >
                      <span className="flex size-22 flex-col items-center justify-center rounded-full bg-surface">
                        <span className="font-display text-3xl leading-none font-bold">
                          {averageText}
                        </span>
                        <span className="text-[11px] text-muted lowercase">
                          {partial ? t('partialAverage') : t('finalAverage')}
                        </span>
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                      <GradeStatusBadge status={status} partial={partial} />
                      {partial && (
                        <p className="text-sm text-muted">{t('missing', { count: missing })}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-subtle pt-4 text-[13px] text-muted">
                    {LEGEND.map(({ key, className }) => (
                      <span key={key} className="flex items-center gap-2">
                        <span className={cn('size-2.5 rounded-full', className)} />
                        {t(key)}
                      </span>
                    ))}
                    <span>{t('ruleHint')}</span>
                  </div>
                </section>
                {activityData.length === 0 ? (
                  <EmptyState
                    icon="activities"
                    title={t('activities:emptyTitle')}
                    text={t('activities:empty')}
                    action={
                      <Link
                        to={area.discipline(discipline.id)}
                        className="text-sm font-semibold text-link"
                      >
                        {t('seeActivities')}
                      </Link>
                    }
                  />
                ) : (
                  <section className="overflow-hidden rounded-panel border border-line bg-surface">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
                      <h2 className="font-display text-xl font-semibold">{t('byActivity')}</h2>
                      <span className="text-[13px] text-muted">{t('approvalLine')}</span>
                    </header>
                    <ul aria-label={t('byActivity')}>
                      {activityData.map(({ id, title, dueAt }) => {
                        const value = values.get(id);
                        return (
                          <li
                            key={id}
                            className="flex flex-wrap items-center gap-4 border-b border-subtle px-6 py-4 last:border-0"
                          >
                            <div className="flex min-w-40 flex-1 flex-col gap-1">
                              <span className="text-[15px] font-semibold wrap-anywhere">
                                {title}
                              </span>
                              <span className="text-[13px] text-muted">
                                {dueAt
                                  ? formatDateTime(dueAt, i18n.language)
                                  : t('activities:noDueDate')}
                              </span>
                            </div>
                            <div
                              aria-hidden="true"
                              className="relative h-2.5 min-w-32 flex-1 rounded-full bg-subtle"
                            >
                              <span
                                className={cn(
                                  'absolute inset-y-0 left-0 rounded-full bg-danger',
                                  value !== undefined && value >= 5 && 'bg-accent',
                                  value !== undefined && value >= 7 && 'bg-success',
                                )}
                                style={{ width: `${(value ?? 0) * 10}%` }}
                              />
                              <span className="absolute -top-1 left-[70%] h-4.5 border-l-2 border-dashed border-muted" />
                            </div>
                            <span
                              className={cn(
                                'w-24 text-right font-display font-bold',
                                value === undefined ? 'text-sm text-muted' : 'text-xl',
                              )}
                            >
                              {value === undefined
                                ? t('noGrade')
                                : formatGrade(value, i18n.language)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}
              </div>
            );
          }}
        </QueryState>
      )}
    </QueryState>
  );
}
