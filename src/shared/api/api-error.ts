import { isAxiosError } from 'axios';
import { z } from 'zod';
import i18n from '@/i18n';

const apiErrorSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export function getApiError(error: unknown): ApiError | undefined {
  if (!isAxiosError(error)) return undefined;
  return apiErrorSchema.safeParse(error.response?.data).data;
}

export function getErrorMessage(error: unknown): string {
  const apiError = getApiError(error);
  if (apiError) return apiError.message;
  if (isAxiosError(error) && !error.response) return i18n.t('errors:network');
  return i18n.t('errors:unexpected');
}
