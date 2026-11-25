import type { UseQueryResult } from '@tanstack/react-query';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorKind, getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { QueryErrorPage } from '@/shared/components/QueryErrorPage';
import { Skeleton } from '@/shared/components/Skeleton';

/** Props de {@link QueryState}. */
type QueryStateProps<Data> = {
  /** Consulta exibida. */
  query: UseQueryResult<Data>;
  /**
   * Como exibir a falha: aviso, página no conteúdo ou tela inteira.
   * @default 'alert'
   */
  errorView?: 'alert' | 'page' | 'fullScreen';
  /**
   * Formato do carregamento.
   * @default 'card'
   */
  skeleton?: ComponentProps<typeof Skeleton>['variant'];
  /** Conteúdo quando há dados. */
  children: (data: Data) => ReactNode;
};

/** Trata carregamento e erro de uma consulta antes de exibir os dados. */
export function QueryState<Data>({
  query,
  errorView = 'alert',
  skeleton,
  children,
}: QueryStateProps<Data>) {
  const { t } = useTranslation();
  if (query.data !== undefined) return children(query.data);

  const paused = query.fetchStatus === 'paused';
  if (!paused && !query.error) return <Skeleton variant={skeleton} />;

  const kind = paused ? 'offline' : getErrorKind(query.error);
  const message = paused ? t('errors:network') : getErrorMessage(query.error);
  const retry = () => void query.refetch();

  if (kind && errorView !== 'alert') {
    return (
      <QueryErrorPage
        kind={kind}
        message={message}
        fullScreen={errorView === 'fullScreen'}
        onRetry={retry}
      />
    );
  }
  return (
    <div className="flex flex-col items-start gap-3">
      <Alert>{message}</Alert>
      <Button variant="secondary" onClick={retry}>
        {t('retry')}
      </Button>
    </div>
  );
}
