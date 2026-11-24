import { useGrades } from '@/features/grades/hooks/useGrades';

/** Props de {@link GradedProgress}. */
type GradedProgressProps = {
  /** Disciplina da atividade. */
  disciplineId: string;
  /** Atividade consultada. */
  activityId: string;
};

/** Quantidade de alunos com nota na atividade. */
export function GradedProgress({ disciplineId, activityId }: GradedProgressProps) {
  const { data } = useGrades(disciplineId);
  if (!data) return <span className="text-muted">—</span>;
  const total = data.length;
  const graded = data.filter(({ grades }) =>
    grades.some((grade) => grade.activityId === activityId),
  ).length;
  const percent = total === 0 ? 0 : (graded / total) * 100;
  return (
    <span className="flex flex-col gap-1.5 text-[13px] whitespace-nowrap text-muted">
      <span>
        <b className="text-ink">{graded}</b> / {total}
      </span>
      <span aria-hidden="true" className="block h-1.5 w-20 rounded-full bg-primary-soft">
        <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </span>
    </span>
  );
}
