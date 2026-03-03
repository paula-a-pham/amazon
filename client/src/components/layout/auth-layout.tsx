import type { ReactNode } from 'react';
import { AmazonLogo } from '@/components/ui/amazon-logo';
import { BackButton } from '@/components/features/back-button';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  backPath?: string;
};

export const AuthLayout = ({ title, subtitle, children, footer, backPath }: AuthLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-gray-50">
    {/* Gradient accent bar */}
    <div className="h-1 bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-yellow" />
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="page-transition w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <AmazonLogo />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-8">
          {backPath && (
            <div className="mb-4">
              <BackButton fallbackPath={backPath} />
            </div>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          {children}
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
        )}
      </div>
    </div>
  </div>
);
