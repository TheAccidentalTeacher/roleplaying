'use client';

interface QuestTrackerProps {
  questId: string;
  title: string;
  description: string;
  objectives: {
    text: string;
    completed: boolean;
    optional?: boolean;
  }[];
  priority: 'main' | 'side' | 'personal';
  isActive?: boolean;
  onClick?: () => void;
}

function getPriorityBadge(priority: string): { bg: string; text: string; label: string } {
  switch (priority) {
    case 'main': return { bg: 'bg-amber-900/40', text: 'text-amber-400', label: 'Main Quest' };
    case 'side': return { bg: 'bg-blue-900/40', text: 'text-blue-400', label: 'Side Quest' };
    case 'personal': return { bg: 'bg-purple-900/40', text: 'text-purple-400', label: 'Personal' };
    default: return { bg: 'bg-dark-700', text: 'text-dark-400', label: priority };
  }
}

export default function QuestTracker({
  title,
  description,
  objectives,
  priority,
  isActive = true,
  onClick,
}: QuestTrackerProps) {
  const completed = objectives.filter((o) => o.completed && !o.optional).length;
  const total = objectives.filter((o) => !o.optional).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const badge = getPriorityBadge(priority);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isActive
          ? 'bg-dark-800 border-dark-600 hover:border-dark-500'
          : 'bg-dark-900 border-dark-700 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-cinzel font-bold text-sm truncate">{title}</h4>
        <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-dark-400 mb-2 line-clamp-2">{description}</p>

      {/* Progress bar */}
      <div className="w-full h-1 bg-dark-700 rounded-full mb-2">
        <div
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Objectives */}
      <div className="space-y-0.5">
        {objectives.map((obj, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs">
            <span className={`shrink-0 ${obj.completed ? 'text-green-400' : 'text-dark-500'}`}>
              {obj.completed ? '✓' : '○'}
            </span>
            <span
              className={`${
                obj.completed
                  ? 'text-dark-500 line-through'
                  : obj.optional
                    ? 'text-dark-400 italic'
                    : 'text-dark-300'
              }`}
            >
              {obj.text}
              {obj.optional && ' (optional)'}
            </span>
          </div>
        ))}
      </div>

      {/* Progress count */}
      <p className="text-[10px] text-dark-500 mt-1.5">
        {completed}/{total} objectives
      </p>
    </button>
  );
}
