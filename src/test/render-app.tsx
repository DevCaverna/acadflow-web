import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { routes } from '@/app/router/routes';
import { createQueryWrapper } from '@/test/query-wrapper';

export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />, { wrapper: createQueryWrapper().wrapper });
  return router;
}
