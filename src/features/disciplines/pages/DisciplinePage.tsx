import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { ActivityList } from '@/features/activities/components/ActivityList';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { DisciplineFormModal } from '@/features/disciplines/components/DisciplineFormModal';
import { StudentList } from '@/features/disciplines/components/StudentList';
import { useDiscipline, useRemoveDiscipline } from '@/features/disciplines/hooks/useDisciplines';
import { Breadcrumb } from '@/shared/components/Breadcrumb';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { IconButton } from '@/shared/components/IconButton';
import { QueryState } from '@/shared/components/QueryState';
import { cn } from '@/shared/lib/cn';
import { toastStore } from '@/shared/lib/toast';

/** Detalhe da disciplina, com atividades e, para o professor, alunos. */
export function DisciplinePage() {
  const { t } = useTranslation(['disciplines', 'common', 'grades']);
  const { disciplineId = '' } = useParams();
  const navigate = useNavigate();
  const isProfessor = useAuthUser().role === 'PROFESSOR';
  const query = useDiscipline(disciplineId);
  const remove = useRemoveDiscipline();
  const [dialog, setDialog] = useState<'edit' | 'remove' | null>(null);

  return (
    <QueryState query={query}>
      {(discipline) => (
        <>
          <Breadcrumb
            links={[{ to: '/disciplines', label: t('title') }]}
            current={discipline.name}
          />
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-[32px] leading-10 font-bold wrap-anywhere">
                  {discipline.name}
                </h1>
                <span className="rounded-field bg-primary-soft px-2 py-1 text-xs font-semibold text-primary-hover">
                  {discipline.code}
                </span>
              </div>
              <p className="text-sm text-muted wrap-anywhere">
                {[discipline.semester, discipline.professor.name, discipline.description]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/grades?discipline=${discipline.id}`}
                className="inline-flex h-10 items-center rounded-button border border-field bg-white px-4.5 text-sm font-semibold hover:bg-canvas"
              >
                {isProfessor ? t('grades:entryTitle') : t('grades:mineTitle')}
              </Link>
              {isProfessor && (
                <>
                  <IconButton
                    icon="edit"
                    label={t('editTitle')}
                    onClick={() => setDialog('edit')}
                  />
                  <IconButton
                    icon="remove"
                    label={`${t('common:remove')}: ${discipline.name}`}
                    className="text-danger"
                    onClick={() => setDialog('remove')}
                  />
                </>
              )}
            </div>
          </header>
          <div className={cn('grid items-start gap-6', isProfessor && 'xl:grid-cols-[2fr_1fr]')}>
            <ActivityList discipline={discipline} canEdit={isProfessor} />
            {isProfessor && <StudentList disciplineId={discipline.id} />}
          </div>
          {dialog === 'edit' && (
            <DisciplineFormModal discipline={discipline} onClose={() => setDialog(null)} />
          )}
          {dialog === 'remove' && (
            <ConfirmDialog
              title={t('removeTitle')}
              message={t('removeConfirm', { name: discipline.name })}
              error={remove.error}
              loading={remove.isPending}
              onConfirm={() =>
                remove.mutate(discipline.id, {
                  onSuccess: () => {
                    toastStore.show(t('removed'), discipline.name);
                    void navigate('/disciplines');
                  },
                })
              }
              onClose={() => {
                remove.reset();
                setDialog(null);
              }}
            />
          )}
        </>
      )}
    </QueryState>
  );
}
