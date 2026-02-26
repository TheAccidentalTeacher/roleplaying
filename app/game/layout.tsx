'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-dark-900 text-gray-100">
        {children}
      </div>
    </ErrorBoundary>
  );
}
