import { z } from 'zod';
import { type User, userSchema } from '@/features/auth/schemas/auth.schema';
import type { ChangePasswordInput, ProfileForm } from '@/features/profile/schemas/profile.schema';
import { type ApiService, apiService } from '@/shared/api/api.service';

export class ProfileService {
  private readonly api: ApiService;
  private readonly baseUrl = '/users/me';

  constructor(api: ApiService) {
    this.api = api;
  }

  update(body: ProfileForm): Promise<User> {
    return this.api.patch({ url: this.baseUrl, schema: userSchema, body });
  }

  async changePassword(body: ChangePasswordInput): Promise<void> {
    await this.api.patch({ url: `${this.baseUrl}/password`, schema: z.unknown(), body });
  }
}

export const profileService = new ProfileService(apiService);
