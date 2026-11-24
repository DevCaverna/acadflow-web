import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationPanel } from '@/features/notifications/components/NotificationPanel';
import { IconButton } from '@/shared/components/IconButton';

/** Props de {@link NotificationBell}. */
type NotificationBellProps = {
  /** Inclui avisos de nota, só do próprio aluno. */
  isStudent: boolean;
};

/** Sino que abre os avisos; não guarda leitura nem histórico. */
export function NotificationBell({ isStudent }: NotificationBellProps) {
  const { t } = useTranslation('notifications');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointer(event: PointerEvent) {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon="bell"
        label={t('open')}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      />
      {open && <NotificationPanel isStudent={isStudent} onNavigate={() => setOpen(false)} />}
    </div>
  );
}
