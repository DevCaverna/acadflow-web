import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

const STYLES = {
  notFound: { code: '404', stroke: 'stroke-primary', fill: 'fill-primary-soft', text: 'text-link' },
  forbidden: {
    code: '403',
    stroke: 'stroke-warning',
    fill: 'fill-warning-soft',
    text: 'text-warning',
  },
  server: { code: '500', stroke: 'stroke-danger', fill: 'fill-danger-soft', text: 'text-danger' },
  offline: { code: 'off', stroke: 'stroke-muted', fill: 'fill-skeleton', text: 'text-muted' },
  unexpected: { code: '!', stroke: 'stroke-danger', fill: 'fill-danger-soft', text: 'text-danger' },
};

/** Props de {@link ErrorPage}. */
type ErrorPageProps = {
  /** Tipo de erro, que define cores e textos. */
  kind: keyof typeof STYLES;
  /** Detalhe técnico do erro. */
  detail?: string | null;
  /** Ações oferecidas. */
  actions: ReactNode;
  /**
   * Ocupa a tela inteira, com a marca no topo.
   * @default false
   */
  fullScreen?: boolean;
};

/** Página de erro ilustrada. */
export function ErrorPage({ kind, detail, actions, fullScreen = false }: ErrorPageProps) {
  const { t } = useTranslation();
  const { code, stroke, fill, text } = STYLES[kind];
  const content = (
    <div
      role={kind === 'notFound' ? undefined : 'alert'}
      className="flex max-w-xl flex-col items-center gap-5 text-center"
    >
      <div aria-hidden="true" className="relative">
        <svg
          width="220"
          height="150"
          viewBox="0 0 220 150"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('stroke-4', stroke)}
        >
          <path d="M20 36C56 22 90 26 110 42V134C90 118 56 114 20 128Z" className="fill-surface" />
          <path d="M110 42C130 26 164 22 200 36V128C164 114 130 118 110 134Z" className={fill} />
        </svg>
        <span className={cn('absolute inset-x-0 top-14 font-display text-[44px] font-bold', text)}>
          {code}
        </span>
      </div>
      <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
        {t(`errorPages.${kind}.label`)}
      </span>
      <h1 className="font-display text-4xl font-bold">{t(`errorPages.${kind}.title`)}</h1>
      <p className="text-muted">{t(`errorPages.${kind}.text`)}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div>
      {detail && <p className="max-w-full font-mono text-xs text-muted wrap-anywhere">{detail}</p>}
    </div>
  );

  if (!fullScreen) return <div className="flex justify-center py-10">{content}</div>;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-2.5 px-6 py-6 md:px-10">
        <img src="/icons/icon-simple.svg" alt="" width={36} height={36} />
        <span className="font-display text-xl font-bold tracking-tight">{t('appName')}</span>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">{content}</main>
    </div>
  );
}
