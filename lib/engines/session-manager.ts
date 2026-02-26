// ============================================================
// SESSION MANAGER — Session lifecycle, pacing, opening/closing
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type {
  SessionStructure,
  SessionOpening,
  SessionClosing,
  PacingState,
  SessionPhase,
} from '@/lib/types/session';

// ---- Session Creation ----

export function createSession(
  characterId: string,
  sessionNumber: number
): SessionStructure {
  return {
    sessionId: `session-${characterId}-${sessionNumber}-${Date.now()}`,
    sessionNumber,
    characterId,
    startTime: new Date().toISOString(),
    currentPhase: 'opening',
    pacingState: createInitialPacingState(),
    encounterCount: 0,
    restCount: 0,
    combatEncountersThisSession: 0,
    socialEncountersThisSession: 0,
    explorationThisSession: 0,
    realTimeMinutes: 0,
    inGameHoursElapsed: 0,
  };
}

function createInitialPacingState(): PacingState {
  return {
    currentTension: 10,
    targetTensionCurve: [10, 20, 40, 60, 80, 90, 70, 50, 30, 15],
    consecutiveCombats: 0,
    consecutiveSocial: 0,
    consecutiveExploration: 0,
    timeSinceLastCombat: 0,
    timeSinceLastRest: 0,
    playerHPPercentage: 100,
    spellSlotsRemaining: 100,
    healingPotionsRemaining: 2,
    suggestedNextEncounterType: 'exploration',
  };
}

// ---- Phase Management ----

const PHASE_ORDER: SessionPhase[] = [
  'opening',
  'exploration',
  'rising-action',
  'climax',
  'resolution',
  'closing',
];

export function advancePhase(session: SessionStructure): SessionStructure {
  const currentIdx = PHASE_ORDER.indexOf(session.currentPhase);
  const nextIdx = Math.min(currentIdx + 1, PHASE_ORDER.length - 1);
  return {
    ...session,
    currentPhase: PHASE_ORDER[nextIdx],
  };
}

export function setPhase(
  session: SessionStructure,
  phase: SessionPhase
): SessionStructure {
  return { ...session, currentPhase: phase };
}

// ---- Pacing Engine ----

export function updatePacing(
  session: SessionStructure,
  updates: Partial<PacingState>
): SessionStructure {
  const pacing = { ...session.pacingState, ...updates };
  pacing.suggestedNextEncounterType = recommendEncounterType(pacing, session);
  return { ...session, pacingState: pacing };
}

function recommendEncounterType(
  pacing: PacingState,
  session: SessionStructure
): PacingState['suggestedNextEncounterType'] {
  // If player is low HP, suggest rest
  if (pacing.playerHPPercentage < 30) return 'rest';

  // Too many combats in a row — switch to social or exploration
  if (pacing.consecutiveCombats >= 2) {
    return pacing.consecutiveSocial < pacing.consecutiveExploration ? 'social' : 'exploration';
  }

  // Too many social encounters — add combat or exploration
  if (pacing.consecutiveSocial >= 3) {
    return pacing.currentTension < 50 ? 'exploration' : 'combat';
  }

  // Story-based phase recommendations
  switch (session.currentPhase) {
    case 'opening':
      return 'exploration';
    case 'rising-action':
      return pacing.currentTension < 60 ? 'combat' : 'social';
    case 'climax':
      return 'combat';
    case 'resolution':
      return 'story';
    case 'closing':
      return 'social';
    default:
      return 'exploration';
  }
}

