import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { accessToken } from '@/shared/api/access-token';

export function useLogout() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    accessToken.clear();
    queryClient.clear();
  }, [queryClient]);
}
