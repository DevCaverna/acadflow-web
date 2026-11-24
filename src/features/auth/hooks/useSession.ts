import { useSyncExternalStore } from 'react';
import { accessToken } from '@/shared/api/access-token';

export function useSession() {
  const token = useSyncExternalStore(accessToken.subscribe, accessToken.get);
  const expired = useSyncExternalStore(accessToken.subscribe, accessToken.isExpired);
  return { token, expired };
}
