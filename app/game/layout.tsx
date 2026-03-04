'use client';

import { usePathname } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSheet = pathname?.startsWith('/game/sheet');

  return (
    <ErrorBoundary>
      {isSheet ? (
        // Sheet page needs to scroll freely — no height/overflow constraints
        <div className="min-h-screen w-full bg-slate-950 text-slate-100">
          {children}
        </div>
      ) : (
        // Game page uses fixed viewport with no overflow
        <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
          {children}
        </div>
      )}
    </ErrorBoundary>
  );
}
