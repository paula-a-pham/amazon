import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Spinner } from '@/components/ui/spinner';
import { saveRedirectPath } from '@/hooks/use-redirect-after-login';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    saveRedirectPath(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
