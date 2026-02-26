'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚡</p>
        <h1 className="font-cinzel text-3xl text-red-400 mb-3">
          A Rift in Reality
        </h1>
        <p className="text-dark-300 mb-4">
          Something has gone terribly wrong. The fabric of the world has torn,
          but fear not — it can be mended.
        </p>
        <p className="text-xs text-dark-500 mb-6 break-all">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-dark-600 hover:bg-dark-500 rounded-lg font-medium transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
