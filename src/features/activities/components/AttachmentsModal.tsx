import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAttachments,
  useDownloadAttachment,
  useRemoveAttachment,
  useUploadAttachment,
} from '@/features/activities/hooks/useAttachments';
import type { Activity } from '@/features/activities/schemas/activity.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { IconButton } from '@/shared/components/IconButton';
import { Modal } from '@/shared/components/Modal';
import { QueryState } from '@/shared/components/QueryState';
import { ATTACHMENT_RULES, formatFileSize, isValidFile } from '@/shared/lib/file';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link AttachmentsModal}. */
type AttachmentsModalProps = {
  /** Atividade dos anexos. */
  activity: Activity;
  /** Permite adicionar e remover. */
  canEdit: boolean;
  /** Chamado ao fechar. */
  onClose: () => void;
};

/** Anexos da atividade; o aluno só baixa. */
export function AttachmentsModal({ activity, canEdit, onClose }: AttachmentsModalProps) {
  const { t, i18n } = useTranslation(['activities', 'common']);
  const input = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const query = useAttachments(activity.id);
  const upload = useUploadAttachment(activity.id);
  const remove = useRemoveAttachment(activity.id);
  const download = useDownloadAttachment();
  const error = upload.error ?? remove.error ?? download.error;

  function choose(file: File | undefined) {
    if (input.current) input.current.value = '';
    if (!file) return;
    const valid = isValidFile(file, ATTACHMENT_RULES);
    setInvalid(!valid);
    if (valid) {
      upload.mutate(file, {
        onSuccess: () => toastStore.show(t('attachments.added'), file.name),
      });
    }
  }

  return (
    <Modal title={t('attachments.title')} subtitle={activity.title} onClose={onClose}>
      <div className="flex flex-col gap-4.5 p-6">
        {invalid && <Alert>{t('attachments.invalid')}</Alert>}
        {error && <Alert>{getErrorMessage(error)}</Alert>}
        <QueryState query={query}>
          {(attachments) =>
            attachments.length === 0 ? (
              <p className="text-sm text-muted">{t('attachments.empty')}</p>
            ) : (
              <ul aria-label={t('attachments.title')} className="divide-y divide-subtle">
                {attachments.map(({ id, name, sizeBytes }) => (
                  <li key={id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold wrap-anywhere">{name}</p>
                      <p className="text-xs text-muted">
                        {formatFileSize(sizeBytes, i18n.language)}
                      </p>
                    </div>
                    <IconButton
                      icon="download"
                      label={`${t('attachments.download')}: ${name}`}
                      disabled={download.isPending}
                      onClick={() => download.mutate(id)}
                    />
                    {canEdit && (
                      <IconButton
                        icon="remove"
                        label={`${t('attachments.remove')}: ${name}`}
                        className="text-danger"
                        onClick={() => setConfirmingId(id)}
                      />
                    )}
                    {confirmingId === id && (
                      <div className="flex w-full flex-wrap items-center justify-end gap-2 text-sm">
                        <span className="wrap-anywhere">{t('attachments.confirm', { name })}</span>
                        <Button variant="secondary" onClick={() => setConfirmingId(null)}>
                          {t('common:cancel')}
                        </Button>
                        <Button
                          variant="danger"
                          loading={remove.isPending}
                          onClick={() =>
                            remove.mutate(id, {
                              onSuccess: () => {
                                setConfirmingId(null);
                                toastStore.show(t('attachments.removed'), name);
                              },
                            })
                          }
                        >
                          {t('attachments.remove')}
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )
          }
        </QueryState>
        {canEdit && (
          <div className="flex flex-col items-start gap-2 border-t border-line pt-4">
            <input
              ref={input}
              type="file"
              aria-label={t('attachments.add')}
              accept={ATTACHMENT_RULES.types.join(',')}
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => choose(event.target.files?.[0])}
            />
            <Button
              icon="attachment"
              loading={upload.isPending}
              onClick={() => input.current?.click()}
            >
              {t('attachments.add')}
            </Button>
            <p className="text-[13px] text-muted">{t('attachments.hint')}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
