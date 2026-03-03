import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Spinner } from '@/components/ui/spinner';
import { useRedirectAfterLogin } from '@/hooks/use-redirect-after-login';

export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { redirectPath } = useRedirectAfterLogin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
