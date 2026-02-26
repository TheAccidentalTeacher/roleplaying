// ============================================================
// SKILL CHALLENGE VIEW — Progress bar with successes/failures
// ============================================================
'use client';

import React, { useState } from 'react';
import type { SkillChallenge, SkillAttemptResult } from '@/lib/engines/skill-challenge-engine';
import { getChallengeProgress } from '@/lib/engines/skill-challenge-engine';

interface SkillChallengeViewProps {
  challenge: SkillChallenge;
  onAttempt: (skill: string, approach: string) => void;
  onRequestHint: () => void;
  lastResult?: SkillAttemptResult;
  onComplete: () => void;
}

export default function SkillChallengeView({
  challenge,
  onAttempt,
  onRequestHint,
  lastResult,
  onComplete,
}: SkillChallengeViewProps) {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [approach, setApproach] = useState('');
  const progress = getChallengeProgress(challenge);

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-dark-700 px-4 py-3 border-b border-dark-600">
        <h2 className="font-cinzel text-lg text-primary-400">{challenge.name}</h2>
        <p className="text-sm text-dark-300">{challenge.description}</p>
      </div>

      {/* Progress bars */}
      <div className="px-4 py-3 space-y-2 border-b border-dark-600">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-green-400">Successes: {progress.successFraction}</span>
            <span className="text-dark-400">{progress.status}</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.min(100, progress.successPct)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">Failures: {progress.failureFraction}</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${Math.min(100, progress.failurePct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Last result */}
        {lastResult && (
          <div
            className={`rounded p-3 text-sm ${
              lastResult.success
                ? 'bg-green-900/20 border border-green-800'
                : 'bg-red-900/20 border border-red-800'
            }`}
          >
            <p className={lastResult.success ? 'text-green-400' : 'text-red-400'}>
              {lastResult.narration}
            </p>
          </div>
        )}

        {/* Narration log */}
        {challenge.narration.length > 0 && !lastResult && (
          <div className="bg-dark-700 rounded p-3 text-xs text-dark-300 max-h-32 overflow-y-auto space-y-1">
            {challenge.narration.map((n, i) => (
              <p key={i}>{n}</p>
            ))}
          </div>
        )}

        {/* Challenge complete */}
        {challenge.isComplete ? (
          <div className="text-center py-4">
            <p
              className={`text-lg font-cinzel mb-2 ${
                challenge.outcome === 'success'
                  ? 'text-green-400'
                  : challenge.outcome === 'partial'
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {challenge.outcome === 'success'
                ? '✓ Challenge Complete!'
                : challenge.outcome === 'partial'
                ? '~ Partial Success'
                : '✗ Challenge Failed'}
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            {/* Skill selection */}
            <div>
              <p className="text-xs text-dark-400 font-medium mb-2">Choose a skill:</p>
              <div className="grid grid-cols-2 gap-2">
                {challenge.allowedSkills.map((s) => {
                  const justUsed =
                    challenge.usedSkills[challenge.usedSkills.length - 1]?.toLowerCase() ===
                    s.skill.toLowerCase();
                  return (
                    <button
                      key={s.skill}
                      onClick={() => setSelectedSkill(s.skill)}
                      className={`p-2 rounded border text-left text-xs transition-colors ${
                        selectedSkill === s.skill
                          ? 'border-primary-500 bg-primary-900/30'
                          : justUsed
                          ? 'border-amber-700 bg-dark-700 opacity-60'
                          : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                      }`}
                    >
                      <span className="font-medium">{s.skill}</span>
                      <span className="text-dark-500 ml-1">(DC {s.dc})</span>
                      {justUsed && (
                        <span className="text-amber-500 ml-1">(+2 DC)</span>
                      )}
                      <p className="text-dark-400 mt-0.5">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Approach */}
            {selectedSkill && (
              <div>
                <p className="text-xs text-dark-400 mb-1">
                  Describe your approach (optional, creative approaches get a bonus):
                </p>
                <textarea
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="How do you use this skill?"
                  className="w-full h-16 bg-dark-700 border border-dark-600 rounded p-2 text-sm text-dark-200 resize-none focus:outline-none focus:border-primary-500"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedSkill) {
                    onAttempt(selectedSkill, approach);
                    setApproach('');
                  }
                }}
                disabled={!selectedSkill}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
              >
                🎲 Attempt
              </button>
              {challenge.currentHintTier < challenge.hints.length && (
                <button
                  onClick={onRequestHint}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded text-sm transition-colors"
                >
                  💡 Hint
                </button>
              )}
            </div>

            {/* Stakes reminder */}
            <p className="text-xs text-red-400/60 italic">
              Stakes: {challenge.stakes}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
