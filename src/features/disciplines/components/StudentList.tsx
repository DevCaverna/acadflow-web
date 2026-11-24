import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useGrades } from '@/features/grades/hooks/useGrades';
import { Avatar } from '@/shared/components/Avatar';
import { QueryState } from '@/shared/components/QueryState';
import { formatGrade } from '@/shared/lib/format';

/** Props de {@link StudentList}. */
type StudentListProps = {
  /** Disciplina consultada. */
  disciplineId: string;
};

/** Alunos matriculados na disciplina, com a média. */
export function StudentList({ disciplineId }: StudentListProps) {
  const { t, i18n } = useTranslation(['disciplines', 'grades']);
  const query = useGrades(disciplineId);
  return (
    <QueryState query={query}>
      {(students) => (
        <aside className="overflow-hidden rounded-card border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4.5">
            <h2 className="font-display text-lg font-semibold">{t('students')}</h2>
            <span className="text-[13px] text-muted">{students.length}</span>
          </header>
          {students.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">{t('noStudents')}</p>
          ) : (
            <ul>
              {students.map(({ student, average }) => (
                <li
                  key={student.id}
                  className="flex items-center gap-3 border-b border-subtle px-5 py-3"
                >
                  <Avatar name={student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold wrap-anywhere">{student.name}</p>
                    <p className="text-xs text-muted wrap-anywhere">{student.email}</p>
                  </div>
                  <span className="font-display font-bold">
                    {average === null ? '—' : formatGrade(average, i18n.language)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`/grades?discipline=${disciplineId}`}
            className="flex h-12 items-center justify-center text-sm font-semibold text-primary"
          >
            {t('grades:openGrades')}
          </Link>
          <p className="px-5 pb-4 text-xs text-muted">{t('enrollmentHint')}</p>
        </aside>
      )}
    </QueryState>
  );
}
