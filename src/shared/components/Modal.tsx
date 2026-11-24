import { type ReactNode, useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/** Props de {@link Modal}. */
type ModalProps = {
  /** Título da janela. */
  title: string;
  /** Texto abaixo do título. */
  subtitle?: string;
  /** Conteúdo da janela. */
  children: ReactNode;
  /** Chamado ao fechar. */
  onClose: () => void;
};

/** Janela modal nativa, com foco preso e fechamento por Esc. */
export function Modal({ title, subtitle, children, onClose }: ModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-panel bg-surface text-ink shadow-2xl backdrop:bg-black/55"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={titleId} className="font-display text-[22px] font-semibold">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-muted wrap-anywhere">{subtitle}</p>}
        </div>
        <button
          type="button"
          aria-label={t('close')}
          className="size-10 rounded-lg text-[22px] text-muted hover:bg-canvas"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
