'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  onActionClick?: (action: string) => void;
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
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{narrative}</ReactMarkdown>
        </div>

        {/* Action Choices */}
        {actions.length > 0 && onActionClick && (
          <div className="flex flex-wrap gap-2 pl-2">
            {actions.map((action, i) => (
              <button
                key={i}
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
