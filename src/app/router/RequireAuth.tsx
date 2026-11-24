import { Navigate } from 'react-router';
import { AppLayout } from '@/app/router/AppLayout';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useSession } from '@/features/auth/hooks/useSession';
import { QueryState } from '@/shared/components/QueryState';

/** Exige sessão; sem token, leva ao login. */
export function RequireAuth() {
  const { token } = useSession();
  const query = useCurrentUser();
  if (token === null) return <Navigate to="/login" replace />;
  return <QueryState query={query}>{(user) => <AppLayout user={user} />}</QueryState>;
}
