import {
  type LoginInput,
  type RegistrationInput,
  type Session,
  sessionSchema,
  type User,
  userSchema,
} from '@/features/auth/schemas/auth.schema';
import { type ApiService, apiService, LOGIN_PATH } from '@/shared/api/api.service';

export class AuthService {
  private readonly api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  login(body: LoginInput): Promise<Session> {
    return this.api.post({ url: LOGIN_PATH, schema: sessionSchema, body });
  }

  register(body: RegistrationInput): Promise<Session> {
    return this.api.post({ url: '/auth/register', schema: sessionSchema, body });
  }

  me(): Promise<User> {
    return this.api.get({ url: '/auth/me', schema: userSchema });
  }
}

export const authService = new AuthService(apiService);
