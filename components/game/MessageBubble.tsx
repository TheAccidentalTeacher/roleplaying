'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { roll } from '@/lib/utils/dice';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  onActionClick?: (action: string) => void;
}

/** Detect "Roll dN+M for ..." patterns in DM text */
interface DiceRequest {
  full: string;     // e.g. "Roll a d20 + 3 for Perception"
  sides: number;    // 20
  modifier: number; // 3
  label: string;    // "Perception"
}

function detectDiceRolls(text: string): DiceRequest[] {
  const pattern = /\*?\*?Roll\s+(?:a\s+)?d(\d+)\s*(?:\+\s*(\d+))?\s*(?:for\s+(.+?))?(?:\*?\*?)/gi;
  const results: DiceRequest[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    results.push({
      full: match[0],
      sides: parseInt(match[1], 10),
      modifier: match[2] ? parseInt(match[2], 10) : 0,
      label: match[3]?.replace(/\*+$/g, '').trim() || 'Check',
    });
  }
  return results;
}

export default function MessageBubble({
  role,
  content,
  timestamp,
  onActionClick,
}: MessageBubbleProps) {
  // Parse action choices from DM response (numbered bold items)
  const parseActions = (text: string): { narrative: string; actions: string[] } => {
    const lines = text.split('\n');
    const actions: string[] = [];
    const narrativeLines: string[] = [];
    let inActions = false;

    for (const line of lines) {
      // Match patterns like "1. **Action text**" or "- **Action text**"
      const actionMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
      if (actionMatch) {
        inActions = true;
        actions.push(actionMatch[1]);
        continue;
      }
      // Stop collecting narrative once we hit game-data blocks
      if (line.trim().startsWith('```game-data')) break;
      narrativeLines.push(line);
    }

    return {
      narrative: narrativeLines.join('\n').trim(),
      actions,
    };
  };

  if (role === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-xs text-slate-500 italic max-w-lg text-center">
          {content}
        </div>
      </div>
    );
  }

  if (role === 'user') {
    return (
      <div className="flex justify-end my-3">
        <div className="max-w-[75%] bg-sky-600/20 border border-sky-500/30 rounded-xl rounded-br-sm px-4 py-3 text-slate-200 text-sm">
          {content}
        </div>
      </div>
    );
  }

  // Assistant / DM message
  const { narrative, actions } = parseActions(content);
  const diceRequests = detectDiceRolls(narrative);

  return (
    <div className="flex justify-start my-4">
      <div className="max-w-[90%] space-y-3">
        {/* DM Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-500 text-sm">📜</span>
          <span className="text-xs font-semibold text-amber-400 font-cinzel">
            Dungeon Master
          </span>
          {timestamp && (
            <span className="text-[10px] text-slate-600">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Narrative with Markdown */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl rounded-tl-sm px-5 py-4 prose prose-invert prose-sm max-w-none
          prose-headings:text-amber-400 prose-headings:font-cinzel prose-headings:text-base
          prose-strong:text-sky-300
          prose-blockquote:border-amber-500/30 prose-blockquote:text-slate-400 prose-blockquote:italic
          prose-code:text-amber-300 prose-code:bg-slate-800 prose-code:rounded prose-code:px-1
          prose-table:text-xs prose-td:px-2 prose-td:py-1 prose-th:px-2 prose-th:py-1
          prose-hr:border-slate-700
          prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-600/50 prose-img:max-h-[400px] prose-img:w-full prose-img:object-cover
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{narrative}</ReactMarkdown>
        </div>

        {/* Dice Roll Buttons */}
        {diceRequests.length > 0 && onActionClick && (
          <DiceRollButtons requests={diceRequests} onRollResult={(result) => onActionClick(result)} />
        )}

        {/* Action Choices */}
        {actions.length > 0 && onActionClick && (
          <div className="flex flex-wrap gap-2 pl-2">
            {actions.map((action, i) => (
              <button
                key={`action-${i}-${action}`}
                onClick={() => onActionClick(action)}
                className="px-3 py-1.5 bg-slate-800 border border-sky-500/30 rounded-lg text-sm text-sky-300 hover:bg-sky-500/10 hover:border-sky-500/50 transition-all text-left"
              >
                <span className="text-sky-500 mr-1">{i + 1}.</span> {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Dice Roll Button Component ----
function DiceRollButtons({
  requests,
  onRollResult,
}: {
  requests: DiceRequest[];
  onRollResult: (result: string) => void;
}) {
  const [results, setResults] = useState<Record<number, { dieRoll: number; total: number } | null>>({});

  const handleRoll = (idx: number, req: DiceRequest) => {
    if (results[idx]) return; // Already rolled
    const dieRoll = roll(req.sides);
    const total = dieRoll + req.modifier;
    setResults((prev) => ({ ...prev, [idx]: { dieRoll, total } }));
    // Send the result as a message to the DM
    const modStr = req.modifier > 0 ? ` + ${req.modifier}` : '';
    onRollResult(
      `I rolled a d${req.sides}${modStr} for ${req.label}: 🎲 ${dieRoll}${modStr} = **${total}**`
    );
  };

  return (
    <div className="flex flex-wrap gap-2 pl-2">
      {requests.map((req, i) => {
        const result = results[i];
        const modStr = req.modifier > 0 ? `+${req.modifier}` : '';
        return (
          <button
            key={`dice-${req.label}-${req.sides}`}
            onClick={() => handleRoll(i, req)}
            disabled={!!result}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              result
                ? 'bg-amber-900/30 border border-amber-500/30 text-amber-300 cursor-default'
                : 'bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 animate-pulse'
            }`}
          >
            <span className="text-lg">🎲</span>
            {result ? (
              <span>
                d{req.sides}{modStr} for {req.label}: {result.dieRoll}
                {req.modifier > 0 ? ` + ${req.modifier}` : ''} = <strong>{result.total}</strong>
              </span>
            ) : (
              <span>
                Roll d{req.sides}{modStr} for {req.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
