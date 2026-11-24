import {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { apiService } from '@/shared/api/api.service';

type MockReply = { status?: number; data: unknown };

export function mockApi(handler: (config: InternalAxiosRequestConfig) => MockReply) {
  const requests: InternalAxiosRequestConfig[] = [];
  const { http } = apiService as unknown as { http: AxiosInstance };
  http.defaults.adapter = (config) => {
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
