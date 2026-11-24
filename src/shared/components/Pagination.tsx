import { useTranslation } from 'react-i18next';

/** Props de {@link Pagination}. */
type PaginationProps = {
  /** Página atual, a partir de 1. */
  page: number;
  /** Itens por página. */
  perPage: number;
  /** Total de itens. */
  total: number;
  /** Chamado com a página escolhida. */
  onPageChange: (page: number) => void;
};

/** Navegação entre páginas; não aparece quando há uma só. */
export function Pagination({ page, perPage, total, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <nav aria-label={t('pagination.label')} className="flex items-center gap-4">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t('pagination.previous')}
      </button>
      <span>{t('pagination.current', { page, pages })}</span>
      <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        {t('pagination.next')}
      </button>
    </nav>
  );
}
