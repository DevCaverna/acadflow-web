import { z } from 'zod';

const roleSchema = z.enum(['PROFESSOR', 'ALUNO'], 'auth:register.chooseRole');

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
  avatarUrl: z.string().nullable(),
});

export const sessionSchema = z.object({ accessToken: z.string().min(1), user: userSchema });

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export const loginFormSchema = z.object({
  email: z.string().trim().pipe(z.email('errors:validation.email')),
  password: z.string().min(1, 'errors:validation.required').max(72, 'errors:validation.tooLong'),
});

export type LoginInput = z.infer<typeof loginFormSchema>;

export const registrationFormSchema = z
  .object({
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
    password: z
      .string()
      .refine((value) => Array.from(value).length >= 8, 'auth:register.passwordMinimum')
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        'auth:register.passwordMaximum',
      ),
    confirmPassword: z.string().min(1, 'errors:validation.required'),
    role: roleSchema,
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth:register.passwordMismatch',
  });

export type RegistrationForm = z.infer<typeof registrationFormSchema>;
export type RegistrationInput = Omit<RegistrationForm, 'confirmPassword'>;
