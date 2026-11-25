import { useTranslation } from 'react-i18next';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { getClassAverage } from '@/features/grades/lib/class-average';
import { useGrades } from '@/features/grades/hooks/useGrades';
import { cn } from '@/shared/lib/cn';
import { formatGrade } from '@/shared/lib/format';

/** Props de {@link DisciplineStats}. */
type DisciplineStatsProps = {
  /** Disciplina consultada. */
  disciplineId: string;
};

/** Alunos, atividades e média da turma; "—" enquanto não há dados. */
export function DisciplineStats({ disciplineId }: DisciplineStatsProps) {
  const { t, i18n } = useTranslation('disciplines');
  const { data: students } = useGrades(disciplineId);
  const { data: activities } = useActivities(disciplineId);
  const average = students ? getClassAverage(students) : null;
  const stats = [
    { key: 'students', value: students?.length ?? '—' },
    { key: 'activities', value: activities?.length ?? '—' },
    { key: 'average', value: average === null ? '—' : formatGrade(average, i18n.language) },
  ] as const;
  return (
    <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-subtle pt-3.5 text-[13px] text-muted">
      {stats.map(({ key, value }) => (
        <div key={key} className={cn('flex gap-1', key !== 'average' && 'flex-row-reverse')}>
          <dt>{t(`stats.${key}`, { count: typeof value === 'number' ? value : 0 })}</dt>
          <dd className="font-bold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
