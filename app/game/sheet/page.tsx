'use client';

import { useEffect, useState } from 'react';
import type { Character } from '@/lib/types/character';
import PrintableSheet from '@/components/character/PrintableSheet';
import PortraitGallery from '@/components/character/PortraitGallery';

export default function CharacterSheetPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characterId, setCharacterId] = useState<string>('');
  const [worldName, setWorldName] = useState<string>('');
  const [worldGenre, setWorldGenre] = useState<string>('');
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

      // Get character ID
      const cid = localStorage.getItem('rpg-character-id') || parsed.id || `local-${Date.now()}`;
      setCharacterId(cid);

      // Try to get world name and genre
      try {
        const worldRaw = localStorage.getItem('rpg-active-world');
        if (worldRaw) {
          const world = JSON.parse(worldRaw);
          setWorldName(world?.name ?? world?.worldName ?? '');
          setWorldGenre(world?.genre ?? world?.questGenre ?? world?.worldType ?? '');
        }
      } catch {
        // World data is optional
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

      {/* Portrait Gallery — hidden when printing */}
      <div className="sheet-no-print">
        <PortraitGallery
          character={character}
          characterId={characterId}
          worldGenre={worldGenre || undefined}
        />
      </div>
    </div>
  );
}
