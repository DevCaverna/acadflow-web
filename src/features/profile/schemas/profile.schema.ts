import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;

const hasValidSize = (value: string) =>
  new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES;

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'errors:validation.required')
    .max(120, 'errors:validation.tooLong'),
  email: z
    .string()
    .trim()
    .max(255, 'errors:validation.tooLong')
    .pipe(z.email('errors:validation.email')),
});

export const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'errors:validation.required')
      .refine(hasValidSize, 'errors:validation.tooLong'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, 'profile:passwordTooShort')
      .refine(hasValidSize, 'errors:validation.tooLong'),
    confirmation: z.string(),
  })
  .refine(({ newPassword, confirmation }) => newPassword === confirmation, {
    path: ['confirmation'],
    message: 'profile:passwordMismatch',
  });

export type ProfileForm = z.infer<typeof profileFormSchema>;
export type PasswordForm = z.infer<typeof passwordFormSchema>;
export type ChangePasswordInput = { currentPassword: string; newPassword: string };
