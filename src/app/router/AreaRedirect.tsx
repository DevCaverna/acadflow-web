import { Navigate, useLocation } from 'react-router';
import { useAreaRoutes } from '@/features/auth/hooks/useAreaRoutes';
import { ROUTES } from '@/shared/config/routes';

/** Leva à área do papel, mantendo o endereço antigo sem prefixo. */
export function AreaRedirect() {
  const { home } = useAreaRoutes();
  const { pathname, search } = useLocation();
  const path = pathname === ROUTES.home ? '' : pathname;
  return <Navigate to={`${home}${path}${search}`} replace />;
}
