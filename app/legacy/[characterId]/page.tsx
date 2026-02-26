'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EpilogueView from '@/components/character/EpilogueView';
import type { CharacterLegacy } from '@/lib/types/session';
import { getHallOfHeroes } from '@/lib/engines/legacy-engine';

export default function LegacyPage() {
  const params = useParams();
  const router = useRouter();
  const [legacy, setLegacy] = useState<CharacterLegacy | null>(null);

  useEffect(() => {
    const characterId = params.characterId as string;
    if (!characterId) return;

    const heroes = getHallOfHeroes();
    const entry = heroes.find((h) => h.legacy.characterId === characterId);
    if (entry) {
      setLegacy(entry.legacy);
    }
  }, [params.characterId]);

  if (!legacy) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📜</p>
          <h1 className="font-cinzel text-2xl text-dark-300 mb-2">Legacy Not Found</h1>
          <p className="text-dark-500 mb-4">This hero&apos;s tale has been lost to time.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <EpilogueView
        legacy={legacy}
        onReturnToHall={() => router.push('/')}
        onNewGamePlus={() => router.push('/character/new')}
      />
    </div>
  );
}
