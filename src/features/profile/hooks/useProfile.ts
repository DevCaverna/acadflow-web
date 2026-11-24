import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/features/auth/api/auth.keys';
import { profileService } from '@/features/profile/api/profile.service';
import type { ChangePasswordInput, ProfileForm } from '@/features/profile/schemas/profile.schema';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileForm) => profileService.update(input),
    onSuccess: async (user) => {
      await queryClient.cancelQueries({ queryKey: authKeys.me });
      queryClient.setQueryData(authKeys.me, user);
      void queryClient.invalidateQueries({ queryKey: ['disciplines'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => profileService.changePassword(input),
  });
}
