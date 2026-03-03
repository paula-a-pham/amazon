import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { GuestRoute } from '@/components/features/guest-route';
import { lazy } from 'react';

const Home = lazy(() => import('@/pages/home'));
const Login = lazy(() => import('@/pages/login'));
const Register = lazy(() => import('@/pages/register'));
const ForgotPassword = lazy(() => import('@/pages/forgot-password'));
const ResetPassword = lazy(() => import('@/pages/reset-password'));
const VerifyEmail = lazy(() => import('@/pages/verify-email'));

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
        path: 'verify-email',
        element: <VerifyEmail />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
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
