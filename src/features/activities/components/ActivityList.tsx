import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityFormModal } from '@/features/activities/components/ActivityFormModal';
import { AttachmentsModal } from '@/features/activities/components/AttachmentsModal';
import { DueBadge } from '@/features/activities/components/DueBadge';
import { GradedProgress } from '@/features/activities/components/GradedProgress';
import { useActivities, useRemoveActivity } from '@/features/activities/hooks/useActivities';
import type { Activity } from '@/features/activities/schemas/activity.schema';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import { Button } from '@/shared/components/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { EmptyState } from '@/shared/components/EmptyState';
import { IconButton } from '@/shared/components/IconButton';
import { QueryState } from '@/shared/components/QueryState';
import { formatDateTime } from '@/shared/lib/format';
import { toastStore } from '@/shared/lib/toast';

const HEADER_CLASS = 'px-4 py-3.5 text-xs font-semibold tracking-[0.06em] text-muted uppercase';

/** Props de {@link ActivityList}. */
type ActivityListProps = {
  /** Disciplina das atividades. */
  discipline: Discipline;
  /** Permite criar, editar e excluir. */
  canEdit: boolean;
};

/** Atividades da disciplina; somente leitura para o aluno. */
export function ActivityList({ discipline, canEdit }: ActivityListProps) {
  const { t, i18n } = useTranslation(['activities', 'common']);
  const query = useActivities(discipline.id);
  const remove = useRemoveActivity(discipline.id);
  const [form, setForm] = useState<{ activity?: Activity } | null>(null);
  const [removing, setRemoving] = useState<Activity | null>(null);
  const [attaching, setAttaching] = useState<Activity | null>(null);
  const [now] = useState(() => Date.now());

  const createButton = canEdit && (
    <Button icon="plus" onClick={() => setForm({})}>
      {t('new')}
    </Button>
  );

  function closeRemoval() {
    remove.reset();
    setRemoving(null);
  }

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{t('title')}</h2>
        {createButton}
      </header>
      <QueryState query={query} skeleton="table">
        {(activities) =>
          activities.length === 0 ? (
            <EmptyState
              icon="activities"
              title={t('emptyTitle')}
              text={canEdit ? t('emptyHint') : t('empty')}
            />
          ) : (
            <div className="overflow-x-auto rounded-card border border-line bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas">
                  <tr>
                    <th scope="col" className={HEADER_CLASS}>
                      {t('column')}
                    </th>
                    <th scope="col" className={HEADER_CLASS}>
                      {t('dueAt')}
                    </th>
                    <th scope="col" className={HEADER_CLASS}>
                      {t('deadline')}
                    </th>
                    {canEdit && (
                      <th scope="col" className={HEADER_CLASS}>
                        {t('graded')}
                      </th>
                    )}
                    <th scope="col" className={HEADER_CLASS}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id} className="border-t border-subtle">
                      <th scope="row" className="min-w-44 px-4 py-4 font-normal">
                        <span className="block text-[15px] font-semibold wrap-anywhere">
                          {activity.title}
                        </span>
                        {activity.description && (
                          <span className="mt-1 block text-[13px] whitespace-pre-line text-muted wrap-anywhere">
                            {activity.description}
                          </span>
                        )}
                      </th>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {activity.dueAt
                          ? formatDateTime(activity.dueAt, i18n.language)
                          : t('noDueDate')}
                      </td>
                      <td className="px-4 py-4">
                        <DueBadge dueAt={activity.dueAt} now={now} />
                      </td>
                      {canEdit && (
                        <td className="px-4 py-4">
                          <GradedProgress disciplineId={discipline.id} activityId={activity.id} />
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5">
                          <IconButton
                            icon="attachment"
                            label={`${t('attachments.title')}: ${activity.title}`}
                            onClick={() => setAttaching(activity)}
                          />
                          {canEdit && (
                            <>
                              <IconButton
                                icon="edit"
                                label={`${t('common:edit')}: ${activity.title}`}
                                onClick={() => setForm({ activity })}
                              />
                              <IconButton
                                icon="remove"
                                label={`${t('common:remove')}: ${activity.title}`}
                                className="text-danger"
                                onClick={() => setRemoving(activity)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </QueryState>
      {form && (
        <ActivityFormModal
          discipline={discipline}
          activity={form.activity}
          onClose={() => setForm(null)}
        />
      )}
      {attaching && (
        <AttachmentsModal
          activity={attaching}
          canEdit={canEdit}
          onClose={() => setAttaching(null)}
        />
      )}
      {removing && (
        <ConfirmDialog
          title={t('removeTitle')}
          message={t('removeConfirm', { title: removing.title })}
          error={remove.error}
          loading={remove.isPending}
          onConfirm={() =>
            remove.mutate(removing.id, {
              onSuccess: () => {
                toastStore.show(t('removed'), removing.title, 'info');
                closeRemoval();
              },
            })
          }
          onClose={closeRemoval}
        />
      )}
    </section>
  );
}
