import axios from 'axios';
import i18n from '@/i18n';

export const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  config.headers.set('Accept-Language', i18n.language);
  return config;
});
