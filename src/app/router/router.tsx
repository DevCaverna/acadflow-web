import { createBrowserRouter } from 'react-router';
import { HomePage } from '@/app/router/HomePage';

export const router = createBrowserRouter([{ path: '/', element: <HomePage /> }]);
