import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { Button } from '@/shared/components/Button';
import { ErrorPage } from '@/shared/components/ErrorPage';
import { ErrorPageLink } from '@/shared/components/ErrorPageLink';
import { type AreaRole, ROUTES } from '@/shared/config/routes';
import { useLogout } from '@/shared/hooks/useLogout';

/** Props de {@link RequireRole}. */
type RequireRoleProps = {
  /** Papel que pode abrir as rotas. */
  role: AreaRole;
};

/** Exige um papel; para os demais, mostra o erro 403. */
export function RequireRole({ role }: RequireRoleProps) {
  const { t } = useTranslation();
  const user = useAuthUser();
  const logout = useLogout();
  if (user.role === role) return <Outlet context={user} />;
  return (
    <ErrorPage
      kind="forbidden"
      detail={t('errorPages.roleDetail', {
        required: t(`roles.${role}`),
        current: t(`roles.${user.role}`),
      })}
      actions={
        <>
          <ErrorPageLink to={ROUTES.root}>{t('errorPages.home')}</ErrorPageLink>
          <Button variant="secondary" className="h-12 px-5.5" onClick={logout}>
            {t('errorPages.otherAccount')}
          </Button>
        </>
      }
    />
  );
}
