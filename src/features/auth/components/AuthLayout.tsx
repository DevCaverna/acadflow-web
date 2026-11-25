import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components/Icon';

const FEATURES = ['disciplines', 'grades', 'access'] as const;

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation(['auth', 'common']);
  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <section className="flex flex-1 flex-col justify-between gap-8 bg-primary p-6 text-white md:gap-12 md:p-14">
        <span className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
          <img src="/icons/icon-light.svg" alt="" width={48} height={48} />
          {t('common:appName')}
        </span>
        <div className="flex max-w-130 flex-col gap-5">
          <p className="font-display text-3xl leading-[1.08] font-bold tracking-tight md:text-5xl">
            {t('headline')}
          </p>
          <p className="text-white/85 md:text-[17px]">{t('intro')}</p>
        </div>
        <ul className="flex flex-col gap-3.5 max-md:hidden">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-[15px]">
              <Icon name="check" className="text-accent" />
              {t(`features.${feature}`)}
            </li>
          ))}
        </ul>
      </section>
      <main className="flex flex-1 items-center justify-center px-6 py-10 md:py-14">
        {children}
      </main>
    </div>
  );
}
