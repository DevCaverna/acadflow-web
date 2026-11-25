import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/auth.service';
import { useStartSession } from '@/features/auth/hooks/useStartSession';
import type { LoginInput } from '@/features/auth/schemas/auth.schema';

export function useLogin() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: startSession,
  });
}
