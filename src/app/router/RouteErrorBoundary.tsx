import { useTranslation } from 'react-i18next';
import { Link, useRouteError } from 'react-router';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';

/** Fallback global para erros inesperados de renderização nas rotas. */
export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();
  const detail = error instanceof Error && error.message ? error.message : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-2.5 px-6 py-6 md:px-10">
        <img src="/icons/icon-simple.svg" alt="" width={36} height={36} />
        <span className="font-display text-xl font-bold tracking-tight">{t('appName')}</span>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div role="alert" className="flex max-w-xl flex-col items-center gap-5 text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger">
            <Icon name="alert" className="size-8" />
          </span>
          <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {t('routeError.label')}
          </span>
          <h1 className="font-display text-4xl font-bold">{t('routeError.title')}</h1>
          <p className="text-muted">{t('routeError.text')}</p>
          {detail && (
            <p className="max-w-full rounded-field border border-line bg-surface px-3 py-2 font-mono text-xs text-muted wrap-anywhere">
              {detail}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {t('routeError.reload')}
            </Button>
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-button bg-primary px-5 text-[15px] font-semibold text-white hover:bg-primary-hover"
            >
              {t('routeError.back')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
