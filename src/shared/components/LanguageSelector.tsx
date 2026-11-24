import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n/languages';
import { cn } from '@/shared/lib/cn';

/** Props de {@link LanguageSelector}. */
type LanguageSelectorProps = {
  /** Classes adicionais do seletor. */
  className?: string;
};

/** Seletor de idioma; a escolha é mantida ao recarregar a página. */
export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  return (
    <select
      aria-label={t('language')}
      className={cn('rounded-field border border-line bg-white px-3 py-2 text-sm', className)}
      value={i18n.resolvedLanguage}
      onChange={(event) => void i18n.changeLanguage(event.target.value)}
    >
      {LANGUAGES.map((language) => (
        <option key={language} value={language} lang={language}>
          {t(`languages.${language}`)}
        </option>
      ))}
    </select>
  );
}
