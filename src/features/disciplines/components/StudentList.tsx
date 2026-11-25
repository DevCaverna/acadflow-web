import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAreaRoutes } from '@/features/auth/hooks/useAreaRoutes';
import type { Student } from '@/features/disciplines/schemas/discipline.schema';
import { EnrollModal } from '@/features/enrollments/components/EnrollModal';
import { useRemoveEnrollment } from '@/features/enrollments/hooks/useEnrollments';
import { useGrades } from '@/features/grades/hooks/useGrades';
import { Avatar } from '@/shared/components/Avatar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { IconButton } from '@/shared/components/IconButton';
import { QueryState } from '@/shared/components/QueryState';
import { formatGrade } from '@/shared/lib/format';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link StudentList}. */
type StudentListProps = {
  /** Disciplina consultada. */
  disciplineId: string;
};

/** Alunos matriculados na disciplina, com a média, e gestão de matrículas. */
export function StudentList({ disciplineId }: StudentListProps) {
  const { t, i18n } = useTranslation(['disciplines', 'grades', 'enrollments']);
  const area = useAreaRoutes();
  const query = useGrades(disciplineId);
  const remove = useRemoveEnrollment(disciplineId);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Student | null>(null);

  function closeRemoval() {
    remove.reset();
    setRemoving(null);
  }

  return (
    <>
      <QueryState query={query} skeleton="list">
        {(students) => (
          <aside className="overflow-hidden rounded-card border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-5 py-4.5">
              <h2 className="font-display text-lg font-semibold">{t('students')}</h2>
              <span className="flex items-center gap-3 text-[13px] text-muted">
                {students.length}
                <IconButton
                  icon="plus"
                  label={t('enrollments:add')}
                  onClick={() => setAdding(true)}
                />
              </span>
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
                    <IconButton
                      icon="remove"
                      label={`${t('enrollments:remove')}: ${student.name}`}
                      className="text-danger"
                      onClick={() => setRemoving(student)}
                    />
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={area.disciplineGrades(disciplineId)}
              className="flex h-12 items-center justify-center text-sm font-semibold text-link"
            >
              {t('grades:openGrades')}
            </Link>
            <p className="px-5 pb-4 text-xs text-muted">{t('enrollmentHint')}</p>
          </aside>
        )}
      </QueryState>
      {adding && <EnrollModal disciplineId={disciplineId} onClose={() => setAdding(false)} />}
      {removing && (
        <ConfirmDialog
          title={t('enrollments:removeTitle')}
          message={t('enrollments:removeConfirm', { name: removing.name })}
          error={remove.error}
          loading={remove.isPending}
          onConfirm={() =>
            remove.mutate(removing.id, {
              onSuccess: () => {
                toastStore.show(t('enrollments:removed'), removing.name, 'info');
                closeRemoval();
              },
            })
          }
          onClose={closeRemoval}
        />
      )}
    </>
  );
}
