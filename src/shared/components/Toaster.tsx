import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';
import { type ToastVariant, toastStore } from '@/shared/lib/toast';

const STYLES: Record<ToastVariant, { className: string; icon: IconName }> = {
  success: { className: 'bg-success-soft text-success', icon: 'check' },
  error: { className: 'bg-danger-soft text-danger', icon: 'exclamation' },
  info: { className: 'bg-primary-soft text-link', icon: 'info' },
};

/** Avisos temporários no canto superior direito. */
export function Toaster() {
  const { t } = useTranslation();
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.get);
  return (
    <div className="fixed top-4 right-4 z-30 flex w-80 max-w-[calc(100%-2rem)] flex-col gap-3">
      {toasts.map(({ id, title, text, variant }) => (
        <div
          key={id}
          role={variant === 'error' ? 'alert' : 'status'}
          className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm shadow-xl"
        >
          <span
            className={cn(
              'inline-flex size-7 shrink-0 items-center justify-center rounded-full',
              STYLES[variant].className,
            )}
          >
            <Icon name={STYLES[variant].icon} className="size-3.5 stroke-3" />
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
