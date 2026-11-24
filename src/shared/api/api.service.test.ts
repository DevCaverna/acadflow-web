import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { accessToken } from '@/shared/api/access-token';
import { ApiService, apiService, LOGIN_PATH } from '@/shared/api/api.service';
import { mockApi } from '@/test/mock-api';

const schema = z.object({ id: z.number() });

describe('ApiService', () => {
  afterEach(() => accessToken.clear());

  it('always returns the same instance', () => {
    expect(ApiService.getInstance()).toBe(ApiService.getInstance());
    expect(ApiService.getInstance()).toBe(apiService);
  });

  it('returns the validated data and drops unknown fields', async () => {
    const requests = mockApi(() => ({ data: { id: 1, extra: true } }));
    expect(await apiService.get({ url: '/x', schema, params: { page: 2 } })).toEqual({ id: 1 });
    expect(requests[0]?.params).toEqual({ page: 2 });
  });

  it('rejects responses that break the contract', async () => {
    mockApi(() => ({ data: { id: 'x' } }));
    await expect(apiService.get({ url: '/x', schema })).rejects.toThrow(z.ZodError);
  });

  it.each(['post', 'put', 'patch'] as const)('sends the body with %s', async (method) => {
    const requests = mockApi(() => ({ data: { id: 1 } }));
    await apiService[method]({ url: '/x', schema, body: { name: 'a' } });
    expect(requests[0]?.method).toBe(method);
    expect(JSON.parse(requests[0]?.data as string)).toEqual({ name: 'a' });
  });

  it('expires the session on 401, except on login', async () => {
    mockApi(() => ({ status: 401, data: {} }));
    accessToken.set('token');
    await expect(apiService.post({ url: LOGIN_PATH, schema, body: {} })).rejects.toThrow();
    expect(accessToken.get()).toBe('token');
    await expect(apiService.delete({ url: '/x' })).rejects.toThrow();
    expect(accessToken.get()).toBeNull();
    expect(accessToken.isExpired()).toBe(true);
  });
});
