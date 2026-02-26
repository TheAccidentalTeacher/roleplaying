// ============================================================
// SKILL CHALLENGE ENGINE
// Multi-roll encounters: chases, rituals, social debates, etc.
// Reference: SKILL-CHALLENGES.md
// ============================================================

import type { Character } from '@/lib/types/character';
import { d20 } from '@/lib/utils/dice';

// ---- Skill Challenge Types (inline, not in separate type file) ----

export type ChallengeComplexity = 'simple' | 'standard' | 'complex' | 'epic';

export interface SkillChallenge {
  id: string;
  name: string;
  description: string;
  complexity: ChallengeComplexity;
  successesRequired: number;
  failuresAllowed: number;
  currentSuccesses: number;
  currentFailures: number;
  roundsElapsed: number;
  maxRounds?: number;
  usedSkills: string[]; // Can't repeat same skill twice in a row
  allowedSkills: { skill: string; dc: number; description: string }[];
  isComplete: boolean;
  outcome?: 'success' | 'failure' | 'partial';
  narration: string[];
  stakes: string;
  hints: string[];
  currentHintTier: number;
}

export interface SkillAttemptResult {
  skill: string;
  roll: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
  criticalSuccess: boolean;
  criticalFailure: boolean;
  narration: string;
  challengeComplete: boolean;
  challengeOutcome?: SkillChallenge['outcome'];
}

// ---- Complexity Configurations ----

const COMPLEXITY_CONFIG: Record<ChallengeComplexity, { successes: number; failures: number }> = {
  simple: { successes: 3, failures: 2 },
  standard: { successes: 5, failures: 3 },
  complex: { successes: 8, failures: 4 },
  epic: { successes: 12, failures: 5 },
};

// ---- Create Challenge ----

export function createChallenge(
  name: string,
  description: string,
  complexity: ChallengeComplexity,
  allowedSkills: { skill: string; dc: number; description: string }[],
  stakes: string,
  hints: string[] = []
): SkillChallenge {
  const config = COMPLEXITY_CONFIG[complexity];
  return {
    id: `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    description,
    complexity,
    successesRequired: config.successes,
    failuresAllowed: config.failures,
    currentSuccesses: 0,
    currentFailures: 0,
    roundsElapsed: 0,
    usedSkills: [],
    allowedSkills,
    isComplete: false,
    narration: [],
    stakes,
    hints,
    currentHintTier: 0,
  };
}

// ---- Attempt a Skill ----

export function attemptSkill(
  challenge: SkillChallenge,
  character: Character,
  skillName: string,
  creativeApproach?: string
): { challenge: SkillChallenge; result: SkillAttemptResult } {
  const skillEntry = challenge.allowedSkills.find(
    (s) => s.skill.toLowerCase() === skillName.toLowerCase()
  );

  if (!skillEntry) {
    // Allow creative skill use at higher DC
    const baseDC = challenge.allowedSkills[0]?.dc || 15;
    return attemptWithDC(challenge, character, skillName, baseDC + 3, creativeApproach);
  }

  return attemptWithDC(challenge, character, skillName, skillEntry.dc, creativeApproach);
}

function attemptWithDC(
  challenge: SkillChallenge,
  character: Character,
  skillName: string,
  dc: number,
  creativeApproach?: string
): { challenge: SkillChallenge; result: SkillAttemptResult } {
  // Check if skill was just used
  const lastSkill = challenge.usedSkills[challenge.usedSkills.length - 1];
  const repeatPenalty = lastSkill?.toLowerCase() === skillName.toLowerCase() ? 2 : 0;

  // Find skill bonus
  const skill = character.skills.find(
    (s) => s.name.toLowerCase() === skillName.toLowerCase()
  );
  const abilityMod = skill ? character.abilityScores[skill.ability as keyof typeof character.abilityScores]?.modifier || 0 : 0;
  const profBonus = Math.ceil(character.level / 4) + 1;
  const bonus = abilityMod + (skill?.proficient ? profBonus : 0) + (skill?.expertise ? profBonus : 0) - repeatPenalty;

  // Creative approach bonus
  const creativityBonus = creativeApproach && creativeApproach.length > 30 ? 1 : 0;

  const rollVal = d20();
  const total = rollVal + bonus + creativityBonus;
  const success = total >= dc;
  const critSuccess = rollVal === 20;
  const critFailure = rollVal === 1;

  // Update challenge
  const updated = { ...challenge };
  updated.roundsElapsed++;
  updated.usedSkills = [...updated.usedSkills, skillName];

  if (critSuccess || success) {
    updated.currentSuccesses += critSuccess ? 2 : 1; // Crit = 2 successes
  } else {
    updated.currentFailures += critFailure ? 2 : 1; // Crit fail = 2 failures
  }

  // Check completion
  let outcome: SkillChallenge['outcome'] | undefined;
  if (updated.currentSuccesses >= updated.successesRequired) {
    updated.isComplete = true;
    outcome = 'success';
  } else if (updated.currentFailures >= updated.failuresAllowed) {
    updated.isComplete = true;
    // Partial success if they got more than half the required successes
    outcome = updated.currentSuccesses >= Math.floor(updated.successesRequired / 2)
      ? 'partial'
      : 'failure';
  }
  updated.outcome = outcome;

  // Build narration
  const narration = buildAttemptNarration(skillName, success, critSuccess, critFailure, rollVal, total, dc);
  updated.narration = [...updated.narration, narration];

  const result: SkillAttemptResult = {
    skill: skillName,
    roll: rollVal,
    bonus,
    total,
    dc,
    success: critSuccess || success,
    criticalSuccess: critSuccess,
    criticalFailure: critFailure,
    narration,
    challengeComplete: updated.isComplete,
    challengeOutcome: outcome,
  };

  return { challenge: updated, result };
}

// ---- Hints ----

export function getHint(challenge: SkillChallenge): { hint: string; challenge: SkillChallenge } | null {
  if (challenge.currentHintTier >= challenge.hints.length) {
    return null;
  }

  const hint = challenge.hints[challenge.currentHintTier];
  return {
    hint,
    challenge: {
      ...challenge,
      currentHintTier: challenge.currentHintTier + 1,
    },
  };
}

// ---- Challenge Resolution ----

export function getChallengeOutcomeNarration(challenge: SkillChallenge): string {
  if (!challenge.isComplete) return '';

  switch (challenge.outcome) {
    case 'success':
      return `You succeed at ${challenge.name}! With ${challenge.currentSuccesses} successes and only ${challenge.currentFailures} setbacks, you overcome the challenge.`;
    case 'partial':
      return `You partially succeed at ${challenge.name}. It's not a complete victory — there are consequences, but you've made meaningful progress.`;
    case 'failure':
      return `You fail at ${challenge.name}. The ${challenge.stakes}. You'll need to find another way.`;
    default:
      return '';
  }
}

