import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/ai-orchestrator';
import {
  executeAttack,
  advanceTurn,
  checkCombatEnd,
  endCombat,
  executeEnemyAttack,
  getAvailableActions,
} from '@/lib/engines/combat-engine';
import type { CombatState, CombatActionType } from '@/lib/types/combat';
import type { Character } from '@/lib/types/character';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      combatState: incomingState,
      action,
      targetId,
      character,
    } = body as {
      combatState: CombatState;
      action: CombatActionType;
      targetId?: string;
      character: Character;
    };

    if (!incomingState || !character) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    let state = { ...incomingState };
    const actionResults: string[] = [];

    // 1. Execute player action
    switch (action) {
      case 'attack': {
        if (!targetId) {
          return NextResponse.json({ error: 'Target required for attack' }, { status: 400 });
        }
        const { state: newState, result } = executeAttack(state, character, targetId);
        state = newState;
        actionResults.push(result.narration);
        break;
      }
      case 'dodge': {
        actionResults.push(`${character.name} takes the Dodge action, focusing entirely on defense.`);
        break;
      }
      case 'dash': {
        actionResults.push(`${character.name} dashes, doubling their movement speed.`);
        break;
      }
      case 'disengage': {
        actionResults.push(`${character.name} carefully disengages from melee combat.`);
        break;
      }
      case 'hide': {
        const stealthRoll = Math.floor(Math.random() * 20) + 1 + character.abilityScores.dex.modifier;
        actionResults.push(
          `${character.name} attempts to hide (Stealth: ${stealthRoll}).`
        );
        break;
      }
      case 'flee': {
        state = endCombat(state, 'fled');
        actionResults.push(`${character.name} flees from combat!`);
        break;
      }
      default: {
        actionResults.push(`${character.name} uses ${action}.`);
        break;
      }
    }

    // 2. Check if combat ended from player action
    let endCheck = checkCombatEnd(state);
    if (endCheck.ended && endCheck.result) {
      state = endCombat(state, endCheck.result);

      // Generate victory/defeat narration
      const narration = await callClaude(
        'combat_resolution',
        'You are a fantasy RPG narrator. Describe the outcome of combat in 2-3 vivid sentences.',
        [
          {
            role: 'user',
            content: `Combat result: ${endCheck.result}. Player: ${character.name}. Events: ${actionResults.join(' ')}`,
          },
        ],
        { maxTokens: 300 }
      );

      return NextResponse.json({
        combatState: state,
        narration: actionResults.join('\n') + '\n\n' + narration,
        combatEnded: true,
        result: endCheck.result,
      });
    }

    // 3. Process enemy turns
    if (action !== 'flee') {
      state = advanceTurn(state);

      // Process all enemy turns until it's the player's turn again
      while (
        state.phase === 'enemy-turn' &&
        state.initiativeOrder[state.turnIndex]?.entityType === 'enemy'
      ) {
        const currentEntity = state.initiativeOrder[state.turnIndex];
        const enemy = state.enemies.find((e) => e.id === currentEntity.entityId);

        if (enemy && enemy.isAlive) {
          const { state: s, result, damageDealt } = executeEnemyAttack(
            state,
            enemy,
            character.hitPoints
          );
          state = s;
          actionResults.push(result.narration);
        }

        // Check if combat ended from enemy action
        endCheck = checkCombatEnd(state);
        if (endCheck.ended && endCheck.result) {
          state = endCombat(state, endCheck.result);
          break;
        }

        state = advanceTurn(state);
      }
    }

    // 4. Get available actions for next player turn
    const availableActions = getAvailableActions(state, character);
    state = { ...state, availableActions };

    // 5. Generate narration for the round
    const roundNarration = await callClaude(
      'combat_resolution',
      'You are a fantasy RPG combat narrator. Describe the combat round in 2-4 vivid, exciting sentences. Include specific details about attacks, damage, and the flow of battle.',
      [
        {
          role: 'user',
          content: `Round ${state.roundNumber} events: ${actionResults.join(' ')} Remaining enemies: ${state.enemies
            .filter((e) => e.isAlive)
            .map((e) => `${e.name} (${e.hp.current}/${e.hp.max} HP)`)
            .join(', ')}`,
        },
      ],
      { maxTokens: 400 }
    );

    return NextResponse.json({
      combatState: state,
      narration: roundNarration,
      combatEnded: endCheck.ended,
      result: endCheck.result,
      actionResults,
    });
  } catch (error) {
    console.error('Combat action error:', error);
    return NextResponse.json(
      { error: 'Failed to process combat action' },
      { status: 500 }
    );
  }
}
