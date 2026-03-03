import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthInit, useAuth } from '@/hooks/use-auth';
import { useAuthSync } from '@/hooks/use-auth-sync';
import { Spinner } from '@/components/ui/spinner';
import { ToastContainer } from '@/components/ui/toast';
import { EmailVerificationBanner } from '@/components/features/email-verification-banner';

export const App = () => {
  useAuthInit();
  useAuthSync();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && user && !user.emailVerified && (
        <EmailVerificationBanner />
      )}
      <main>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-white">
              <Spinner size="lg" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <ToastContainer />
    </div>
  );
};
