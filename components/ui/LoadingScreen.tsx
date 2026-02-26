'use client';

import { useState, useEffect } from 'react';

const FLAVOR_TEXTS = [
  'Rolling for initiative...',
  'The dungeon master consults ancient tomes...',
  'A mysterious fog rolls in...',
  'Sharpening your blade...',
  'Consulting the oracle...',
  'The tavern keeper pours another ale...',
  'A raven delivers a cryptic message...',
  'The stars align overhead...',
  'Deciphering a weathered map...',
  'Polishing your armor...',
  'The campfire crackles softly...',
  'A distant dragon roars...',
  'Mixing a potion of patience...',
  'The bard tunes his lute...',
  'Checking for traps...',
  'The wizard mutters an incantation...',
  'A treasure chest gleams in the darkness...',
  'The wind carries whispers of adventure...',
];

interface LoadingScreenProps {
  message?: string;
  showFlavor?: boolean;
}

export function LoadingScreen({ message, showFlavor = true }: LoadingScreenProps) {
  const [flavorIndex, setFlavorIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!showFlavor) return;

    // Randomize starting index
    setFlavorIndex(Math.floor(Math.random() * FLAVOR_TEXTS.length));

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setFlavorIndex((i) => (i + 1) % FLAVOR_TEXTS.length);
        setFade(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [showFlavor]);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      {/* Spinning d20 */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 animate-spin-slow">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <polygon
              points="40,5 72,25 72,55 40,75 8,55 8,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary-500"
            />
            <polygon
              points="40,5 72,25 40,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary-400/40"
            />
            <polygon
              points="72,25 72,55 40,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary-400/40"
            />
            <polygon
              points="72,55 40,75 40,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary-400/40"
            />
            <polygon
              points="40,75 8,55 40,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary-400/40"
            />
            <polygon
              points="8,55 8,25 40,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary-400/40"
            />
            <polygon
              points="8,25 40,5 40,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary-400/40"
            />
            <text
              x="40"
              y="44"
              textAnchor="middle"
              className="text-primary-300 fill-current"
              fontSize="16"
              fontWeight="bold"
            >
              20
            </text>
          </svg>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="font-cinzel text-xl text-dark-100 mb-4">{message}</p>
      )}

      {/* Loading bar */}
      <div className="w-64 h-1.5 bg-dark-700 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary-500 rounded-full animate-loading-bar" />
      </div>

      {/* Flavor text */}
      {showFlavor && (
        <p
          className={`text-dark-400 text-sm italic transition-opacity duration-300 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {FLAVOR_TEXTS[flavorIndex]}
        </p>
      )}
    </div>
  );
}
