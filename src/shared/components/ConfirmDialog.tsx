import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiError, getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/lib/cn';

/** Props de {@link ConfirmDialog}. */
type ConfirmDialogProps = {
  /** Título da confirmação. */
  title: string;
  /** Pergunta de confirmação. */
  message: string;
  /** Erro da última tentativa. */
  error: Error | null;
  /** Indica remoção em andamento. */
  loading: boolean;
  /** Chamado ao confirmar. */
  onConfirm: () => void;
  /** Chamado ao cancelar. */
  onClose: () => void;
};

/** Confirmação de remoção. */
export function ConfirmDialog({
  title,
  message,
  error,
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const textId = useId();
  const blocked = getApiError(error)?.statusCode === 409;
  return (
    <Modal
      role="alertdialog"
      describedBy={textId}
      title={blocked ? t('blockedTitle') : title}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 p-6">
        <span
          className={cn(
            'inline-flex size-12 items-center justify-center rounded-full',
            blocked ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger',
          )}
        >
          <Icon name={blocked ? 'lock' : 'remove'} />
        </span>
        <p
          id={textId}
          role={blocked ? 'alert' : undefined}
          className="text-[15px] text-muted wrap-anywhere"
        >
          {blocked ? getErrorMessage(error) : message}
        </p>
        {error && !blocked && <Alert>{getErrorMessage(error)}</Alert>}
        <div className="flex justify-end gap-3">
          {blocked ? (
            <Button onClick={onClose}>{t('understood')}</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button variant="danger" loading={loading} onClick={onConfirm}>
                {t('remove')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
