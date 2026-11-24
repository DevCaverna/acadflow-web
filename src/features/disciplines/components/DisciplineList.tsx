import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useDisciplines } from '@/features/disciplines/hooks/useDisciplines';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { QueryState } from '@/shared/components/QueryState';

/** Props de {@link DisciplineList}. */
type DisciplineListProps = {
  /** Texto da busca. */
  search: string;
  /** Página atual. */
  page: number;
  /** Ação exibida quando não há disciplinas. */
  emptyAction?: ReactNode;
  /** Chamado com a página escolhida. */
  onPageChange: (page: number) => void;
  /** Chamado ao limpar a busca. */
  onClearSearch: () => void;
};

/** Lista paginada de disciplinas. */
export function DisciplineList({
  search,
  page,
  emptyAction,
  onPageChange,
  onClearSearch,
}: DisciplineListProps) {
  const { t } = useTranslation('disciplines');
  const query = useDisciplines({ page, filter: search ? { search } : undefined });

  return (
    <QueryState query={query}>
      {({ data, perPage, total }) => {
        if (total === 0) {
          return search ? (
            <EmptyState
              icon="search"
              title={t('noResultsTitle')}
              text={t('noResults', { search })}
              action={
                <Button variant="secondary" onClick={onClearSearch}>
                  {t('clearSearch')}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon="disciplines"
              title={t('emptyTitle')}
              text={t('empty')}
              action={emptyAction}
            />
          );
        }
        return (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">{t('count', { count: total })}</p>
            <ul
              aria-label={t('title')}
              className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5"
            >
              {data.map(({ id, code, name, semester, description, professor }) => (
                <li
                  key={id}
                  className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-field bg-primary-soft px-2 py-1 text-xs font-semibold text-link-strong">
                      {code}
                    </span>
                    <span className="text-[13px] text-muted">{semester}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-semibold wrap-anywhere">{name}</h2>
                    {description && (
                      <p className="line-clamp-3 text-sm text-muted wrap-anywhere">{description}</p>
                    )}
                  </div>
                  <p className="mt-auto border-t border-subtle pt-3.5 text-[13px] text-muted">
                    {professor.name}
                  </p>
                  <Link
                    to={`/disciplines/${id}`}
                    aria-label={`${t('open')}: ${name}`}
                    className="flex h-11 items-center justify-center rounded-button border border-field text-sm font-semibold hover:bg-canvas"
                  >
                    {t('open')}
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination page={page} perPage={perPage} total={total} onPageChange={onPageChange} />
          </div>
        );
      }}
    </QueryState>
  );
}
