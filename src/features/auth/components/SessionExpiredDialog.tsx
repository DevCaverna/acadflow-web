import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { accessToken } from '@/shared/api/access-token';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';

/** Aviso de sessão expirada sobre a tela de login. */
export function SessionExpiredDialog() {
  const { t } = useTranslation('auth');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby="session-title"
      aria-describedby="session-text"
      onCancel={(event) => {
        event.preventDefault();
        accessToken.clear();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-115 rounded-panel bg-white p-8 text-ink shadow-2xl backdrop:bg-ink/60"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon name="lock" className="size-6.5" />
        </span>
        <h2 id="session-title" className="font-display text-2xl font-bold">
          {t('sessionExpiredTitle')}
        </h2>
        <p id="session-text" className="text-[15px] text-muted">
          {t('sessionExpired')}
        </p>
        <Button className="mt-2 h-12 w-full" onClick={accessToken.clear}>
          {t('signInAgain')}
        </Button>
      </div>
    </dialog>
  );
}
