'use client';

import { useEffect, useState } from 'react';
import type { Character } from '@/lib/types/character';
import PrintableSheet from '@/components/character/PrintableSheet';

export default function CharacterSheetPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [worldName, setWorldName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rpg-active-character');
      if (!raw) {
        setError('No character found. Go back to the game and create one first.');
        return;
      }
      const parsed = JSON.parse(raw) as Character;
      setCharacter(parsed);

      // Try to get world name
      try {
        const worldRaw = localStorage.getItem('rpg-active-world');
        if (worldRaw) {
          const world = JSON.parse(worldRaw);
          setWorldName(world?.name ?? world?.worldName ?? '');
        }
      } catch {
        // World name is optional
      }
    } catch (e) {
      setError('Failed to load character data.');
      console.error('Sheet load error:', e);
    }
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#1a1a2e',
          color: '#e0d6c8',
          fontFamily: 'Georgia, serif',
          fontSize: 18,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📜</p>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: 16,
              padding: '10px 24px',
              background: '#8b4513',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#fdf6e3',
          color: '#8b4513',
          fontFamily: 'Georgia, serif',
          fontSize: 18,
        }}
      >
        Loading character sheet...
      </div>
    );
  }

  return (
    <div style={{ background: '#fdf6e3', minHeight: '100vh' }}>
      <PrintableSheet character={character} worldName={worldName} />
    </div>
  );
}
