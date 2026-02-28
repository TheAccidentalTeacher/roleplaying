// ============================================================
// COMBAT ENGINE — Full tactical combat state machine
// Reference: BRAINSTORM.md Combat System, combat.ts types
// ============================================================

import type {
  CombatState,
  CombatPhase,
  CombatAction,
  CombatActionType,
  Initiative,
  AttackRoll,
  DamageRoll,
  ActionResult,
  CombatTurn,
  CombatRewards,
  CombatResult,
} from '@/lib/types/combat';
import type { Character, ActiveCondition } from '@/lib/types/character';
import type { EnemyStatBlock } from '@/lib/types/encounter';
import { roll, rollMultiple, advantage, disadvantage } from '@/lib/utils/dice';
import { getAbilityModifier } from '@/lib/utils/calculations';

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize a new combat encounter.
 */
export function startCombat(
  characterId: string,
  enemies: EnemyStatBlock[],
  options?: {
    mode?: 'detailed' | 'quick';
    terrain?: string[];
    hazards?: string[];
    lighting?: 'bright' | 'dim' | 'darkness' | 'magical-darkness';
    encounterName?: string;
  }
): CombatState {
  return {
    id: `combat-${Date.now()}`,
    mode: options?.mode ?? 'detailed',
    phase: 'initiative',
    roundNumber: 0,
    turnIndex: 0,
    playerCharacterId: characterId,
    companions: [],
    enemies: enemies.map((e) => ({ ...e, isAlive: true })),
    initiativeOrder: [],
    turns: [],
    availableActions: [],
    terrainEffects: options?.terrain ?? [],
    environmentalHazards: options?.hazards ?? [],
    lightingCondition: options?.lighting ?? 'bright',
    playerConditions: [],
    concentrationSpells: [],
    deathMode: 'story',
    encounterName: options?.encounterName ?? 'Combat',
    startedAt: new Date().toISOString(),
  };
}

// ============================================================
// INITIATIVE
// ============================================================

/**
 * Roll initiative for all participants and sort turn order.
 */
export function rollInitiative(
  state: CombatState,
  character: Character
): CombatState {
  const initiatives: Initiative[] = [];

  // Player
  const playerInit = roll(20);
  const playerMod = character.initiative;
  initiatives.push({
    entityId: character.id,
    entityName: character.name,
    entityType: 'player',
    roll: playerInit,
    modifier: playerMod,
    total: playerInit + playerMod,
  });

  // Enemies
  for (const enemy of state.enemies) {
    if (!enemy.isAlive) continue;
    const dexMod = getAbilityModifier(enemy.dex);
    const enemyInit = roll(20);
    initiatives.push({
      entityId: enemy.id,
      entityName: enemy.name,
      entityType: 'enemy',
      roll: enemyInit,
      modifier: dexMod,
      total: enemyInit + dexMod,
    });
  }

  // Sort descending by total, break ties by modifier, then random
  initiatives.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.modifier !== a.modifier) return b.modifier - a.modifier;
    return Math.random() - 0.5;
  });

  return {
    ...state,
    initiativeOrder: initiatives,
    phase: 'combat-active',
    roundNumber: 1,
    turnIndex: 0,
  };
}

// ============================================================
// AVAILABLE ACTIONS
// ============================================================

/**
 * Get available actions for the current active entity.
 */
