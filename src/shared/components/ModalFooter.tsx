import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/Button';

/** Props de {@link ModalFooter}. */
type ModalFooterProps = {
  /** Texto do botão de envio. */
  submitLabel: string;
  /** Indica envio em andamento. */
  loading: boolean;
  /** Chamado ao cancelar. */
  onClose: () => void;
};

/** Rodapé de formulário em janela modal. */
export function ModalFooter({ submitLabel, loading, onClose }: ModalFooterProps) {
  const { t } = useTranslation();
  return (
    <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">
      <Button variant="secondary" onClick={onClose}>
        {t('cancel')}
      </Button>
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </footer>
  );
}
