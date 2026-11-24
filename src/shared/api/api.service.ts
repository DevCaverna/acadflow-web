import axios, { type AxiosInstance, type InternalAxiosRequestConfig, isAxiosError } from 'axios';
import type { z } from 'zod';
import i18n from '@/i18n';
import { DEFAULT_LANGUAGE } from '@/i18n/languages';
import { accessToken } from '@/shared/api/access-token';
import { TIME } from '@/shared/config/time.constants';

export const LOGIN_PATH = '/auth/login';

type QueryParams = Record<string, string | number | undefined>;

type ReadOptions<Schema extends z.ZodType> = { url: string; schema: Schema; params?: QueryParams };

type WriteOptions<Schema extends z.ZodType> = { url: string; schema: Schema; body: object };

export class ApiService {
  private static instance: ApiService | undefined;

  private readonly http: AxiosInstance;

  private constructor() {
    this.http = axios.create({
      baseURL: window.__ACADFLOW_API_BASE_URL__ ?? import.meta.env.VITE_API_BASE_URL,
      timeout: TIME.REQUEST_TIMEOUT_MS,
    });
    this.http.interceptors.request.use((config) => this.addHeaders(config));
    this.http.interceptors.response.use(undefined, (error: unknown) => this.handleError(error));
  }

  static getInstance(): ApiService {
    ApiService.instance ??= new ApiService();
    return ApiService.instance;
  }

  async get<Schema extends z.ZodType>({
    url,
    schema,
    params,
  }: ReadOptions<Schema>): Promise<z.output<Schema>> {
    const { data } = await this.http.get<unknown>(url, { params });
    return schema.parse(data);
  }

  async post<Schema extends z.ZodType>({
    url,
    schema,
    body,
  }: WriteOptions<Schema>): Promise<z.output<Schema>> {
    const { data } = await this.http.post<unknown>(url, body);
    return schema.parse(data);
  }

  async put<Schema extends z.ZodType>({
    url,
    schema,
    body,
  }: WriteOptions<Schema>): Promise<z.output<Schema>> {
    const { data } = await this.http.put<unknown>(url, body);
    return schema.parse(data);
  }

  async patch<Schema extends z.ZodType>({
    url,
    schema,
    body,
  }: WriteOptions<Schema>): Promise<z.output<Schema>> {
    const { data } = await this.http.patch<unknown>(url, body);
    return schema.parse(data);
  }

  async upload<Schema extends z.ZodType>({
    url,
    schema,
    file,
  }: {
    url: string;
    schema: Schema;
    file: File;
  }): Promise<z.output<Schema>> {
    const body = new FormData();
    body.append('file', file);
    const { data } = await this.http.post<unknown>(url, body);
    return schema.parse(data);
  }

  async delete({ url }: { url: string }): Promise<void> {
    await this.http.delete(url);
  }

  private addHeaders(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    config.headers.set('Accept-Language', i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
    const token = accessToken.get();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  }

  private handleError(error: unknown): Promise<never> {
    if (isAxiosError(error) && error.response?.status === 401 && error.config?.url !== LOGIN_PATH) {
      accessToken.expire();
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
}

export const apiService = ApiService.getInstance();