export function getAvailableActions(
  state: CombatState,
  character: Character
): CombatAction[] {
  const current = state.initiativeOrder[state.turnIndex];
  if (!current) return [];

  // Only provide actions for the player
  if (current.entityType !== 'player') return [];

  const actions: CombatAction[] = [];
  const currentTurn = state.currentTurn;
  const actionUsed = currentTurn?.actions.some((a) => !isBonusAction(a.action)) ?? false;
  const bonusUsed = currentTurn?.bonusActionUsed ?? false;

  // Attack
  actions.push({
    type: 'attack',
    label: 'Attack',
    description: 'Make a melee or ranged attack against a target.',
    targetRequired: true,
    available: !actionUsed,
    unavailableReason: actionUsed ? 'Action already used' : undefined,
  });

  // Cast Spell
  if (character.spellcasting && character.spellcasting.knownSpells.length > 0) {
    actions.push({
      type: 'cast-spell',
      label: 'Cast Spell',
      description: 'Cast a spell from your known spells.',
      targetRequired: true,
      available: !actionUsed,
      unavailableReason: actionUsed ? 'Action already used' : undefined,
    });
  }

  // Dodge
  actions.push({
    type: 'dodge',
    label: 'Dodge',
    description: 'Focus on defense. Attacks against you have disadvantage.',
    targetRequired: false,
    available: !actionUsed,
  });

  // Dash
  actions.push({
    type: 'dash',
    label: 'Dash',
    description: 'Double your movement speed this turn.',
    targetRequired: false,
    available: !actionUsed,
  });

  // Disengage
  actions.push({
    type: 'disengage',
    label: 'Disengage',
    description: 'Move without provoking opportunity attacks.',
    targetRequired: false,
    available: !actionUsed,
  });

  // Hide
  actions.push({
    type: 'hide',
    label: 'Hide',
    description: 'Attempt to hide from enemies.',
    targetRequired: false,
    available: !actionUsed,
  });

  // Use Item
  actions.push({
    type: 'use-item',
    label: 'Use Item',
    description: 'Use an item from your inventory.',
    targetRequired: false,
    available: !actionUsed,
  });

  // Help
  actions.push({
    type: 'help',
    label: 'Help',
    description: 'Give an ally advantage on their next attack or check.',
    targetRequired: true,
    available: !actionUsed,
  });

  // Flee
  actions.push({
    type: 'flee',
    label: 'Flee',
    description: 'Attempt to flee combat entirely.',
    targetRequired: false,
    available: true,
  });

  return actions;
}

function isBonusAction(type: CombatActionType): boolean {
  // Standard 5e bonus actions — class-specific bonus actions
  // are handled at a higher level via `bonusAction` flag on CombatAction
  const bonusActionTypes: CombatActionType[] = [];
  return bonusActionTypes.includes(type);
}

// ============================================================
// ACTION EXECUTION
// ============================================================

/**
 * Execute a player attack action.
 */
