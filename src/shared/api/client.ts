import axios from 'axios';
import i18n from '@/i18n';
import { DEFAULT_LANGUAGE } from '@/i18n/languages';
import { accessToken } from '@/shared/api/access-token';

export const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
  const token = accessToken.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});
