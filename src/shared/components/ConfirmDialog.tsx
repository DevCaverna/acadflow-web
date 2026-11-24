import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Modal } from '@/shared/components/Modal';

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
  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Icon name={error ? 'lock' : 'remove'} />
        </span>
        <p className="text-[15px] text-muted wrap-anywhere">{message}</p>
        {error && <Alert>{getErrorMessage(error)}</Alert>}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {t('remove')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
