import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthInit, useAuth } from '@/hooks/use-auth';
import { useAuthSync } from '@/hooks/use-auth-sync';
import { Spinner } from '@/components/ui/spinner';
import { ToastContainer } from '@/components/ui/toast';
import { EmailVerificationBanner } from '@/components/features/email-verification-banner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const App = () => {
  useAuthInit();
  useAuthSync();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      {isAuthenticated && user && !user.emailVerified && (
        <EmailVerificationBanner />
      )}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center bg-white">
              <Spinner size="lg" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};
