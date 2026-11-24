import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/shared/api/client';

type MockReply = { status?: number; data: unknown };

export function mockApi(handler: (config: InternalAxiosRequestConfig) => MockReply) {
  const requests: InternalAxiosRequestConfig[] = [];
  apiClient.defaults.adapter = (config) => {
    requests.push(config);
    const { status = 200, data } = handler(config);
    const response = { data, status, statusText: '', headers: new AxiosHeaders(), config };
    if (status < 400) return Promise.resolve(response);
    return Promise.reject(
      new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, {}, response),
    );
  };
  return requests;
}
