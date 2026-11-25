import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { getGreeting } from '@/features/home/lib/home';
import { formatDate } from '@/shared/lib/format';

/** Props de {@link HomeHeader}. */
type HomeHeaderProps = {
  /** Momento atual, em milissegundos. */
  now: number;
  /** Resumo abaixo da saudação. */
  children?: ReactNode;
};

/** Data, saudação e resumo da página inicial. */
export function HomeHeader({ now, children }: HomeHeaderProps) {
  const { t, i18n } = useTranslation('home');
  const { name } = useAuthUser();
  return (
    <header className="flex flex-col gap-1.5">
      <span className="text-sm text-muted first-letter:uppercase">
        {formatDate(now, i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
      <h1 className="font-display text-[32px] leading-10 font-bold wrap-anywhere">
        {t(`greeting.${getGreeting(now)}`, { name: name.trim().split(/\s+/)[0] })}
      </h1>
      {children && <p className="text-muted">{children}</p>}
    </header>
  );
}
