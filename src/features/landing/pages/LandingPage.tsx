import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Icon } from '@/shared/components/Icon';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { formatGrade } from '@/shared/lib/format';

const AUDIENCES = [
  {
    key: 'professors',
    label: 'text-link',
    icon: 'bg-primary-soft text-link',
    features: [
      { key: 'classes', icon: 'disciplines' },
      { key: 'activities', icon: 'activities' },
      { key: 'grades', icon: 'grades' },
    ],
  },
  {
    key: 'students',
    label: 'text-warning',
    icon: 'bg-warning-soft text-warning',
    features: [
      { key: 'disciplines', icon: 'home' },
      { key: 'average', icon: 'clock' },
      { key: 'deadlines', icon: 'calendar' },
    ],
  },
] as const;

const STEPS = ['account', 'create', 'grade', 'follow'] as const;
const PREVIEW = [
  { name: 'Ana Souza', grades: [7, 5.5, 6] },
  { name: 'Bruno Lima', grades: [8.5, 7.5, 8.3] },
  { name: 'Carla Mendes', grades: [9.5, 8.5, 9] },
];
const PREVIEW_AVERAGE = 6.2;

const PRIMARY = 'bg-primary text-white hover:bg-primary-hover';
const SECONDARY = 'border border-field bg-surface text-ink hover:bg-canvas';
const BUTTON = 'inline-flex h-12 items-center rounded-button px-5.5 text-[15px] font-semibold';

/** Página pública do produto, para quem não entrou. */
export function LandingPage() {
  const { t, i18n } = useTranslation(['landing', 'auth', 'common']);
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to={ROUTES.root} className="flex items-center gap-2.5">
            <img src="/icons/icon-simple.svg" alt="" width={36} height={36} />
            <span className="font-display text-xl font-bold tracking-tight">
              {t('common:appName')}
            </span>
          </Link>
          <nav aria-label={t('nav')} className="flex flex-wrap items-center gap-2">
            {AUDIENCES.map(({ key }) => (
              <a key={key} href={`#${key}`} className="px-3 py-2.5 text-[15px] text-muted">
                {t(`${key}.short`)}
              </a>
            ))}
            <LanguageSelector />
            <ThemeToggle />
            <Link to={ROUTES.login} className={cn(BUTTON, SECONDARY)}>
              {t('auth:signIn')}
            </Link>
            <Link to={ROUTES.register} className={cn(BUTTON, PRIMARY)}>
              {t('auth:register.title')}
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="bg-canvas">
          <div className="mx-auto flex max-w-300 flex-wrap items-center gap-14 px-6 py-12 md:py-18">
            <div className="flex min-w-0 flex-1 basis-80 flex-col gap-6">
              <span className="self-start rounded-full bg-warning-soft px-3 py-1 text-[13px] font-semibold text-warning">
                {t('badge')}
              </span>
              <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight md:text-[56px]">
                {t('common:tagline')}
              </h1>
              <p className="max-w-130 text-lg text-muted">{t('intro')}</p>
              <div className="flex flex-wrap gap-3">
                <Link to={ROUTES.login} className={cn(BUTTON, PRIMARY)}>
                  {t('enter')}
                </Link>
                <Link to={ROUTES.register} className={cn(BUTTON, SECONDARY)}>
                  {t('auth:register.title')}
                </Link>
              </div>
            </div>
            <div aria-hidden="true" className="flex min-w-0 flex-1 basis-80 flex-col">
              <div className="flex flex-col gap-3.5 rounded-panel border border-line bg-surface p-5 shadow-xl sm:mr-16">
                <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                  {t('preview.title')}
                </span>
                {PREVIEW.map(({ name, grades }) => (
                  <span key={name} className="flex items-center justify-between gap-3 text-sm">
                    <b>{name}</b>
                    <span className="flex gap-1.5">
                      {grades.map((grade) => (
                        <span
                          key={grade}
                          className="inline-flex h-8 w-11 items-center justify-center rounded-field border border-field font-semibold"
                        >
                          {formatGrade(grade, i18n.language)}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </div>
              <div className="-mt-3 flex w-65 max-w-full flex-col gap-2 self-end rounded-panel bg-primary p-5 text-white shadow-xl">
                <span className="text-xs font-semibold tracking-[0.08em] uppercase">
                  {t('preview.student')}
                </span>
                <span className="font-display text-[44px] leading-none font-bold">
                  {formatGrade(PREVIEW_AVERAGE, i18n.language)}
                </span>
                <span className="self-start rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
                  {t('preview.status')}
                </span>
                <span className="text-[13px] text-white/85">{t('preview.progress')}</span>
              </div>
            </div>
          </div>
        </section>
        {AUDIENCES.map(({ key, label, icon, features }) => (
          <section
            key={key}
            id={key}
            className="mx-auto flex max-w-300 flex-col gap-7 px-6 py-10 md:py-14"
          >
            <div className="flex flex-col gap-2">
              <span className={cn('text-xs font-bold tracking-[0.08em] uppercase', label)}>
                {t(`${key}.label`)}
              </span>
              <h2 className="font-display text-3xl font-bold md:text-4xl">{t(`${key}.title`)}</h2>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-5">
              {features.map((feature) => (
                <li
                  key={feature.key}
                  className="flex flex-col gap-3 rounded-panel border border-line p-6"
                >
                  <span
                    className={cn(
                      'inline-flex size-11 items-center justify-center rounded-xl',
                      icon,
                    )}
                  >
                    <Icon name={feature.icon} className="size-5.5" />
                  </span>
                  <h3 className="text-lg font-semibold">{t(`features.${feature.key}.title`)}</h3>
                  <p className="text-[15px] text-muted">{t(`features.${feature.key}.text`)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section id="how" className="bg-inverse text-white">
          <div className="mx-auto flex max-w-300 flex-col gap-8 px-6 py-16">
            <h2 className="font-display text-[32px] font-bold">{t('how')}</h2>
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-6">
              {STEPS.map((step, index) => (
                <li key={step} className="flex flex-col gap-2 border-t-2 border-accent pt-4">
                  <span className="font-display text-sm font-bold text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[17px] font-semibold">{t(`steps.${step}.title`)}</span>
                  <span className="text-sm text-white/80">{t(`steps.${step}.text`)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex max-w-300 flex-wrap justify-between gap-3 px-6 py-8 text-[13px] text-muted">
          <span>{t('footer')}</span>
          <span>{t('security')}</span>
        </div>
      </footer>
    </div>
  );
}
