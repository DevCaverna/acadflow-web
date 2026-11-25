import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import type { ErrorKind } from '@/shared/api/api-error';
import { Button } from '@/shared/components/Button';
import { ErrorPage } from '@/shared/components/ErrorPage';
import { ErrorPageLink } from '@/shared/components/ErrorPageLink';
import { useLogout } from '@/shared/hooks/useLogout';

/** Props de {@link QueryErrorPage}. */
type QueryErrorPageProps = {
  /** Tipo de falha da consulta. */
  kind: ErrorKind;
  /** Mensagem da falha. */
  message: string;
  /** Ocupa a tela inteira. */
  fullScreen: boolean;
  /** Chamado ao tentar de novo. */
  onRetry: () => void;
};

/** Página de erro de uma consulta, com as ações de cada tipo de falha. */
export function QueryErrorPage({ kind, message, fullScreen, onRetry }: QueryErrorPageProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const logout = useLogout();
  const canRetry = kind === 'server' || kind === 'offline';
  const details: Record<ErrorKind, string | null> = {
    notFound: t('errorPages.path', { path: pathname }),
    forbidden: message,
    server: message,
    offline: null,
  };
  return (
    <ErrorPage
      kind={kind}
      fullScreen={fullScreen}
      detail={details[kind]}
      actions={
        <>
          {canRetry ? (
            <Button className="h-12 px-5.5" onClick={onRetry}>
              {t(kind === 'offline' ? 'errorPages.reconnect' : 'retry')}
            </Button>
          ) : (
            <ErrorPageLink to="/">{t('errorPages.home')}</ErrorPageLink>
          )}
          <Button variant="secondary" className="h-12 px-5.5" onClick={logout}>
            {t(kind === 'forbidden' ? 'errorPages.otherAccount' : 'errorPages.login')}
          </Button>
        </>
      }
    />
  );
}
