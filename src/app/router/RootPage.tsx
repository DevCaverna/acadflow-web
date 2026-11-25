import { Navigate } from 'react-router';
import { useSession } from '@/features/auth/hooks/useSession';
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { ROUTES } from '@/shared/config/routes';

/** Página pública ou, com sessão, a área do papel. */
export function RootPage() {
  const { token } = useSession();
  return token === null ? <LandingPage /> : <Navigate to={ROUTES.home} replace />;
}
