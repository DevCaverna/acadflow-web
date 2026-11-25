import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/auth.service';
import { useStartSession } from '@/features/auth/hooks/useStartSession';
import type { RegistrationInput } from '@/features/auth/schemas/auth.schema';

export function useRegister() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (input: RegistrationInput) => authService.register(input),
    onSuccess: startSession,
  });
}
