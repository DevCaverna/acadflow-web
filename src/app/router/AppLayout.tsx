import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { useLogout } from '@/features/auth/hooks/useLogout';
import type { User } from '@/features/auth/schemas/auth.schema';
import { Avatar } from '@/shared/components/Avatar';
import { Icon, type IconName } from '@/shared/components/Icon';
import { IconButton } from '@/shared/components/IconButton';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { Toaster } from '@/shared/components/Toaster';
import { cn } from '@/shared/lib/cn';

/** Props de {@link AppLayout}. */
type AppLayoutProps = {
  /** Usuário autenticado. */
  user: User;
};

/** Estrutura das páginas autenticadas, com menu por papel. */
export function AppLayout({ user }: AppLayoutProps) {
  const { t } = useTranslation(['common', 'disciplines', 'grades']);
  const logout = useLogout();
  const items: Array<{ to: string; icon: IconName; label: string }> = [
    { to: '/disciplines', icon: 'disciplines', label: t('disciplines:title') },
    {
      to: '/grades',
      icon: 'grades',
      label: user.role === 'PROFESSOR' ? t('grades:entryTitle') : t('grades:mineTitle'),
    },
  ];
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-line bg-white px-4 py-4 max-md:border-b md:sticky md:top-0 md:h-screen md:w-62 md:shrink-0 md:gap-8 md:border-r md:py-6">
        <div className="flex items-center gap-2.5 px-2">
          <img src="/icons/icon-simple.svg" alt="" width={36} height={36} />
          <span className="font-display text-xl font-bold tracking-tight">{t('appName')}</span>
        </div>
        <nav aria-label={t('menu')} className="flex flex-1 gap-1 md:flex-col">
          <span className="px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase max-md:hidden">
            {t(`areas.${user.role}`)}
          </span>
          {items.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-button px-3 text-[15px] font-medium text-muted hover:bg-canvas',
                  isActive && 'bg-primary-soft font-semibold text-primary-hover',
                )
              }
            >
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>
        <LanguageSelector />
        <div className="flex items-center gap-3 rounded-xl border border-line p-3">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">
              {t(`roles.${user.role}`)}
            </p>
          </div>
          <IconButton icon="signOut" label={t('signOut')} className="border-0" onClick={logout} />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-6 md:px-10 md:pt-8 md:pb-12">
        <div className="flex max-w-300 flex-col gap-6">
          <Outlet context={user} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
