import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { getAreaRoutes } from '@/shared/config/routes';

export function useAreaRoutes() {
  return getAreaRoutes(useAuthUser().role);
}