// ---- Progress Display ----

export function getChallengeProgress(challenge: SkillChallenge): {
  successFraction: string;
  failureFraction: string;
  successPct: number;
  failurePct: number;
  status: string;
} {
  return {
    successFraction: `${challenge.currentSuccesses}/${challenge.successesRequired}`,
    failureFraction: `${challenge.currentFailures}/${challenge.failuresAllowed}`,
    successPct: (challenge.currentSuccesses / challenge.successesRequired) * 100,
    failurePct: (challenge.currentFailures / challenge.failuresAllowed) * 100,
    status: challenge.isComplete
      ? challenge.outcome === 'success'
        ? 'Victory!'
        : challenge.outcome === 'partial'
        ? 'Partial Success'
        : 'Failed'
      : 'In Progress',
  };
}

// ---- AI Prompt ----

export function buildSkillChallengePrompt(
  scenario: string,
  complexity: ChallengeComplexity,
  partyLevel: number
): string {
  const config = COMPLEXITY_CONFIG[complexity];
  return `Create a ${complexity} skill challenge for: "${scenario}"
Party level: ${partyLevel}
Successes needed: ${config.successes}, Failures allowed: ${config.failures}

Respond as JSON:
{
  "name": "short challenge name",
  "description": "1-2 sentences setting the scene",
  "stakes": "what happens on failure",
  "allowedSkills": [
    { "skill": "Athletics", "dc": ${10 + partyLevel}, "description": "how this skill helps" },
    { "skill": "Persuasion", "dc": ${12 + partyLevel}, "description": "how this skill helps" }
  ],
  "hints": [
    "tier 1 hint (vague)",
    "tier 2 hint (clearer)",
    "tier 3 hint (almost direct)"
  ]
}

Include 4-6 allowed skills appropriate to the scenario. DCs should range from ${10 + Math.floor(partyLevel / 2)} to ${14 + partyLevel}.`;
}

// ---- Helper ----

function buildAttemptNarration(
  skill: string,
  success: boolean,
  crit: boolean,
  critFail: boolean,
  roll: number,
  total: number,
  dc: number
): string {
  if (crit) {
    return `Critical success with ${skill}! (🎲 Natural 20, total ${total} vs DC ${dc}) — An extraordinary display of skill!`;
  }
  if (critFail) {
    return `Critical failure on ${skill}! (🎲 Natural 1, total ${total} vs DC ${dc}) — A devastating misstep!`;
  }
  if (success) {
    return `${skill} check succeeded. (🎲 ${roll} + ${total - roll} = ${total} vs DC ${dc})`;
  }
  return `${skill} check failed. (🎲 ${roll} + ${total - roll} = ${total} vs DC ${dc})`;
}