export function executeAttack(
  state: CombatState,
  character: Character,
  targetId: string,
  weaponSlot: 'weapon-main' | 'weapon-off' = 'weapon-main'
): { state: CombatState; result: ActionResult } {
  const target = state.enemies.find((e) => e.id === targetId);
  if (!target || !target.isAlive) {
    return {
      state,
      result: {
        actorId: character.id,
        actorName: character.name,
        action: 'attack',
        narration: 'Invalid target!',
      },
    };
  }

  // Calculate attack modifier (simplified — uses STR for melee, DEX for finesse/ranged)
  const strMod = character.abilityScores.str.modifier;
  const dexMod = character.abilityScores.dex.modifier;
  // Default to higher of STR/DEX (finesse assumption)
  const attackMod = Math.max(strMod, dexMod) + character.proficiencyBonus;

  // Check for advantage/disadvantage from conditions
  const hasAdvantage = false; // TODO: check conditions
  const hasDisadvantage = character.conditions.some(
    (c) => c.type === 'poisoned' || c.type === 'frightened' || c.type === 'prone'
  );

  // Roll
  let d20: number;
  if (hasAdvantage && !hasDisadvantage) {
    d20 = advantage();
  } else if (hasDisadvantage && !hasAdvantage) {
    d20 = disadvantage();
  } else {
    d20 = roll(20);
  }

  const isCritical = d20 === 20;
  const isCriticalFail = d20 === 1;
  const attackTotal = d20 + attackMod;
  const hits = isCritical || (!isCriticalFail && attackTotal >= target.ac);

  const attackRoll: AttackRoll = {
    d20,
    modifier: attackMod,
    total: attackTotal,
    advantage: hasAdvantage,
    disadvantage: hasDisadvantage,
    isCritical,
    isCriticalFail,
    targetAC: target.ac,
    hits,
  };

  let damageRoll: DamageRoll | undefined;
  const hpChange: { entityId: string; amount: number }[] = [];

  if (hits) {
    // Determine weapon damage die based on class (not hit die!)
    // Classes typically use: warrior/paladin → d10, rogue → d6, monk → d8, mage/cleric → d6, ranger → d8, bard → d8
    const weaponDieByClass: Record<string, number> = {
      warrior: 10, fighter: 10, barbarian: 12, paladin: 10,
      rogue: 6, monk: 8, ranger: 8, bard: 8,
      mage: 6, wizard: 6, sorcerer: 6, warlock: 8,
      cleric: 8, druid: 8, artificer: 8,
    };
    const charClass = character.class?.toLowerCase() || '';
    const damageDie = weaponDieByClass[charClass] || 8; // Default to longsword (d8)
    const damageBase = roll(damageDie);
    const critBonus = isCritical ? roll(damageDie) : 0;
    const damageMod = Math.max(strMod, dexMod);
    const totalDamage = damageBase + critBonus + damageMod;

    damageRoll = {
      formula: `1d${damageDie}${isCritical ? ` + 1d${damageDie}` : ''} + ${damageMod}`,
      rolls: isCritical ? [damageBase, critBonus] : [damageBase],
      modifier: damageMod,
      total: totalDamage,
      type: 'slashing',
      isCritical,
    };

    hpChange.push({ entityId: target.id, amount: -totalDamage });
  }

  const narration = hits
    ? isCritical
      ? `${character.name} lands a devastating critical hit on ${target.name}!`
      : `${character.name} strikes ${target.name} for ${damageRoll?.total} damage.`
    : isCriticalFail
    ? `${character.name} swings wildly and misses ${target.name} completely!`
    : `${character.name} attacks ${target.name} but the blow glances off their armor.`;

  const actionResult: ActionResult = {
    actorId: character.id,
    actorName: character.name,
    action: 'attack',
    targetId: target.id,
    targetName: target.name,
    attackRoll,
    damageRoll,
    narration,
    hpChange,
  };

  // Update state — immutably apply damage to the target
  const totalDmg = damageRoll?.total ?? 0;
  const updatedEnemies = state.enemies.map((e) => {
    if (e.id !== targetId) return e;
    const newHP = Math.max(0, e.hp.current - totalDmg);
    return { ...e, hp: { ...e.hp, current: newHP }, isAlive: newHP > 0 };
  });

  const updatedTurn: CombatTurn = {
    turnNumber: (state.currentTurn?.turnNumber ?? 0) + 1,
    roundNumber: state.roundNumber,
    activeEntityId: character.id,
    activeEntityName: character.name,
    activeEntityType: 'player',
    actions: [...(state.currentTurn?.actions ?? []), actionResult],
    bonusActionUsed: state.currentTurn?.bonusActionUsed ?? false,
    reactionUsed: state.currentTurn?.reactionUsed ?? false,
    movementUsed: state.currentTurn?.movementUsed ?? 0,
  };

  return {
    state: {
      ...state,
      enemies: updatedEnemies,
      currentTurn: updatedTurn,
    },
    result: actionResult,
  };
}

/**
 * Execute a simple enemy attack against the player.
 */
