import { useQuery } from '@tanstack/react-query';
import { authKeys } from '@/features/auth/api/auth.keys';
import { authService } from '@/features/auth/api/auth.service';
import { accessToken } from '@/shared/api/access-token';

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.me(),
    enabled: accessToken.get() !== null,
  });
}
