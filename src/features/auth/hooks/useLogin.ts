import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/features/auth/api/auth.keys';
import { authService } from '@/features/auth/api/auth.service';
import type { LoginInput } from '@/features/auth/schemas/auth.schema';
import { accessToken } from '@/shared/api/access-token';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (session) => {
      accessToken.set(session.accessToken);
      queryClient.clear();
      queryClient.setQueryData(authKeys.me, session.user);
    },
  });
}
