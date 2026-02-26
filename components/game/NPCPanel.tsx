'use client';

import { useState } from 'react';
import type { NPC, AttitudeTier } from '@/lib/types/npc';

interface NPCPanelProps {
  npc: NPC;
  onClose?: () => void;
  onDialogue?: () => void;
  onTrade?: () => void;
  compact?: boolean;
}

function getAttitudeColor(attitude: AttitudeTier): string {
  switch (attitude) {
    case 'hostile': return 'text-red-400';
    case 'unfriendly': return 'text-orange-400';
    case 'neutral': return 'text-gray-400';
    case 'friendly': return 'text-green-400';
    case 'allied': return 'text-blue-400';
  }
}

function getAttitudeLabel(attitude: AttitudeTier): string {
  return attitude.charAt(0).toUpperCase() + attitude.slice(1);
}

function getRelationshipBarColor(score: number): string {
  if (score >= 50) return 'bg-blue-500';
  if (score >= 20) return 'bg-green-500';
  if (score >= -20) return 'bg-gray-500';
  if (score >= -50) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function NPCPanel({ npc, onClose, onDialogue, onTrade, compact = false }: NPCPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const relationshipPercent = Math.min(100, Math.max(0, (npc.relationshipScore + 100) / 2));

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg border border-dark-600">
        {/* Portrait or placeholder */}
        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-lg shrink-0">
          {npc.portraitUrl ? (
            <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinzel font-bold text-sm truncate">{npc.name}</p>
          <p className={`text-xs ${getAttitudeColor(npc.attitudeTier)}`}>
            {getAttitudeLabel(npc.attitudeTier)}
          </p>
        </div>
        {onDialogue && (
          <button
            onClick={onDialogue}
            className="px-2 py-1 text-xs bg-dark-600 hover:bg-dark-500 rounded transition-colors"
          >
            Talk
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
      {/* Header */}
      <div className="relative p-4 bg-dark-700/50">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-dark-400 hover:text-dark-200 transition-colors"
          >
            ✕
          </button>
        )}
        <div className="flex items-start gap-4">
          {/* Portrait */}
          <div className="w-16 h-16 rounded-lg bg-dark-700 flex items-center justify-center text-2xl shrink-0 border border-dark-500">
            {npc.portraitUrl ? (
              <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full rounded-lg object-cover" />
            ) : (
              '👤'
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel text-lg font-bold">{npc.name}</h3>
            <p className="text-dark-300 text-sm capitalize">{npc.race} • {npc.role.replace('-', ' ')}</p>
            <div className={`text-sm mt-1 ${getAttitudeColor(npc.attitudeTier)}`}>
              {getAttitudeLabel(npc.attitudeTier)}
              {npc.currentEmotionalState && (
                <span className="text-dark-400 ml-2">({npc.currentEmotionalState})</span>
              )}
            </div>
          </div>
        </div>

        {/* Relationship bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-dark-400 mb-1">
            <span>Hostile</span>
            <span>Relationship: {npc.relationshipScore}</span>
            <span>Allied</span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getRelationshipBarColor(npc.relationshipScore)}`}
              style={{ width: `${relationshipPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-dark-300 italic">&quot;{npc.speechPattern}&quot;</p>

        {npc.faction && (
          <p className="text-xs text-dark-400">
            <span className="text-dark-300">Faction:</span> {npc.faction}
          </p>
        )}
        <p className="text-xs text-dark-400">
          <span className="text-dark-300">Location:</span> {npc.location}
        </p>

        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
        >
          {showDetails ? '▼ Hide details' : '▶ Show details'}
        </button>

        {showDetails && (
          <div className="mt-2 space-y-2 text-xs text-dark-300 animate-slideUp">
            <p><span className="text-dark-400">Personality:</span> {npc.personalityCore}</p>
            {npc.knowledgeOf.length > 0 && (
              <div>
                <span className="text-dark-400">Knows about:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {npc.knowledgeOf.map((topic, i) => (
                    <span key={i} className="px-2 py-0.5 bg-dark-700 rounded text-dark-200">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {npc.sharedHistory.length > 0 && (
              <div>
                <span className="text-dark-400">Shared History:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {npc.sharedHistory.slice(-3).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 bg-dark-700/30 flex gap-2 border-t border-dark-600">
        {onDialogue && (
          <button
            onClick={onDialogue}
            className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
          >
            💬 Talk
          </button>
        )}
        {onTrade && npc.role === 'merchant' && (
          <button
            onClick={onTrade}
            className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 rounded text-sm font-medium transition-colors"
          >
            🛒 Trade
          </button>
        )}
      </div>
    </div>
  );
}
