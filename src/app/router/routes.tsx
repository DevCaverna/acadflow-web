import type { RouteObject } from 'react-router';
import { AreaRedirect } from '@/app/router/AreaRedirect';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import { RequireAuth } from '@/app/router/RequireAuth';
import { RequireRole } from '@/app/router/RequireRole';
import { RouteErrorBoundary } from '@/app/router/RouteErrorBoundary';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { Skeleton } from '@/shared/components/Skeleton';
import { type AreaRole, getAreaRoutes, ROUTES } from '@/shared/config/routes';

function createAreaRoute(role: AreaRole): RouteObject {
  const area = getAreaRoutes(role);
  return {
    element: <RequireRole role={role} />,
    children: [
      {
        path: area.home,
        lazy: async () => ({
          Component: (await import('@/features/home/pages/HomePage')).HomePage,
        }),
      },
      {
        path: area.disciplines,
        lazy: async () => ({
          Component: (await import('@/features/disciplines/pages/DisciplinesPage')).DisciplinesPage,
        }),
      },
      {
        path: area.discipline(':disciplineId'),
        lazy: async () => ({
          Component: (await import('@/features/disciplines/pages/DisciplinePage')).DisciplinePage,
        }),
      },
      {
        path: area.grades,
        lazy: async () => ({
          Component: (await import('@/features/grades/pages/GradesPage')).GradesPage,
        }),
      },
    ],
  };
}

export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorBoundary />,
    hydrateFallbackElement: <Skeleton />,
    children: [
      {
        path: ROUTES.root,
        lazy: async () => ({ Component: (await import('@/app/router/RootPage')).RootPage }),
      },
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: ROUTES.home, element: <AreaRedirect /> },
          createAreaRoute('PROFESSOR'),
          createAreaRoute('ALUNO'),
          {
            path: ROUTES.profile,
            lazy: async () => ({
              Component: (await import('@/features/profile/pages/ProfilePage')).ProfilePage,
            }),
          },
          { path: '/disciplines', element: <AreaRedirect /> },
          { path: '/disciplines/:disciplineId', element: <AreaRedirect /> },
          { path: '/grades', element: <AreaRedirect /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
