import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisciplines } from '@/features/disciplines/hooks/useDisciplines';
import { getErrorMessage } from '@/shared/api/api-error';
import { Pagination } from '@/shared/components/Pagination';

/** Lista paginada de disciplinas com estados de carregamento, erro e vazio. */
export function DisciplineList() {
  const { t } = useTranslation(['disciplines', 'common']);
  const [page, setPage] = useState(1);
  const { data, error, isPending, refetch } = useDisciplines({ page });

  if (isPending) return <p role="status">{t('common:loading')}</p>;
  if (error) {
    return (
      <div role="alert">
        <p className="text-danger">{getErrorMessage(error)}</p>
        <button type="button" className="text-primary" onClick={() => void refetch()}>
          {t('common:retry')}
        </button>
      </div>
    );
  }
  if (data.total === 0) return <p>{t('disciplines:empty')}</p>;
  return (
    <div className="grid gap-4">
      <ul aria-label={t('disciplines:title')} className="grid gap-4">
        {data.data.map(({ id, code, name, semester, professor }) => (
          <li key={id} className="rounded-card border border-line bg-white p-4">
            <h2 className="font-display font-bold">{name}</h2>
            <p className="text-sm text-muted">
              {code} · {semester} · {professor.name}
            </p>
          </li>
        ))}
      </ul>
      <Pagination page={page} perPage={data.perPage} total={data.total} onPageChange={setPage} />
    </div>
  );
}
