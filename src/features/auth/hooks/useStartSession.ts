import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/features/auth/api/auth.keys';
import type { Session } from '@/features/auth/schemas/auth.schema';
import { accessToken } from '@/shared/api/access-token';

export function useStartSession() {
  const queryClient = useQueryClient();
  return (session: Session) => {
    queryClient.clear();
    queryClient.setQueryData(authKeys.me, session.user);
    accessToken.set(session.accessToken);
  };
}