export function executeEnemyAttack(
  state: CombatState,
  enemy: EnemyStatBlock,
  characterHP: { current: number; max: number },
  characterAC: number = 10
): { state: CombatState; result: ActionResult; damageDealt: number } {
  if (!enemy.isAlive || enemy.attacks.length === 0) {
    return {
      state,
      result: {
        actorId: enemy.id,
        actorName: enemy.name,
        action: 'attack',
        narration: `${enemy.name} cannot attack.`,
      },
      damageDealt: 0,
    };
  }

  // Check if player has dodge or hidden conditions → enemy attacks with disadvantage
  const playerConditions = state.playerConditions ?? [];
  const playerIsDodging = playerConditions.some((c) => c.type === 'dodging');
  const playerIsHidden = playerConditions.some((c) => c.type === 'hidden');
  const enemyHasDisadvantage = playerIsDodging || playerIsHidden;

  // Pick the first available attack
  const attack = enemy.attacks[0];
  let d20: number;
  if (enemyHasDisadvantage) {
    d20 = disadvantage();
  } else {
    d20 = roll(20);
  }
  const isCritical = d20 === 20;
  const isCriticalFail = d20 === 1;
  const attackTotal = d20 + attack.toHit;

  // Use the actual player AC passed from character
  const playerAC = characterAC;
  const hits = isCritical || (!isCriticalFail && attackTotal >= playerAC);

  let damageDealt = 0;
  let damageRoll: DamageRoll | undefined;

  if (hits) {
    // Parse damage formula: supports "1d8+3", "2d6+5", "1d10", etc.
    const damageMatch = attack.damage.match(/(\d+)d(\d+)/);
    const modMatch = attack.damage.match(/[+-]\s*(\d+)/);
    let baseDamage = roll(8); // fallback
    if (damageMatch) {
      const numDice = parseInt(damageMatch[1]);
      const dieSize = parseInt(damageMatch[2]);
      const rolls = rollMultiple(numDice, dieSize);
      baseDamage = rolls.reduce((a, b) => a + b, 0);
    }
    // Use explicit modifier from damage string, or compute from enemy ability scores
    let damageMod: number;
    if (modMatch) {
      damageMod = parseInt(modMatch[1]);
      // Check if it was a minus sign
      if (attack.damage.includes('-')) damageMod = -damageMod;
    } else {
      // Derive from the enemy's best physical ability (STR for melee, DEX for ranged)
      const strMod = getAbilityModifier(enemy.str);
      const dexMod = getAbilityModifier(enemy.dex);
      // Heuristic: if toHit is closer to DEX+prof, it's likely ranged
      const profBonus = Math.max(2, Math.floor((enemy.level + 7) / 4));
      const isLikelyDex = Math.abs(attack.toHit - (dexMod + profBonus)) < Math.abs(attack.toHit - (strMod + profBonus));
      damageMod = isLikelyDex ? dexMod : strMod;
    }
    damageDealt = baseDamage + damageMod + (isCritical ? baseDamage : 0);

    damageRoll = {
      formula: attack.damage,
      rolls: [baseDamage],
      modifier: damageMod,
      total: damageDealt,
      type: attack.damageType || 'slashing',
      isCritical,
    };
  }

  const attackRoll: AttackRoll = {
    d20,
    modifier: attack.toHit,
    total: attackTotal,
    advantage: false,
    disadvantage: false,
    isCritical,
    isCriticalFail,
    targetAC: playerAC,
    hits,
  };

  const narration = hits
    ? isCritical
      ? `${enemy.name} delivers a savage critical blow with ${attack.name}!`
      : `${enemy.name} hits with ${attack.name} for ${damageDealt} damage.`
    : `${enemy.name} attacks with ${attack.name} but misses.`;

  return {
    state,
    result: {
      actorId: enemy.id,
      actorName: enemy.name,
      action: 'attack',
      targetId: state.playerCharacterId,
      targetName: 'Player',
      attackRoll,
      damageRoll,
      narration,
      hpChange: hits
        ? [{ entityId: state.playerCharacterId, amount: -damageDealt }]
        : [],
    },
    damageDealt,
  };
}

// ============================================================
// TURN MANAGEMENT
// ============================================================

