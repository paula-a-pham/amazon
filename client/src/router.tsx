import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { GuestRoute } from '@/components/features/guest-route';
import { lazy } from 'react';

const Home = lazy(() => import('@/pages/home'));
const Login = lazy(() => import('@/pages/login'));
const Register = lazy(() => import('@/pages/register'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
        ],
      },
    ],
  },
]);
