import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components/Icon';
import { toastStore } from '@/shared/lib/toast';

/** Avisos temporários no canto superior direito. */
export function Toaster() {
  const { t } = useTranslation();
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.get);
  return (
    <div className="fixed top-4 right-4 z-10 flex w-80 max-w-[calc(100%-2rem)] flex-col gap-3">
      {toasts.map(({ id, title, text }) => (
        <div
          key={id}
          role="status"
          className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm shadow-xl"
        >
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Icon name="check" className="size-3.5 stroke-3" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{title}</p>
            {text && <p className="text-muted wrap-anywhere">{text}</p>}
          </div>
          <button
            type="button"
            aria-label={t('closeNotice')}
            className="size-7 text-lg text-muted"
            onClick={() => toastStore.dismiss(id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
