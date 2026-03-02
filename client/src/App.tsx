import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthInit } from '@/hooks/use-auth';

export const App = () => {
  useAuthInit();

  return (
    <div className="min-h-screen bg-gray-100">
      <main>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};
