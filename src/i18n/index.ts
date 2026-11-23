import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en/common.json';
import ptBR from '@/i18n/locales/pt-BR/common.json';

void i18n.use(initReactI18next).init({
  resources: { 'pt-BR': { common: ptBR }, en: { common: en } },
  lng: import.meta.env.VITE_DEFAULT_LOCALE || 'pt-BR',
  fallbackLng: 'pt-BR',
  supportedLngs: ['pt-BR', 'en'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
