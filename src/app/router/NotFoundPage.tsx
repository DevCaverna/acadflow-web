import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { ErrorPage } from '@/shared/components/ErrorPage';
import { ErrorPageLink } from '@/shared/components/ErrorPageLink';
import { ROUTES } from '@/shared/config/routes';
import { useLogout } from '@/shared/hooks/useLogout';

/** Página para endereços inexistentes. */
export function NotFoundPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const logout = useLogout();
  return (
    <ErrorPage
      kind="notFound"
      fullScreen
      detail={t('errorPages.path', { path: pathname })}
      actions={
        <>
          <ErrorPageLink to={ROUTES.root}>{t('errorPages.home')}</ErrorPageLink>
          <ErrorPageLink to={ROUTES.login} variant="secondary" onClick={logout}>
            {t('errorPages.login')}
          </ErrorPageLink>
        </>
      }
    />
  );
}
