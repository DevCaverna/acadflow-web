import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MIN_SEARCH_LENGTH,
  useCandidates,
  useEnroll,
} from '@/features/enrollments/hooks/useEnrollments';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Modal } from '@/shared/components/Modal';
import { QueryState } from '@/shared/components/QueryState';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link EnrollModal}. */
type EnrollModalProps = {
  /** Disciplina que recebe o aluno. */
  disciplineId: string;
  /** Chamado ao fechar. */
  onClose: () => void;
};

/** Busca e matrícula de alunos na disciplina. */
export function EnrollModal({ disciplineId, onClose }: EnrollModalProps) {
  const { t } = useTranslation('enrollments');
  const [text, setText] = useState('');
  const search = text.trim();
  const query = useCandidates(disciplineId, search);
  const enroll = useEnroll(disciplineId);

  return (
    <Modal title={t('add')} onClose={onClose}>
      <div className="flex flex-col gap-4.5 p-6">
        <Field
          type="search"
          label={t('search')}
          maxLength={120}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {enroll.error && <Alert>{getErrorMessage(enroll.error)}</Alert>}
        {search.length < MIN_SEARCH_LENGTH ? (
          <p className="text-sm text-muted">{t('searchHint')}</p>
        ) : (
          <QueryState query={query}>
            {(students) =>
              students.length === 0 ? (
                <p className="text-sm text-muted">{t('noCandidates')}</p>
              ) : (
                <ul aria-label={t('candidates')} className="divide-y divide-subtle">
                  {students.map((student) => (
                    <li key={student.id} className="flex items-center gap-3 py-3">
                      <Avatar name={student.name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold wrap-anywhere">{student.name}</p>
                        <p className="text-xs text-muted wrap-anywhere">{student.email}</p>
                      </div>
                      <Button
                        variant="secondary"
                        aria-label={`${t('enroll')}: ${student.name}`}
                        disabled={enroll.isPending}
                        loading={enroll.isPending && enroll.variables === student.id}
                        onClick={() =>
                          enroll.mutate(student.id, {
                            onSuccess: () => toastStore.show(t('enrolled'), student.name),
                          })
                        }
                      >
                        {t('enroll')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )
            }
          </QueryState>
        )}
      </div>
    </Modal>
  );
}
