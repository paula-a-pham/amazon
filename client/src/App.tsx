import { Outlet } from 'react-router-dom';

export const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main>
        <Outlet />
      </main>
    </div>
  );
};