/**
 * Advance to the next turn in initiative order.
 */
export function advanceTurn(state: CombatState): CombatState {
  // Save current turn to history
  const turns = state.currentTurn
    ? [...state.turns, state.currentTurn]
    : state.turns;

  let nextIndex = state.turnIndex + 1;
  let roundNumber = state.roundNumber;

  // Wrap around
  if (nextIndex >= state.initiativeOrder.length) {
    nextIndex = 0;
    roundNumber++;
  }

  // Skip dead entities
  const order = state.initiativeOrder;
  let attempts = 0;
  while (attempts < order.length) {
    const entity = order[nextIndex];
    if (entity.entityType === 'enemy') {
      const enemy = state.enemies.find((e) => e.id === entity.entityId);
      if (enemy && !enemy.isAlive) {
        nextIndex = (nextIndex + 1) % order.length;
        if (nextIndex === 0) roundNumber++;
        attempts++;
        continue;
      }
    }
    break;
  }

  const nextEntity = order[nextIndex];
  const phase: CombatPhase =
    nextEntity?.entityType === 'player' ? 'player-action' : 'enemy-turn';

  // Clear player combat conditions (dodge, hidden, etc.) when it's the player's turn again
  const clearPlayerConditions = nextEntity?.entityType === 'player';

  return {
    ...state,
    turns,
    turnIndex: nextIndex,
    roundNumber,
    phase,
    playerConditions: clearPlayerConditions ? [] : (state.playerConditions ?? []),
    currentTurn: {
      turnNumber: turns.length + 1,
      roundNumber,
      activeEntityId: nextEntity?.entityId ?? '',
      activeEntityName: nextEntity?.entityName ?? '',
      activeEntityType: nextEntity?.entityType ?? 'enemy',
      actions: [],
      bonusActionUsed: false,
      reactionUsed: false,
      movementUsed: 0,
    },
  };
}

// ============================================================
// COMBAT END CHECKS
// ============================================================

/**
 * Check if combat should end.
 * @param playerHP Optional — pass current player HP to detect defeat.
 */
export function checkCombatEnd(
  state: CombatState,
  playerHP?: number
): {
  ended: boolean;
  result?: CombatResult;
} {
  // All enemies dead = victory
  const allEnemiesDead = state.enemies.every((e) => !e.isAlive);
  if (allEnemiesDead) return { ended: true, result: 'victory' };

  // Player dead = defeat
  if (playerHP !== undefined && playerHP <= 0) {
    return { ended: true, result: 'defeat' };
  }

  // Flee was chosen
  if (state.result === 'fled') return { ended: true, result: 'fled' };

  return { ended: false };
}

/**
 * End combat and calculate rewards.
 */
export function endCombat(
  state: CombatState,
  result: CombatResult
): CombatState {
  const totalXP = state.enemies.reduce((sum, e) => sum + e.xpValue, 0);
  const rewards: CombatRewards = {
    xpEarned: totalXP,
    goldFound: Math.floor(Math.random() * totalXP * 0.5),
    itemIds: [],
    narrativeOutcome: '',
  };

  return {
    ...state,
    phase: 'combat-end',
    result,
    rewards,
    endedAt: new Date().toISOString(),
  };
}

// ============================================================
// CONDITION PROCESSING
// ============================================================

/**
 * Process conditions at the start/end of a turn.
 * Decrements durations, removes expired conditions.
 */
export function processConditions(
  conditions: ActiveCondition[]
): ActiveCondition[] {
  return conditions
    .map((c) => {
      if (c.duration !== undefined) {
        return { ...c, duration: c.duration - 1 };
      }
      return c;
    })
    .filter((c) => c.duration === undefined || c.duration > 0);
}

/**
 * Check if an entity has a specific condition.
 */
export function hasCondition(
  conditions: ActiveCondition[],
  type: string
): boolean {
  return conditions.some((c) => c.type === type);
}
