import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAreaRoutes } from '@/features/auth/hooks/useAreaRoutes';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import { GradeStatusBadge } from '@/features/grades/components/GradeStatusBadge';
import { DeadlineList } from '@/features/home/components/DeadlineList';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeStatus } from '@/features/home/components/HomeStatus';
import { useStudentEntries } from '@/features/home/hooks/useHomeEntries';
import { getDeadlines, getRecentGrades } from '@/features/home/lib/home';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDateTime, formatGrade } from '@/shared/lib/format';

const DEADLINE_DAYS = 14;
const RECENT_DAYS = 7;

/** Props de {@link StudentHome}. */
type StudentHomeProps = {
  /** Disciplinas em que o aluno está matriculado. */
  disciplines: readonly Discipline[];
};

/** Início do aluno: próximo prazo, nota nova e médias. */
export function StudentHome({ disciplines }: StudentHomeProps) {
  const { t, i18n } = useTranslation(['home', 'disciplines']);
  const area = useAreaRoutes();
  const [now] = useState(() => Date.now());
  const { entries, isPending, error, paused, refetch } = useStudentEntries(disciplines);
  const ready = !isPending && !error;

  if (!ready) {
    return (
      <>
        <HomeHeader now={now} />
        <HomeStatus error={error} paused={paused} onRetry={() => void refetch()} />
      </>
    );
  }
  if (entries.length === 0) {
    return (
      <>
        <HomeHeader now={now} />
        <EmptyState
          icon="disciplines"
          title={t('disciplines:emptyTitle')}
          text={t('noEnrollments')}
        />
      </>
    );
  }

  const deadlines = getDeadlines({ entries, now, days: DEADLINE_DAYS });
  const recent = getRecentGrades(entries, now, RECENT_DAYS);
  const next = deadlines[0];
  const grade = recent[0];
  return (
    <>
      <HomeHeader now={now}>
        {[
          t('deadlines14', { count: deadlines.length }),
          t('newGrades', { count: recent.length }),
        ].join(' · ')}
      </HomeHeader>
      <div className="flex flex-wrap gap-5">
        <section className="flex min-w-0 flex-3 basis-80 flex-col gap-4 rounded-panel bg-primary p-7 text-white">
          <h2 className="text-xs font-semibold tracking-[0.08em] uppercase">{t('nextDeadline')}</h2>
          {next ? (
            <>
              <div className="flex flex-col gap-1.5 wrap-anywhere">
                <p className="font-display text-[28px] leading-tight font-bold">
                  {next.activity.title}
                </p>
                <p className="text-[15px] text-white/85">
                  {t('dueAt', {
                    discipline: next.discipline.name,
                    date: formatDateTime(new Date(next.time).toISOString(), i18n.language),
                  })}
                </p>
              </div>
              {next.activity.description && (
                <p className="line-clamp-3 max-w-140 text-[15px] wrap-anywhere">
                  {next.activity.description}
                </p>
              )}
              <Link
                to={area.discipline(next.discipline.id)}
                className="inline-flex h-11 items-center self-start rounded-button bg-white px-4.5 text-[15px] font-semibold text-primary-active"
              >
                {t('seeDiscipline')}
              </Link>
            </>
          ) : (
            <p>{t('noDeadlines')}</p>
          )}
        </section>
        <section className="flex min-w-0 flex-2 basis-70 flex-col gap-3.5 rounded-panel border border-line bg-surface p-6">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {t('newGrade')}
          </h2>
          {grade ? (
            <>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-[44px] leading-none font-bold">
                  {formatGrade(grade.value, i18n.language)}
                </span>
                <span className="text-sm text-muted">/ 10</span>
              </p>
              <div className="flex flex-col gap-1 wrap-anywhere">
                <span className="font-semibold">{grade.activity.title}</span>
                <span className="text-[13px] text-muted">
                  {[grade.discipline.name, formatDateTime(grade.updatedAt, i18n.language)].join(
                    ' · ',
                  )}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">{t('noNewGrades')}</p>
          )}
          <Link to={area.grades} className="text-sm font-semibold text-link">
            {t('allGrades')}
          </Link>
        </section>
      </div>
      <section className="flex flex-col gap-3.5">
        <h2 className="font-display text-xl font-semibold">{t('myDisciplines')}</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-3.5">
          {entries.map(({ discipline, activities, summary: { grades, average, status } }) => (
            <li key={discipline.id}>
              <Link
                to={area.disciplineGrades(discipline.id)}
                className="flex h-full items-center justify-between gap-3 rounded-card border border-line bg-surface px-4.5 py-4 hover:bg-canvas"
              >
                <span className="flex min-w-0 flex-col items-start gap-1.5">
                  <span className="text-[15px] font-semibold wrap-anywhere">{discipline.name}</span>
                  <GradeStatusBadge status={status} partial={activities.length > grades.length} />
                </span>
                <span className="font-display text-2xl font-bold">
                  {average === null ? '—' : formatGrade(average, i18n.language)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-muted">{t('partialHint')}</p>
      </section>
      <DeadlineList title={t('next14')} deadlines={deadlines} />
    </>
  );
}