export function recordEncounter(
  session: SessionStructure,
  type: 'combat' | 'social' | 'exploration'
): SessionStructure {
  const pacing = { ...session.pacingState };

  if (type === 'combat') {
    pacing.consecutiveCombats += 1;
    pacing.consecutiveSocial = 0;
    pacing.consecutiveExploration = 0;
    pacing.timeSinceLastCombat = 0;
    pacing.currentTension = Math.min(100, pacing.currentTension + 15);
  } else if (type === 'social') {
    pacing.consecutiveSocial += 1;
    pacing.consecutiveCombats = 0;
    pacing.consecutiveExploration = 0;
    pacing.currentTension = Math.max(0, pacing.currentTension - 5);
  } else {
    pacing.consecutiveExploration += 1;
    pacing.consecutiveCombats = 0;
    pacing.consecutiveSocial = 0;
    pacing.currentTension += pacing.currentTension < 50 ? 5 : -3;
  }

  return {
    ...session,
    encounterCount: session.encounterCount + 1,
    combatEncountersThisSession: session.combatEncountersThisSession + (type === 'combat' ? 1 : 0),
    socialEncountersThisSession: session.socialEncountersThisSession + (type === 'social' ? 1 : 0),
    explorationThisSession: session.explorationThisSession + (type === 'exploration' ? 1 : 0),
    pacingState: {
      ...pacing,
      suggestedNextEncounterType: recommendEncounterType(pacing, session),
    },
  };
}

export function recordRest(session: SessionStructure): SessionStructure {
  const pacing = { ...session.pacingState };
  pacing.timeSinceLastRest = 0;
  pacing.currentTension = Math.max(5, pacing.currentTension - 20);
  pacing.consecutiveCombats = 0;
  return {
    ...session,
    restCount: session.restCount + 1,
    pacingState: pacing,
  };
}

// ---- Duration Tracking ----

export function updateDuration(
  session: SessionStructure,
  realMinutes: number,
  inGameHours: number
): SessionStructure {
  return {
    ...session,
    realTimeMinutes: session.realTimeMinutes + realMinutes,
    inGameHoursElapsed: session.inGameHoursElapsed + inGameHours,
    pacingState: {
      ...session.pacingState,
      timeSinceLastCombat: session.pacingState.timeSinceLastCombat + realMinutes,
      timeSinceLastRest: session.pacingState.timeSinceLastRest + realMinutes,
    },
  };
}

// ---- AI Prompt Builders ----

export function buildSessionOpeningPrompt(
  characterName: string,
  level: number,
  lastLocation: string,
  lastEvents: string[],
  unresolvedQuests: string[],
  sessionNumber: number
): string {
  return `Generate a session opening for session #${sessionNumber}.

CHARACTER: ${characterName} (Level ${level})
LAST LOCATION: ${lastLocation}
RECENT EVENTS: ${lastEvents.join('; ')}
UNRESOLVED THREADS: ${unresolvedQuests.join('; ')}

Provide a JSON object with:
{
  "recap": {
    "style": "narrator|campfire|journal|bard-song|dream",
    "content": "2-3 paragraph atmospheric recap",
    "keyEvents": ["event1", "event2"],
    "unresolvedThreads": ["thread1"],
    "lastLocation": "${lastLocation}",
    "lastAction": "what they did last"
  },
  "hook": {
    "type": "immediate-danger|new-discovery|npc-approach|quiet-moment|time-skip",
    "description": "Opening scene description",
    "choices": ["choice1", "choice2", "choice3"]
  }
}`;
}

export function buildSessionClosingPrompt(
  session: SessionStructure,
  keyDecisions: string[],
  xpGained: number,
  itemsGained: string[],
  npcsEncountered: string[],
  questsProgressed: string[]
): string {
  return `Generate a session closing summary.

SESSION #${session.sessionNumber}
DURATION: ${session.realTimeMinutes} real minutes, ${session.inGameHoursElapsed.toFixed(1)} in-game hours
ENCOUNTERS: ${session.encounterCount} total (${session.combatEncountersThisSession} combat, ${session.socialEncountersThisSession} social)
KEY DECISIONS: ${keyDecisions.join('; ')}
XP GAINED: ${xpGained}
ITEMS: ${itemsGained.join(', ')}
NPCs: ${npcsEncountered.join(', ')}
QUESTS: ${questsProgressed.join('; ')}

Provide a JSON object with:
{
  "summary": "brief session recap paragraph",
  "keyDecisions": ${JSON.stringify(keyDecisions)},
  "xpGained": ${xpGained},
  "itemsGained": ${JSON.stringify(itemsGained)},
  "npcsEncountered": ${JSON.stringify(npcsEncountered)},
  "questsProgressed": ${JSON.stringify(questsProgressed)},
  "cliffhanger": "optional ending hook",
  "nextSessionHook": "what awaits next time"
}`;
}
