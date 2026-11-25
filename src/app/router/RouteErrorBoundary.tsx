import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';
import { Button } from '@/shared/components/Button';
import { ErrorPage } from '@/shared/components/ErrorPage';
import { ErrorPageLink } from '@/shared/components/ErrorPageLink';

function reload() {
  window.location.reload();
}

/** Fallback global para erros inesperados de renderização nas rotas. */
export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();
  const [offline] = useState(() => !navigator.onLine);
  const detail = error instanceof Error && error.message ? error.message : null;

  useEffect(() => {
    if (!offline) return undefined;
    window.addEventListener('online', reload);
    return () => window.removeEventListener('online', reload);
  }, [offline]);

  return (
    <ErrorPage
      kind={offline ? 'offline' : 'unexpected'}
      fullScreen
      detail={offline ? null : detail}
      actions={
        <>
          <Button className="h-12 px-5.5" onClick={reload}>
            {t(offline ? 'errorPages.reconnect' : 'errorPages.reload')}
          </Button>
          <ErrorPageLink to="/" variant="secondary">
            {t('errorPages.home')}
          </ErrorPageLink>
        </>
      }
    />
  );
}
