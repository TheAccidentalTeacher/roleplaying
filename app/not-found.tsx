'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🌌</p>
        <h1 className="font-cinzel text-3xl text-primary-400 mb-3">
          You Have Wandered Into the Void
        </h1>
        <p className="text-slate-400 mb-6">
          The path you seek does not exist in this realm.
          Perhaps the map was wrong, or perhaps this place
          has yet to be written into existence.
        </p>
        <p className="text-xs text-slate-600 mb-8">Error 404 — Page Not Found</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-colors"
        >
          Return to the Hall of Heroes
        </a>
      </div>
    </div>
  );
}
