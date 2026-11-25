import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';

/** Props de {@link HomeStatus}. */
type HomeStatusProps = {
  /** Falha de alguma consulta. */
  error: Error | null;
  /** Indica consulta parada por falta de conexão. */
  paused: boolean;
  /** Chamado ao tentar de novo. */
  onRetry: () => void;
};

/** Carregamento ou falha dos dados da página inicial. */
export function HomeStatus({ error, paused, onRetry }: HomeStatusProps) {
  const { t } = useTranslation();
  if (!error && !paused) return <Skeleton variant="cards" />;
  return (
    <div className="flex flex-col items-start gap-3">
      <Alert>{paused ? t('errors:network') : getErrorMessage(error)}</Alert>
      <Button variant="secondary" onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  );
}
