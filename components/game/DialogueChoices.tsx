'use client';

interface DialogueOption {
  id: string;
  text: string;
  skillCheck?: {
    skill: string;
    dc: number;
  };
  attitudeRequired?: string;
  isAggressive?: boolean;
  isDeceptive?: boolean;
  isPersuasive?: boolean;
  tooltip?: string;
}

interface DialogueChoicesProps {
  options: DialogueOption[];
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  npcName?: string;
}

function getSkillColor(skill: string): string {
  const colors: Record<string, string> = {
    'persuasion': 'text-blue-400',
    'deception': 'text-purple-400',
    'intimidation': 'text-red-400',
    'insight': 'text-amber-400',
    'perception': 'text-green-400',
    'investigation': 'text-cyan-400',
    'athletics': 'text-orange-400',
    'stealth': 'text-slate-400',
  };
  return colors[skill.toLowerCase()] || 'text-primary-400';
}

function getOptionIcon(option: DialogueOption): string {
  if (option.isAggressive) return '⚔️';
  if (option.isDeceptive) return '🎭';
  if (option.isPersuasive) return '💬';
  if (option.skillCheck) return '🎲';
  return '▸';
}

export default function DialogueChoices({ options, onSelect, disabled = false, npcName }: DialogueChoicesProps) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      {npcName && (
        <p className="text-xs text-slate-500 mb-1">Choose your response to {npcName}:</p>
      )}
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => !disabled && onSelect(option.id)}
          disabled={disabled}
          className={`
            w-full text-left p-3 rounded-lg border transition-all group
            ${disabled
              ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900'
              : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-primary-600/50 cursor-pointer'
            }
          `}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5 shrink-0">{getOptionIcon(option)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                <span className="text-slate-600 mr-1">{index + 1}.</span>
                {option.text}
              </p>
              {option.skillCheck && (
                <p className={`text-xs mt-1 ${getSkillColor(option.skillCheck.skill)}`}>
                  [{option.skillCheck.skill} DC {option.skillCheck.dc}]
                </p>
              )}
              {option.attitudeRequired && (
                <p className="text-xs text-amber-400/70 mt-1">
                  Requires: {option.attitudeRequired} attitude
                </p>
              )}
              {option.tooltip && (
                <p className="text-xs text-slate-600 mt-1 italic">{option.tooltip}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
