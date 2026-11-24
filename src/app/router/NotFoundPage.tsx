import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

/** Página para endereços inexistentes. */
export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-2.5 px-6 py-6 md:px-10">
        <img src="/icons/icon-simple.svg" alt="" width={36} height={36} />
        <span className="font-display text-xl font-bold tracking-tight">{t('appName')}</span>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="flex max-w-xl flex-col items-center gap-5 text-center">
          <div aria-hidden="true" className="relative">
            <svg width="220" height="150" viewBox="0 0 220 150" className="stroke-primary stroke-4">
              <path
                d="M20 36C56 22 90 26 110 42V134C90 118 56 114 20 128Z"
                className="fill-surface"
              />
              <path
                d="M110 42C130 26 164 22 200 36V128C164 114 130 118 110 134Z"
                className="fill-primary-soft"
              />
            </svg>
            <span className="absolute inset-x-0 top-14 font-display text-[44px] font-bold text-link">
              404
            </span>
          </div>
          <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {t('notFound.label')}
          </span>
          <h1 className="font-display text-4xl font-bold">{t('notFound.title')}</h1>
          <p className="text-muted">{t('notFound.text')}</p>
          <Link
            to="/"
            className="inline-flex h-12 items-center rounded-button bg-primary px-5.5 text-[15px] font-semibold text-white hover:bg-primary-hover"
          >
            {t('notFound.back')}
          </Link>
        </div>
      </main>
    </div>
  );
}
