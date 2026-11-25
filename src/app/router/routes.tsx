import { lazy, type ReactNode, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import { RequireAuth } from '@/app/router/RequireAuth';
import { RouteErrorBoundary } from '@/app/router/RouteErrorBoundary';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { Skeleton } from '@/shared/components/Skeleton';

const DisciplinesPage = lazy(() =>
  import('@/features/disciplines/pages/DisciplinesPage').then((m) => ({
    default: m.DisciplinesPage,
  })),
);
const DisciplinePage = lazy(() =>
  import('@/features/disciplines/pages/DisciplinePage').then((m) => ({
    default: m.DisciplinePage,
  })),
);
const GradesPage = lazy(() =>
  import('@/features/grades/pages/GradesPage').then((m) => ({ default: m.GradesPage })),
);
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<Skeleton />}>{node}</Suspense>;
}

export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <Navigate to="/disciplines" replace /> },
          { path: '/disciplines', element: withSuspense(<DisciplinesPage />) },
          { path: '/disciplines/:disciplineId', element: withSuspense(<DisciplinePage />) },
          { path: '/grades', element: withSuspense(<GradesPage />) },
          { path: '/profile', element: withSuspense(<ProfilePage />) },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
