import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/shared/components/LanguageSelector';

/** Página inicial provisória, até a tela de login. */
export function HomePage() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <img src="/icons/icon.svg" alt="" width={96} height={96} />
      <h1 className="font-display text-4xl font-bold">{t('appName')}</h1>
      <p className="text-muted">{t('tagline')}</p>
      <LanguageSelector />
    </main>
  );
}
