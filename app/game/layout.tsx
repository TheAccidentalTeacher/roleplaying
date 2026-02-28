'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        {children}
      </div>
    </ErrorBoundary>
  );
}
