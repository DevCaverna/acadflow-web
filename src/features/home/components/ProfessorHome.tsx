import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAreaRoutes } from '@/features/auth/hooks/useAreaRoutes';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import { DeadlineList } from '@/features/home/components/DeadlineList';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeStatus } from '@/features/home/components/HomeStatus';
import { useProfessorEntries } from '@/features/home/hooks/useHomeEntries';
import { getDeadlines, getPendingGrades } from '@/features/home/lib/home';
import { Icon } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';

const WEEK_DAYS = 7;

/** Props de {@link ProfessorHome}. */
type ProfessorHomeProps = {
  /** Disciplinas do professor. */
  disciplines: readonly Discipline[];
};

/** Início do professor: notas pendentes, prazos e turmas. */
export function ProfessorHome({ disciplines }: ProfessorHomeProps) {
  const { t, i18n } = useTranslation('home');
  const area = useAreaRoutes();
  const [now] = useState(() => Date.now());
  const { entries, isPending, error, paused, refetch } = useProfessorEntries(disciplines);
  const ready = !isPending && !error;
  const pending = getPendingGrades(entries, now);
  const missing = pending.reduce((total, item) => total + item.missing, 0);
  const deadlines = getDeadlines({ entries, now, days: WEEK_DAYS });
  const next = pending[0];
  const shortcuts = [
    { key: 'grades', icon: 'grades', to: area.grades },
    { key: 'activity', icon: 'plus', to: area.disciplines },
    { key: 'discipline', icon: 'disciplines', to: area.newDiscipline },
  ] as const;

  return (
    <>
      <HomeHeader now={now}>
        {ready &&
          [
            t('pendingGrades', { count: missing }),
            t('deadlines', { count: deadlines.length }),
          ].join(' · ')}
      </HomeHeader>
      <nav
        aria-label={t('shortcuts.label')}
        className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4"
      >
        {shortcuts.map(({ key, icon, to }, index) => (
          <Link
            key={key}
            to={to}
            className={cn(
              'flex flex-col gap-3.5 rounded-panel border border-line bg-surface p-5 hover:bg-canvas',
              index === 0 && 'border-primary bg-primary text-white hover:bg-primary-hover',
            )}
          >
            <span
              className={cn(
                'inline-flex size-11 items-center justify-center rounded-xl',
                index === 0 ? 'bg-white/15' : 'bg-primary-soft text-link',
              )}
            >
              <Icon name={icon} className="size-5.5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[17px] font-semibold">{t(`shortcuts.${key}.title`)}</span>
              <span className="text-sm opacity-80">{t(`shortcuts.${key}.text`)}</span>
            </span>
          </Link>
        ))}
      </nav>
      {ready ? (
        <>
          <div className="flex flex-wrap items-start gap-6">
            <section className="flex min-w-0 flex-1 basis-95 flex-col gap-4 rounded-panel border border-line bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">{t('continue')}</h2>
                {next && (
                  <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
                    {t('withoutGrade', { count: next.missing })}
                  </span>
                )}
              </div>
              {next ? (
                <>
                  <div className="flex flex-col gap-1 wrap-anywhere">
                    <span className="text-lg font-semibold">{next.activity.title}</span>
                    <span className="text-sm text-muted">
                      {t('closedAt', {
                        discipline: next.discipline.name,
                        date: formatDate(next.time, i18n.language, {
                          day: '2-digit',
                          month: 'short',
                        }),
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-[13px] text-muted">
                    <span className="flex justify-between">
                      <span>{t('gradedLabel')}</span>
                      <span>{t('gradedOf', { graded: next.graded, total: next.total })}</span>
                    </span>
                    <span aria-hidden="true" className="h-2 rounded-full bg-primary-soft">
                      <span
                        className="block h-2 rounded-full bg-primary"
                        style={{ width: `${(next.graded / next.total) * 100}%` }}
                      />
                    </span>
                  </div>
                  <Link
                    to={area.disciplineGrades(next.discipline.id)}
                    className="inline-flex h-11 items-center self-start rounded-button bg-primary px-4.5 text-[15px] font-semibold text-white hover:bg-primary-hover"
                  >
                    {t('continueAction')}
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted">{t('nothingPending')}</p>
              )}
            </section>
            <DeadlineList title={t('week')} deadlines={deadlines} />
          </div>
          {entries.length > 0 && (
            <section className="flex flex-col gap-3.5">
              <h2 className="font-display text-xl font-semibold">{t('classes')}</h2>
              <ul className="flex flex-wrap gap-2.5">
                {entries.map(({ discipline, students }) => (
                  <li key={discipline.id}>
                    <Link
                      to={area.discipline(discipline.id)}
                      className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-field bg-surface px-4 py-1 text-sm font-semibold wrap-anywhere hover:bg-canvas"
                    >
                      {discipline.name}
                      <span className="font-medium text-muted">
                        {t('students', { count: students.length })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <HomeStatus error={error} paused={paused} onRetry={() => void refetch()} />
      )}
    </>
  );
}
