import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

/** Props de {@link Breadcrumb}. */
type BreadcrumbProps = {
  /** Páginas anteriores. */
  links: Array<{ to: string; label: string }>;
  /** Página atual. */
  current: string;
};

/** Trilha de navegação. */
export function Breadcrumb({ links, current }: BreadcrumbProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('breadcrumb')} className="flex flex-wrap gap-2 text-sm text-muted">
      {links.map(({ to, label }) => (
        <Fragment key={to}>
          <Link to={to} className="text-primary hover:text-primary-hover">
            {label}
          </Link>
          <span aria-hidden="true">/</span>
        </Fragment>
      ))}
      <span aria-current="page">{current}</span>
    </nav>
  );
}
