import { Suspense } from 'react';

const Home = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 rounded-lg bg-amazon p-6 text-white">
          <h1 className="text-3xl font-bold">Amazon Clone</h1>
          <p className="mt-2 text-amazon-yellow">Welcome to the store</p>
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
