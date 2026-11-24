import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useNotices } from '@/features/notifications/hooks/useNotices';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Skeleton } from '@/shared/components/Skeleton';
import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/format';

/** Props de {@link NotificationPanel}. */
type NotificationPanelProps = {
  /** Inclui avisos de nota, só do próprio aluno. */
  isStudent: boolean;
  /** Chamado ao abrir um aviso. */
  onNavigate: () => void;
};

/** Avisos derivados de prazos e notas. */
export function NotificationPanel({ isStudent, onNavigate }: NotificationPanelProps) {
  const { t, i18n } = useTranslation(['notifications', 'common']);
  const [now] = useState(() => Date.now());
  const { notices, isPending, error, refetch } = useNotices({ isStudent, now });

  function renderContent() {
    if (error) {
      return (
        <div className="flex flex-col items-start gap-3 p-4">
          <Alert>{getErrorMessage(error)}</Alert>
          <Button variant="secondary" onClick={() => void refetch()}>
            {t('common:retry')}
          </Button>
        </div>
      );
    }
    if (isPending) return <Skeleton />;
    if (notices.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <Icon name="bell" className="text-muted" />
          <p className="font-semibold">{t('empty')}</p>
          <p className="text-[13px] text-muted">{t('emptyHint')}</p>
        </div>
      );
    }
    return (
      <ul>
        {notices.map((notice) => (
          <li key={notice.id}>
            <Link
              to={
                notice.type === 'grade'
                  ? `/grades?discipline=${notice.disciplineId}`
                  : `/disciplines/${notice.disciplineId}`
              }
              onClick={onNavigate}
              className="flex gap-3 border-b border-subtle px-4.5 py-3.5 hover:bg-canvas"
            >
              <span
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                  notice.type === 'due'
                    ? 'bg-warning-soft text-warning'
                    : 'bg-success-soft text-success',
                )}
              >
                <Icon name={notice.type === 'due' ? 'clock' : 'grades'} className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm wrap-anywhere">
                  {notice.type === 'due'
                    ? t('due', { activity: notice.activityTitle, count: notice.days })
                    : t('grade', { activity: notice.activityTitle })}
                </span>
                <span className="text-xs text-muted wrap-anywhere">
                  {notice.disciplineName} · {formatDateTime(notice.date, i18n.language)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-label={t('title')}
      className="fixed inset-x-4 bottom-4 z-20 flex max-h-[70vh] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-xl md:absolute md:inset-x-auto md:bottom-full md:left-0 md:mb-2 md:w-95"
    >
      <header className="flex items-center justify-between border-b border-line px-4.5 py-4">
        <h2 className="font-semibold">{t('title')}</h2>
        {!isPending && !error && (
          <span className="text-xs text-muted">{t('count', { count: notices.length })}</span>
        )}
      </header>
      <div className="overflow-y-auto">{renderContent()}</div>
      <p className="bg-canvas px-4.5 py-3 text-xs text-muted">{t('footer')}</p>
    </section>
  );
}
