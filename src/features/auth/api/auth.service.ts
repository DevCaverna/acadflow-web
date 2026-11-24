import {
  type LoginInput,
  type Session,
  sessionSchema,
  type User,
  userSchema,
} from '@/features/auth/schemas/auth.schema';
import { apiClient } from '@/shared/api/client';

export const authService = {
  async login(input: LoginInput): Promise<Session> {
    const { data } = await apiClient.post<unknown>('/auth/login', input);
    return sessionSchema.parse(data);
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<unknown>('/auth/me');
    return userSchema.parse(data);
  },
};
