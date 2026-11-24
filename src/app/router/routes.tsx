import { Navigate, type RouteObject } from 'react-router';
import { NotFoundPage } from '@/app/router/NotFoundPage';
import { RequireAuth } from '@/app/router/RequireAuth';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DisciplinePage } from '@/features/disciplines/pages/DisciplinePage';
import { DisciplinesPage } from '@/features/disciplines/pages/DisciplinesPage';
import { GradesPage } from '@/features/grades/pages/GradesPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <Navigate to="/disciplines" replace /> },
      { path: '/disciplines', element: <DisciplinesPage /> },
      { path: '/disciplines/:disciplineId', element: <DisciplinePage /> },
      { path: '/grades', element: <GradesPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
