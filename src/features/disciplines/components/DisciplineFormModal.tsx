import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useCreateDiscipline,
  useUpdateDiscipline,
} from '@/features/disciplines/hooks/useDisciplines';
import {
  type Discipline,
  type DisciplineForm,
  disciplineFormSchema,
} from '@/features/disciplines/schemas/discipline.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Field } from '@/shared/components/Field';
import { Modal } from '@/shared/components/Modal';
import { ModalFooter } from '@/shared/components/ModalFooter';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link DisciplineFormModal}. */
type DisciplineFormModalProps = {
  /** Disciplina em edição; sem ela, cria uma nova. */
  discipline?: Discipline;
  /** Chamado ao fechar ou salvar. */
  onClose: () => void;
};

/** Formulário de criação e edição de disciplina. */
export function DisciplineFormModal({ discipline, onClose }: DisciplineFormModalProps) {
  const { t } = useTranslation(['disciplines', 'common']);
  const create = useCreateDiscipline();
  const update = useUpdateDiscipline();
  const { register, handleSubmit, formState } = useForm<DisciplineForm>({
    resolver: zodResolver(disciplineFormSchema),
    defaultValues: {
      code: discipline?.code ?? '',
      name: discipline?.name ?? '',
      semester: discipline?.semester ?? '',
      description: discipline?.description ?? '',
    },
  });
  const error = create.error ?? update.error;

  function finish(title: string, name: string) {
    toastStore.show(title, name);
    onClose();
  }

  function submit({ code, name, semester, description }: DisciplineForm) {
    if (discipline) {
      update.mutate(
        { id: discipline.id, name, description: description || null },
        { onSuccess: () => finish(t('updated'), name) },
      );
    } else {
      create.mutate(
        { code, name, semester, description: description || undefined },
        { onSuccess: () => finish(t('created'), name) },
      );
    }
  }

  return (
    <Modal title={discipline ? t('editTitle') : t('new')} onClose={onClose}>
      <form noValidate onSubmit={(event) => void handleSubmit(submit)(event)}>
        <div className="flex flex-col gap-4.5 p-6">
          {error && <Alert>{getErrorMessage(error)}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t('code')}
              placeholder="BD-204"
              readOnly={discipline !== undefined}
              error={formState.errors.code?.message}
              {...register('code')}
            />
            <Field
              label={t('semester')}
              placeholder="2026.2"
              readOnly={discipline !== undefined}
              error={formState.errors.semester?.message}
              {...register('semester')}
            />
          </div>
          {!discipline && <p className="text-[13px] text-muted">{t('unique')}</p>}
          <Field label={t('name')} error={formState.errors.name?.message} {...register('name')} />
          <Field
            multiline
            optional
            label={t('description')}
            placeholder={t('descriptionPlaceholder')}
            error={formState.errors.description?.message}
            {...register('description')}
          />
        </div>
        <ModalFooter
          submitLabel={discipline ? t('common:save') : t('new')}
          loading={create.isPending || update.isPending}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}
