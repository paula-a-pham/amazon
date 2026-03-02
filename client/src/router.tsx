import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { lazy } from 'react';

const Home = lazy(() => import('@/pages/home'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);
