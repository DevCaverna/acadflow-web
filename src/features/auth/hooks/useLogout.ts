import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { accessToken } from '@/shared/api/access-token';
import { toastStore } from '@/shared/lib/toast';

export function useLogout() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    accessToken.clear();
    toastStore.clear();
    queryClient.clear();
  }, [queryClient]);
}
