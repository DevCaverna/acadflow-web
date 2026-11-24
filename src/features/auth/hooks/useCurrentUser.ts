import { useQuery } from '@tanstack/react-query';
import { authKeys } from '@/features/auth/api/auth.keys';
import { authService } from '@/features/auth/api/auth.service';
import { useSession } from '@/features/auth/hooks/useSession';

export function useCurrentUser() {
  const { token } = useSession();
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.me(),
    enabled: token !== null,
  });
}
