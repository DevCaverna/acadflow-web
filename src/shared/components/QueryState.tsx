import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';

/** Props de {@link QueryState}. */
type QueryStateProps<Data> = {
  /** Consulta exibida. */
  query: UseQueryResult<Data>;
  /** Conteúdo quando há dados. */
  children: (data: Data) => ReactNode;
};

/** Trata carregamento e erro de uma consulta antes de exibir os dados. */
export function QueryState<Data>({ query, children }: QueryStateProps<Data>) {
  const { t } = useTranslation();
  if (query.data !== undefined) return children(query.data);
  if (query.error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert>{getErrorMessage(query.error)}</Alert>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }
  return <Skeleton />;
}
