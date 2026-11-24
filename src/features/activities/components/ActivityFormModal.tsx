import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreateActivity, useUpdateActivity } from '@/features/activities/hooks/useActivities';
import { fromLocalInput, toLocalInput } from '@/features/activities/lib/due-date';
import {
  type Activity,
  type ActivityForm,
  activityFormSchema,
  newActivityFormSchema,
} from '@/features/activities/schemas/activity.schema';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Field } from '@/shared/components/Field';
import { Modal } from '@/shared/components/Modal';
import { ModalFooter } from '@/shared/components/ModalFooter';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link ActivityFormModal}. */
type ActivityFormModalProps = {
  /** Disciplina da atividade. */
  discipline: Discipline;
  /** Atividade em edição; sem ela, cria uma nova. */
  activity?: Activity;
  /** Chamado ao fechar ou salvar. */
  onClose: () => void;
};

/** Formulário de criação e edição de atividade. */
export function ActivityFormModal({ discipline, activity, onClose }: ActivityFormModalProps) {
  const { t } = useTranslation(['activities', 'common']);
  const create = useCreateActivity(discipline.id);
  const update = useUpdateActivity(discipline.id);
  const { register, handleSubmit, formState } = useForm<ActivityForm>({
    resolver: zodResolver(activity ? activityFormSchema : newActivityFormSchema),
    defaultValues: {
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      dueAt: toLocalInput(activity?.dueAt ?? null),
    },
  });
  const error = create.error ?? update.error;

  function finish(title: string, name: string) {
    toastStore.show(title, name);
    onClose();
  }

  function submit({ title, description, dueAt }: ActivityForm) {
    const input = { title, description: description || null, dueAt: fromLocalInput(dueAt) };
    if (activity)
      update.mutate(
        { id: activity.id, ...input },
        { onSuccess: () => finish(t('updated'), title) },
      );
    else create.mutate(input, { onSuccess: () => finish(t('created'), title) });
  }

  return (
    <Modal
      title={activity ? t('editTitle') : t('new')}
      subtitle={`${discipline.name} · ${discipline.code}`}
      onClose={onClose}
    >
      <form noValidate onSubmit={(event) => void handleSubmit(submit)(event)}>
        <div className="flex flex-col gap-4.5 p-6">
          {error && <Alert>{getErrorMessage(error)}</Alert>}
          <Field label={t('name')} error={formState.errors.title?.message} {...register('title')} />
          <Field
            multiline
            optional
            label={t('description')}
            placeholder={t('descriptionPlaceholder')}
            error={formState.errors.description?.message}
            {...register('description')}
          />
          <Field
            type="datetime-local"
            optional
            label={t('dueAt')}
            error={formState.errors.dueAt?.message}
            {...register('dueAt')}
          />
          {!activity && <Alert variant="info">{t('visible')}</Alert>}
        </div>
        <ModalFooter
          submitLabel={activity ? t('common:save') : t('new')}
          loading={create.isPending || update.isPending}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}
