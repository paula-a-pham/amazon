import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between rounded-lg bg-amazon p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold">Amazon<span className="text-amazon-orange">.</span></h1>
            <p className="mt-2 text-amazon-yellow">Welcome to the store</p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-amazon-yellow">Hi, {user?.name}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button size="sm" className="bg-amazon-orange text-amazon hover:bg-amazon-yellow">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </header>
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800">Getting Started</h2>
          <p className="mt-2 text-gray-600">
            The monorepo scaffold is ready. Features will be added in upcoming phases.
          </p>
        </section>
      </div>
    </Suspense>
  );
};

export default Home;
