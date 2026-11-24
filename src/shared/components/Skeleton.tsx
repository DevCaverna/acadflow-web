import { useTranslation } from 'react-i18next';

/** Espaço reservado enquanto os dados carregam. */
export function Skeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" className="rounded-card border border-line bg-surface p-6">
      <span className="sr-only">{t('loading')}</span>
      <div aria-hidden="true" className="flex animate-pulse flex-col gap-3">
        <div className="h-4 w-3/5 rounded-field bg-skeleton" />
        <div className="h-3 w-11/12 rounded-field bg-skeleton" />
        <div className="h-3 w-2/5 rounded-field bg-skeleton" />
      </div>
    </div>
  );
}
