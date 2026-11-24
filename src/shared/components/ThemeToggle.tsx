import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/shared/components/IconButton';
import { themeStore } from '@/shared/lib/theme';

/** Alterna entre tema claro e escuro; a escolha é mantida ao recarregar a página. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.get);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      icon={next === 'dark' ? 'moon' : 'sun'}
      label={t(`theme.${next}`)}
      onClick={() => themeStore.set(next)}
    />
  );
}
