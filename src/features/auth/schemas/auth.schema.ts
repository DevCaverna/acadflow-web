import { z } from 'zod';

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['PROFESSOR', 'ALUNO']),
});

export const sessionSchema = z.object({ accessToken: z.string().min(1), user: userSchema });

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export const loginFormSchema = z.object({
  email: z.string().trim().pipe(z.email('errors:validation.email')),
  password: z.string().min(1, 'errors:validation.required').max(72, 'errors:validation.tooLong'),
});

export type LoginInput = z.infer<typeof loginFormSchema>;
