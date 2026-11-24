import { useOutletContext } from 'react-router';
import type { User } from '@/features/auth/schemas/auth.schema';

export function useAuthUser(): User {
  return useOutletContext<User>();
}
