'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import type { Character as FullCharacter } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type { CombatState } from '@/lib/types/combat';
import { parseGameData, parseTimeAdvance, stripGameDataBlock, type GameDataUpdate } from '@/lib/utils/game-data-parser';
import { compressMessages } from '@/lib/utils/message-summarizer';
import { advanceTime as advanceClockTime } from '@/lib/engines/clock-engine';
import { generateWeather } from '@/lib/engines/weather-engine';
import { processShortRest, processLongRest, applyLongRestToCharacter, createCampSetup } from '@/lib/engines/rest-engine';
import { createSession } from '@/lib/engines/session-manager';
import { initPacingState, updatePacing } from '@/lib/engines/chronicle-engine';
import TopBar from '@/components/game/TopBar';
import ChatArea from '@/components/game/ChatArea';
import InputBar from '@/components/game/InputBar';
import QuickActions from '@/components/game/QuickActions';
import CombatView from '@/components/game/CombatView';
import CharacterSheet from '@/components/character/CharacterSheet';
import QuestTracker from '@/components/character/QuestTracker';
import NPCPanel from '@/components/game/NPCPanel';
import DiceRoller from '@/components/game/DiceRoller';
import type { DiceCheck, DiceRollResult } from '@/components/game/DiceRoller';
import RestMenu from '@/components/game/RestMenu';
import SettingsProvider from '@/components/game/SettingsProvider';
import LootPopup from '@/components/inventory/LootPopup';
import ShopView from '@/components/game/ShopView';
import HaggleDialog from '@/components/game/HaggleDialog';
import EpilogueView from '@/components/character/EpilogueView';
import TravelView from '@/components/game/TravelView';
import CraftingView from '@/components/game/CraftingView';
import SkillChallengeView from '@/components/game/SkillChallengeView';
import LevelUpCeremony from '@/components/game/LevelUpCeremony';
import { stringsToItems } from '@/lib/utils/item-converter';
import { retireCharacter } from '@/lib/engines/legacy-engine';
import { createTravelPlan, resolveSegment } from '@/lib/engines/travel-engine';
// encounter-generator is called via API routes, not directly
import { getWorldCraftingRecipes, craft as craftItem } from '@/lib/engines/crafting-engine';
import {
  createChallenge,
  attemptSkill,
  getHint,
  getChallengeOutcomeNarration,
  type SkillChallenge,
  type SkillAttemptResult,
  type ChallengeComplexity,
} from '@/lib/engines/skill-challenge-engine';
import { previewLevelUp, applyLevelUp, type LevelUpGains } from '@/lib/engines/level-engine';
import { checkAchievements, type AchievementContext } from '@/lib/engines/achievement-engine';
import AchievementPopup from '@/components/ui/AchievementPopup';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/Toast';
import CharacterSidebar from '@/components/game/CharacterSidebar';
import type { Item } from '@/lib/types/items';
import type { TravelPlan, TravelDiscovery, TerrainType, TravelPace, TravelMethod } from '@/lib/types/exploration';
import type { MerchantItem } from '@/lib/types/economy';
import type { CharacterLegacy, Achievement } from '@/lib/types/session';
import type { NPC } from '@/lib/types/npc';
import { User } from 'lucide-react';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export default function GamePage() {
  const router = useRouter();
  const {
    messages,
    addMessage,
    isLoading,
    setLoading,
    // New fields
    characters,
    activeCharacterId,
    activeWorld,
    activeWorldId,
    setActiveWorld,
    setActiveCharacter,
    updateActiveCharacter,
    gameClock,
    weather,
    activeQuests,
    knownNPCs,
    combatState,
    updateLocation,
    addActiveQuest,
    updateQuest,
    addKnownNPC,
    setCombatState,
    setGameClock,
    setWeather,
    sessionState,
    setSessionState,
    pacingState,
    setPacingState,
  } = useGameStore();

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [fullCharacter, setFullCharacter] = useState<FullCharacter | null>(null);
  const [world, setWorld] = useState<WorldRecord | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showRestMenu, setShowRestMenu] = useState(false);
  const [pendingDiceCheck, setPendingDiceCheck] = useState<DiceCheck | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [pendingLoot, setPendingLoot] = useState<{ items: Item[]; gold: number; narration?: string } | null>(null);
  const [activeShop, setActiveShop] = useState<{
    shopName: string;
    merchantName: string;
    stock: MerchantItem[];
    sellMultiplier: number;
    haggleWillingness: number;
  } | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [haggleItem, setHaggleItem] = useState<MerchantItem | null>(null);
  const [characterLegacy, setCharacterLegacy] = useState<CharacterLegacy | null>(null);
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [travelSegmentIndex, setTravelSegmentIndex] = useState(0);
  const [travelDiscoveries, setTravelDiscoveries] = useState<TravelDiscovery[]>([]);
  const [travelEncounterPending, setTravelEncounterPending] = useState(false);
  const [craftingOpen, setCraftingOpen] = useState(false);
  const [craftingStation, setCraftingStation] = useState<string | undefined>(undefined);
  const [activeChallenge, setActiveChallenge] = useState<SkillChallenge | null>(null);
  const [lastChallengeResult, setLastChallengeResult] = useState<SkillAttemptResult | undefined>(undefined);
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpGains | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [achievementPopupQueue, setAchievementPopupQueue] = useState<Achievement[]>([]);
  const achievementStatsRef = useRef({ totalEnemiesDefeated: 0, totalQuestsCompleted: 0, totalGoldEarned: 0, totalItemsCollected: 0, totalSecretsDiscovered: 0, events: [] as string[] });
  const sessionSummaryRef = useRef<string | undefined>(undefined);
  const { toasts, addToast, removeToast } = useToast();

  // Load data from localStorage (set by WorldGenLoading) on mount
  useEffect(() => {
    try {
      // Try to load from localStorage first (fresh from character creation)
      const storedWorld = localStorage.getItem('rpg-active-world');
      const storedCharacter = localStorage.getItem('rpg-active-character');
      const storedOpeningScene = localStorage.getItem('rpg-opening-scene');
      const storedWorldId = localStorage.getItem('rpg-world-id');
      const storedCharId = localStorage.getItem('rpg-character-id');

      let loadedWorld: WorldRecord | null = null;
      let loadedChar: FullCharacter | null = null;

      if (storedWorld) {
        try {
          loadedWorld = JSON.parse(storedWorld);
          setWorld(loadedWorld);
          if (loadedWorld && storedWorldId) {
            setActiveWorld(loadedWorld, storedWorldId);
          }
        } catch { /* ignore */ }
      } else if (activeWorld) {
        loadedWorld = activeWorld;
        setWorld(activeWorld);
      }

      if (storedCharacter) {
        try {
          loadedChar = JSON.parse(storedCharacter);
          setFullCharacter(loadedChar);
          if (loadedChar) {
            setActiveCharacter(loadedChar);
          }
        } catch { /* ignore */ }
      }

      // If we have an opening scene and no messages yet, inject it
      if (storedOpeningScene && messages.length === 0) {
        const openingMsg: ChatMsg = {
          id: 'opening-scene',
          role: 'assistant',
          content: storedOpeningScene,
          timestamp: Date.now(),
        };
        setChatMessages([openingMsg]);
        addMessage({
          role: 'assistant',
          content: storedOpeningScene,
          timestamp: Date.now(),
        });
        // Update location from world if available
        if (loadedWorld?.geography?.[0]?.name) {
          updateLocation(loadedWorld.geography[0].name);
        }
        // Clear one-time localStorage
        try { localStorage.removeItem('rpg-opening-scene'); } catch { /* quota */ }
      } else if (messages.length > 0) {
        // Restore from persisted messages
        setChatMessages(
          messages.map((m, i) => ({
            id: `msg-${i}`,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }))
        );
      }

      // Redirect if no character at all
      const hasExistingCharacter = (characters.length > 0 && activeCharacterId);
      if (!storedCharacter && !hasExistingCharacter) {
        router.push('/character/new');
        return;
      }

      setInitialized(true);
    } catch (err) {
      console.error('[game] Failed to load from localStorage:', err);
      setInitialized(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync legacy messages → chatMessages when messages array grows
  useEffect(() => {
    if (!initialized) return;
    if (messages.length > chatMessages.length) {
      setChatMessages(
        messages.map((m, i) => ({
          id: `msg-${i}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))
      );
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session initialization + recap for returning players ──
  useEffect(() => {
    if (!initialized || !fullCharacter) return;

    // Initialize session if none exists
    if (!sessionState) {
      const sessionNumber = parseInt(localStorage.getItem('rpg-session-number') || '1', 10);
      const newSession = createSession(fullCharacter.id, sessionNumber);
      setSessionState(newSession);
      if (!pacingState) {
        setPacingState(initPacingState());
      }
      localStorage.setItem('rpg-session-number', String(sessionNumber + 1));

      // If returning player (has messages), show a recap message
      if (messages.length > 2) {
        const recentEvents = messages
          .filter((m) => m.role === 'assistant')
          .slice(-3)
          .map((m) => m.content.slice(0, 150).replace(/\n/g, ' '));

        const recap: ChatMsg = {
          id: `recap-${Date.now()}`,
          role: 'system',
          content: `📜 **Session ${sessionNumber} — Welcome Back, ${fullCharacter.name}!**\n\n*When last we left our hero...* ${recentEvents.length > 0 ? recentEvents[recentEvents.length - 1] + '...' : 'Your adventure continues.'}\n\n---`,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [recap, ...prev]);
      }
    }
  }, [initialized, fullCharacter, sessionState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Level-up detection ──
  useEffect(() => {
    if (!fullCharacter || pendingLevelUp) return;
    const gains = previewLevelUp(fullCharacter);
    if (gains) {
      setPendingLevelUp(gains);
    }
  }, [fullCharacter?.xp, fullCharacter?.level]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save every 5 minutes + beforeunload ──
  useAutoSave({
    initialized,
    fullCharacter,
    world,
    combatState,
    gameClock,
    weather,
    activeQuests,
    knownNPCs,
    messages,
  });

  // ── Apply parsed game-data to Zustand store ──
  const applyGameData = useCallback(
    (data: GameDataUpdate) => {
      console.log('[game-data] Applying:', data);

      // Location change
      if (data.location_change) {
        updateLocation(data.location_change);
        if (fullCharacter) {
          updateActiveCharacter({ currentLocation: data.location_change });
        }
      }

      // Time advance — use clock engine for proper month/season rollover, then update weather
      if (data.time_advance) {
        const hours = parseTimeAdvance(data.time_advance);
        const newClock = advanceClockTime(gameClock, hours);
        setGameClock(newClock);

        // Regenerate weather if significant time passed (>= 4 hours) or season changed
        if (hours >= 4 || newClock.currentSeason !== gameClock.currentSeason) {
          // Guess terrain from world region or default to 'plains'
          const terrain = (world?.geography?.[0]?.terrain as 'plains' | 'forest' | 'mountains' | 'desert' | 'swamp' | 'coast' | 'urban') || 'plains';
          const newWeather = generateWeather(newClock.currentSeason, terrain);
          setWeather(newWeather);
        }
      }

      // HP change (delta, not absolute)
      if (data.hp_change != null && fullCharacter) {
        const hp = fullCharacter.hitPoints;
        const newCurrent = Math.max(0, Math.min(hp.max, hp.current + data.hp_change));
        updateActiveCharacter({
          hitPoints: { ...hp, current: newCurrent },
        });
        // Also update local state for immediate sidebar refresh
        setFullCharacter((prev) =>
          prev
            ? { ...prev, hitPoints: { ...prev.hitPoints, current: newCurrent } }
            : prev
        );
      }

      // XP gained
      if (data.xp_gained && data.xp_gained > 0 && fullCharacter) {
        const newXp = (fullCharacter.xp || 0) + data.xp_gained;
        updateActiveCharacter({ xp: newXp });
        setFullCharacter((prev) =>
          prev ? { ...prev, xp: newXp } : prev
        );
      }

      // Gold change (delta)
      if (data.gold_change != null && fullCharacter) {
        const newGold = Math.max(0, (fullCharacter.gold || 0) + data.gold_change);
        updateActiveCharacter({ gold: newGold });
        setFullCharacter((prev) =>
          prev ? { ...prev, gold: newGold } : prev
        );
      }

      // Items gained — convert to Item objects and show LootPopup
      if (data.items_gained && data.items_gained.length > 0 && fullCharacter) {
        const newInventory = [...(fullCharacter.inventory || []), ...data.items_gained];
        updateActiveCharacter({ inventory: newInventory });
        setFullCharacter((prev) =>
          prev ? { ...prev, inventory: newInventory } : prev
        );
        // Show loot popup with proper Item objects
        const lootItems = stringsToItems(data.items_gained);
        setPendingLoot({
          items: lootItems,
          gold: data.gold_change && data.gold_change > 0 ? data.gold_change : 0,
          narration: 'You found some items!',
        });
      }

      // Items lost
      if (data.items_lost && data.items_lost.length > 0 && fullCharacter) {
        const lostSet = new Set(data.items_lost.map((s) => s.toLowerCase()));
        const newInventory = (fullCharacter.inventory || []).filter(
          (item) => !lostSet.has(item.toLowerCase())
        );
        updateActiveCharacter({ inventory: newInventory });
        setFullCharacter((prev) =>
          prev ? { ...prev, inventory: newInventory } : prev
        );
      }

      // Quest update
      if (data.quest_update) {
        const existing = activeQuests.find((q) => q.id === data.quest_update!.id);
        if (existing) {
          updateQuest(data.quest_update.id, { status: data.quest_update.status });
        } else {
          // New quest — provide required fields with sensible defaults
          const now = new Date().toISOString();
          addActiveQuest({
            id: data.quest_update.id,
            worldId: world?.worldName || '',
            characterId: fullCharacter?.id || '',
            type: 'side',
            title: data.quest_update.title || data.quest_update.id,
            logline: data.quest_update.description || '',
            fullDescription: data.quest_update.description || '',
            secretTruth: '',
            primaryGenre: (world?.primaryGenre as import('@/lib/types/world').Genre) || 'epic-fantasy',
            subGenres: [],
            tone: [],
            acts: [],
            keyDecisionPoints: [],
            possibleEndings: [],
            uniqueMechanics: [],
            feedsIntoMainQuest: false,
            lootProfile: { rarityWeights: {}, thematicTags: [], uniqueItemChance: 0 },
            status: data.quest_update.status === 'active' ? 'active'
              : data.quest_update.status === 'completed' ? 'completed'
              : data.quest_update.status === 'failed' ? 'failed'
              : 'active',
            currentAct: 0,
            choices: [],
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // NPC met
      if (data.npc_met) {
        const existingNpc = knownNPCs.find(
          (n) => n.name.toLowerCase() === data.npc_met!.name.toLowerCase()
        );
        if (!existingNpc) {
          const now = new Date().toISOString();
          addKnownNPC({
            id: `npc-${Date.now()}`,
            worldId: world?.worldName || '',
            characterId: fullCharacter?.id || '',
            name: data.npc_met.name,
            race: 'unknown',
            role: 'commoner',
            storyRole: 'minor',
            physicalDescription: data.npc_met.description || '',
            voiceDescription: '',
            personalityCore: '',
            motivation: '',
            fear: '',
            secret: '',
            speechPattern: '',
            relationshipScore: data.npc_met.attitude === 'friendly' ? 25
              : data.npc_met.attitude === 'hostile' ? -25 : 0,
            relationshipType: 'stranger',
            attitudeTier: data.npc_met.attitude === 'friendly' ? 'friendly'
              : data.npc_met.attitude === 'hostile' ? 'hostile' : 'neutral',
            sharedHistory: [],
            currentEmotionalState: 'neutral',
            location: data.location_change || '',
            knowledgeOf: [],
            isAlive: true,
            isCompanion: false,
            memories: [],
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // Combat start — use encounter-generator API for rich encounters
      if (data.combat_start && fullCharacter) {
        (async () => {
          try {
            const res = await fetch('/api/combat/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                character: fullCharacter,
                world: activeWorld,
                encounterDescription: data.enemies?.map(e => e.name).join(', ') || 'A hostile encounter',
                difficulty: 'moderate',
                terrain: gameClock?.timeOfDay ? undefined : 'plains',
                timeOfDay: gameClock?.timeOfDay || 'midday',
              }),
            });
            if (!res.ok) throw new Error('Combat API failed');
            const result = await res.json();
            setCombatState(result.combatState);
          } catch (err) {
            console.error('[combat-start] API failed, using fallback:', err);
            // Fallback: build enemies from game-data inline
            const { startCombat: startCombatFn, rollInitiative: rollInitiativeFn } = await import('@/lib/engines/combat-engine');
            const fallbackEnemies = (data.enemies || [{ name: 'Enemy', hp: 15, ac: 12, attack_bonus: 3, damage: '1d6+1' }]).map(
              (e, idx) => ({
                id: `enemy-${Date.now()}-${idx}`,
                name: e.name,
                type: 'humanoid' as const,
                level: e.cr || Math.max(1, fullCharacter.level),
                hp: { current: e.hp || 15, max: e.hp || 15 },
                ac: e.ac || 12,
                speed: '30 ft.',
                str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10,
                attacks: [{ name: 'Attack', type: 'melee' as const, toHit: e.attack_bonus || 3, damage: e.damage || '1d6+1', damageType: 'slashing', range: 'melee', description: `${e.name} attacks` }],
                specialAbilities: [] as never[],
                reactions: [] as never[],
                resistances: [] as never[],
                vulnerabilities: [] as never[],
                immunities: [] as never[],
                conditionImmunities: [] as string[],
                savingThrowBonuses: {},
                tactics: { preferredRange: 'melee' as const, targetPriority: 'closest' as const, fleeThreshold: 20, specialBehavior: 'none' },
                morale: 80,
                moraleBreakpoint: 20,
                intelligenceLevel: 'average' as const,
                threatContribution: 1,
                xpValue: (e.cr || 1) * 50,
                isAlive: true,
              })
            );
            let cs = startCombatFn(fullCharacter.id, fallbackEnemies, { encounterName: 'Combat' });
            cs = rollInitiativeFn(cs, fullCharacter);
            setCombatState(cs);
          }
        })();
      }

      // Combat end
      if (data.combat_end) {
        setCombatState(null);
      }

      // Rest — mechanical HP/slot recovery
      if (data.rest && fullCharacter) {
        if (data.rest === 'short') {
          // Spend up to half remaining hit dice
          const diceToSpend = Math.max(1, Math.floor(fullCharacter.hitPoints.hitDice.remaining / 2));
          const result = processShortRest(fullCharacter, diceToSpend);
          updateActiveCharacter({
            hitPoints: {
              ...fullCharacter.hitPoints,
              current: Math.min(fullCharacter.hitPoints.max, fullCharacter.hitPoints.current + result.hpRecovered),
              hitDice: {
                ...fullCharacter.hitPoints.hitDice,
                remaining: fullCharacter.hitPoints.hitDice.remaining - result.hitDiceSpent,
              },
            },
          });
          // Update local state too
          setFullCharacter((prev) =>
            prev
              ? {
                  ...prev,
                  hitPoints: {
                    ...prev.hitPoints,
                    current: Math.min(prev.hitPoints.max, prev.hitPoints.current + result.hpRecovered),
                    hitDice: {
                      ...prev.hitPoints.hitDice,
                      remaining: prev.hitPoints.hitDice.remaining - result.hitDiceSpent,
                    },
                  },
                }
              : prev
          );
        } else if (data.rest === 'long') {
          // Full HP, recover half hit dice, recharge all abilities
          const hitDiceRecovered = Math.max(1, Math.floor(fullCharacter.hitPoints.hitDice.total / 2));
          updateActiveCharacter({
            hitPoints: {
              ...fullCharacter.hitPoints,
              current: fullCharacter.hitPoints.max,
              hitDice: {
                ...fullCharacter.hitPoints.hitDice,
                remaining: Math.min(
                  fullCharacter.hitPoints.hitDice.total,
                  fullCharacter.hitPoints.hitDice.remaining + hitDiceRecovered
                ),
              },
            },
          });
          setFullCharacter((prev) =>
            prev
              ? {
                  ...prev,
                  hitPoints: {
                    ...prev.hitPoints,
                    current: prev.hitPoints.max,
                    hitDice: {
                      ...prev.hitPoints.hitDice,
                      remaining: Math.min(
                        prev.hitPoints.hitDice.total,
                        prev.hitPoints.hitDice.remaining + hitDiceRecovered
                      ),
                    },
                  },
                }
              : prev
          );
        }
      }

      // Scene image — fire-and-forget background generation
      if (data.scene_image) {
        const imagePrompt = data.scene_image;
        fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt, task: 'image_scene', size: '1792x1024' }),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.imageUrl) {
              const imgMsg: ChatMsg = {
                id: `img-${Date.now()}`,
                role: 'assistant',
                content: `![Scene](${result.imageUrl})`,
                timestamp: Date.now(),
              };
              setChatMessages((prev) => [...prev, imgMsg]);
              addMessage({ ...imgMsg, timestamp: imgMsg.timestamp ?? Date.now() });
            }
          })
          .catch((err) => console.error('Scene image generation failed:', err));
      }

      // Dice check — open the DiceRoller modal
      if (data.dice_check) {
        setPendingDiceCheck({
          type: data.dice_check.type,
          ability: data.dice_check.ability,
          skill: data.dice_check.skill,
          dc: data.dice_check.dc,
          label: data.dice_check.label,
          advantage: data.dice_check.advantage,
          disadvantage: data.dice_check.disadvantage,
        });
      }

      // Shop open — generate merchant stock and open ShopView
      if (data.shop_open && world) {
        setShopLoading(true);
        fetch('/api/shop/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopType: data.shop_open.shop_type,
            merchantName: data.shop_open.merchant_name,
            shopName: data.shop_open.shop_name,
            world,
            location: gameClock?.timeOfDay || '',
            playerLevel: fullCharacter?.level || 1,
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.stock) {
              setActiveShop({
                shopName: result.shopName,
                merchantName: result.merchantName,
                stock: result.stock,
                sellMultiplier: result.buyPriceMultiplier || 0.4,
                haggleWillingness: result.haggleWillingness || 50,
              });
            }
          })
          .catch((err) => console.error('[shop] Generation failed:', err))
          .finally(() => setShopLoading(false));
      }

      // Travel trigger — opens TravelView with segment-by-segment progression
      if (data.travel && fullCharacter) {
        const dest = data.travel.destination;
        const terrain = (data.travel.terrain || 'plains') as TerrainType;
        const method = (data.travel.method || 'walking') as TravelMethod;
        const pace = (data.travel.pace || 'normal') as TravelPace;
        const hours = data.travel.distance_hours || 8;
        const terrainList: TerrainType[] = hours > 12
          ? [terrain, terrain, terrain]   // Long journeys get 3 segments
          : hours > 4
            ? [terrain, terrain]           // Medium journeys get 2 segments
            : [terrain];                   // Short journeys get 1 segment
        const plan = createTravelPlan(
          fullCharacter.currentLocation || 'Unknown',
          dest,
          method,
          pace,
          terrainList,
          hours,
        );
        setTravelPlan(plan);
        setTravelSegmentIndex(0);
        setTravelDiscoveries([]);
        setTravelEncounterPending(false);
      }

      // Crafting trigger — opens CraftingView
      if (data.crafting_open) {
        setCraftingStation(data.crafting_open.station_type || undefined);
        setCraftingOpen(true);
      }

      // Skill challenge — opens SkillChallengeView
      if (data.skill_challenge) {
        const sc = data.skill_challenge;
        const challenge = createChallenge(
          sc.name,
          sc.description,
          (sc.complexity || 'standard') as ChallengeComplexity,
          sc.allowed_skills?.map((s: string) => ({ skill: s, dc: 12, description: `Use ${s}` })) || [
            { skill: 'athletics', dc: 12, description: 'Use athletics' },
            { skill: 'acrobatics', dc: 12, description: 'Use acrobatics' },
            { skill: 'stealth', dc: 12, description: 'Use stealth' },
            { skill: 'persuasion', dc: 12, description: 'Use persuasion' },
            { skill: 'investigation', dc: 12, description: 'Use investigation' },
            { skill: 'perception', dc: 12, description: 'Use perception' },
          ],
          sc.stakes || 'Unknown consequences',
          [],
        );
        setActiveChallenge(challenge);
        setLastChallengeResult(undefined);
      }
    },
    [
      fullCharacter, world, activeQuests, knownNPCs, gameClock,
      updateLocation, updateActiveCharacter, setGameClock, setWeather,
      addActiveQuest, updateQuest, addKnownNPC, setCombatState, addMessage,
    ]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

      const userMsg: ChatMsg = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      // Optimistic update
      setChatMessages((prev) => [...prev, userMsg]);
      addMessage({ role: 'user', content: text, timestamp: Date.now() });
      setLoading(true);
      setStreamingContent('');

      try {
        const rawMessages = [...messages, { role: 'user' as const, content: text, timestamp: Date.now() }].map(
          (m) => ({ role: m.role, content: m.content })
        );
        // Compress history if it exceeds token budget
        const { messages: apiMessages, summary } = compressMessages(rawMessages, sessionSummaryRef.current);
        if (summary) sessionSummaryRef.current = summary;

        const response = await fetch('/api/dm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            characterId: localStorage.getItem('rpg-character-id') || undefined,
            worldId: localStorage.getItem('rpg-world-id') || activeWorldId || undefined,
            character: fullCharacter || undefined,
            world: world || undefined,
            activeQuests,
            knownNPCs,
            combatState,
            gameClock,
            weather,
          }),
        });

        if (!response.ok) throw new Error('Failed to get DM response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            fullResponse += chunk;
            setStreamingContent(fullResponse);
          }
        }

        // Finalize message — strip game-data block before storing
        setStreamingContent('');
        const cleanContent = stripGameDataBlock(fullResponse);
        const dmMsg: ChatMsg = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: cleanContent,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, dmMsg]);
        addMessage({
          role: 'assistant',
          content: cleanContent,
          timestamp: Date.now(),
        });

        // ── Parse & apply game-data block ──
        const gameData = parseGameData(fullResponse);
        if (gameData) {
          applyGameData(gameData);
        }
      } catch (error) {
        console.error('DM Error:', error);
        setStreamingContent('');
        addToast('Connection to the DM was disrupted', 'error');
        const errorMsg: ChatMsg = {
          id: `msg-error-${Date.now()}`,
          role: 'assistant',
          content:
            '*The magical connection to the Dungeon Master has been disrupted. The threads of fate resist your call. Try again...*',
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
        addMessage({
          role: 'assistant',
          content: errorMsg.content,
          timestamp: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    },
    [isLoading, messages, fullCharacter, world, activeQuests, knownNPCs, combatState, gameClock, weather, activeWorldId, applyGameData] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleActionClick = (action: string) => {
    sendMessage(action);
  };

  // ---- Travel handlers ----
  const handleTravelContinue = useCallback(() => {
    if (!travelPlan || !fullCharacter) return;
    const seg = travelPlan.segments[travelSegmentIndex];
    if (!seg) {
      // Arrived at destination
      updateLocation(travelPlan.to);
      updateActiveCharacter({ currentLocation: travelPlan.to });
      const hoursAdvanced = travelPlan.totalDistanceHours;
      const newClock = advanceClockTime(gameClock, Math.round(hoursAdvanced));
      setGameClock(newClock);
      setTravelPlan(null);
      addMessage({
        role: 'system',
        content: `You have arrived at **${travelPlan.to}** after a journey of ${Math.round(hoursAdvanced)} hours.`,
        timestamp: Date.now(),
      });
      return;
    }
    // Resolve segment
    const currentWeather = weather || { condition: 'clear' as const, temperature: 70, windSpeed: 5, visibility: 'clear' as const, narrativeDescription: 'Fair weather.', effects: [], travelModifier: 1.0, combatModifier: 1.0 };
    const wisBonus = fullCharacter.abilityScores?.wis?.modifier ?? 0;
    const result = resolveSegment(seg, currentWeather, wisBonus, 0, travelPlan.pace);

    // Collect discoveries
    if (result.discoveryMade && result.discovery) {
      setTravelDiscoveries(prev => [...prev, result.discovery!]);
    }

    // Check for encounter
    if (result.encounterTriggered) {
      setTravelEncounterPending(true);
    } else {
      setTravelSegmentIndex(prev => prev + 1);
    }
  }, [travelPlan, travelSegmentIndex, fullCharacter, gameClock, weather, updateLocation, updateActiveCharacter, setGameClock, addMessage]);

  const handleTravelCamp = useCallback(() => {
    // Making camp during travel: show rest menu
    setShowRestMenu(true);
  }, []);

  const handleTravelCancel = useCallback(() => {
    setTravelPlan(null);
    setTravelSegmentIndex(0);
    setTravelDiscoveries([]);
    setTravelEncounterPending(false);
    addMessage({ role: 'system', content: 'You abandon the journey and stop where you are.', timestamp: Date.now() });
  }, [addMessage]);

  const handleTravelEncounter = useCallback(() => {
    // Trigger combat via the DM — send a message that will trigger combat_start
    setTravelEncounterPending(false);
    setTravelSegmentIndex(prev => prev + 1);
    sendMessage('I investigate the danger on the road ahead.');
  }, [sendMessage]);

  // ---- Crafting handler ----
  const handleCraft = useCallback((recipeId: string) => {
    if (!fullCharacter || !world) return;
    const worldRecipes = getWorldCraftingRecipes(world);
    const recipe = worldRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Build materials from inventory (simple match by name)
    const materials = recipe.materials.map(m => ({
      id: `mat-${m.materialName}`,
      name: m.materialName,
      description: '',
      rarity: 'common' as const,
      quantity: m.quantity,
      quality: 'average' as const,
      properties: [] as string[],
      sourceType: 'purchased' as const,
    }));

    const result = craftItem(fullCharacter, recipe, materials, !!craftingStation);
    addMessage({
      role: 'system',
      content: `**Crafting:** ${result.narration}${result.xpGained ? ` (+${result.xpGained} XP)` : ''}`,
      timestamp: Date.now(),
    });

    if (result.xpGained) {
      updateActiveCharacter({
        xp: (fullCharacter.xp || 0) + result.xpGained,
      });
    }
  }, [fullCharacter, world, craftingStation, addMessage, updateActiveCharacter]);

  // Prepare crafting recipes for CraftingView
  const craftingRecipes = world ? getWorldCraftingRecipes(world)
    .filter(r => r.isDiscovered)
    .map(r => ({
      id: r.id,
      name: r.name,
      description: r.resultDescription,
      category: r.skill,
      resultRarity: 'uncommon' as const,
      materials: r.materials.map(m => ({ name: m.materialName, required: m.quantity, available: 0 })),
      craftingDC: r.difficultyDC,
      craftingTimeMinutes: r.craftingTimeHours * 60,
      requiredStation: r.stationType,
      unlocked: true,
    })) : [];

  // ---- Skill challenge handlers ----
  const handleChallengeAttempt = useCallback((skill: string, approach: string) => {
    if (!activeChallenge || !fullCharacter) return;
    const { challenge: updated, result } = attemptSkill(activeChallenge, fullCharacter, skill, approach);
    setActiveChallenge(updated);
    setLastChallengeResult(result);

    if (updated.isComplete) {
      const narration = getChallengeOutcomeNarration(updated);
      addMessage({ role: 'system', content: `**${updated.name}:** ${narration}`, timestamp: Date.now() });
      if (updated.outcome === 'success') {
        const xpGain = updated.successesRequired * 25;
        updateActiveCharacter({ xp: (fullCharacter.xp || 0) + xpGain });
      }
    }
  }, [activeChallenge, fullCharacter, addMessage, updateActiveCharacter]);

  const handleChallengeHint = useCallback(() => {
    if (!activeChallenge) return;
    const result = getHint(activeChallenge);
    if (result) {
      setActiveChallenge(result.challenge);
      addMessage({ role: 'system', content: `**Hint:** ${result.hint}`, timestamp: Date.now() });
    }
  }, [activeChallenge, addMessage]);

  const handleChallengeComplete = useCallback(() => {
    setActiveChallenge(null);
    setLastChallengeResult(undefined);
  }, []);

  // ---- Achievement check helper ----
  const runAchievementCheck = useCallback(() => {
    if (!fullCharacter) return;
    const stats = achievementStatsRef.current;
    const ctx: AchievementContext = {
      character: fullCharacter,
      totalEnemiesDefeated: stats.totalEnemiesDefeated,
      totalQuestsCompleted: stats.totalQuestsCompleted,
      totalNpcsRecruited: fullCharacter.companionIds?.length ?? 0,
      totalDeaths: 0,
      totalGoldEarned: stats.totalGoldEarned,
      totalGoldSpent: 0,
      totalSessionsPlayed: fullCharacter.sessionCount ?? 1,
      totalItemsCollected: stats.totalItemsCollected,
      totalSecretsDiscovered: stats.totalSecretsDiscovered,
      events: stats.events,
    };
    const alreadyIds = earnedAchievements.map(a => a.id);
    const newOnes = checkAchievements(ctx, alreadyIds);
    if (newOnes.length > 0) {
      setEarnedAchievements(prev => [...prev, ...newOnes]);
      setAchievementPopupQueue(prev => [...prev, ...newOnes]);
    }
  }, [fullCharacter, earnedAchievements]);

  const dismissAchievementPopup = useCallback(() => {
    setAchievementPopupQueue(prev => prev.slice(1));
  }, []);

  // ---- Level-up acceptance handler ----
  const handleAcceptLevelUp = useCallback(() => {
    if (!fullCharacter || !pendingLevelUp) return;
    const updates = applyLevelUp(fullCharacter, pendingLevelUp);
    updateActiveCharacter(updates);
    addMessage({
      role: 'system',
      content: `**🎉 ${fullCharacter.name} has reached Level ${pendingLevelUp.newLevel}!** HP increased by ${pendingLevelUp.hpGain}.${pendingLevelUp.newFeatures.length > 0 ? ' New abilities: ' + pendingLevelUp.newFeatures.map(f => f.name).join(', ') + '.' : ''}`,
      timestamp: Date.now(),
    });
    setPendingLevelUp(null);
    addToast(`🎉 Level ${pendingLevelUp.newLevel} reached!`, 'success');
    // Check for level-based achievements
    setTimeout(() => runAchievementCheck(), 100);
  }, [fullCharacter, pendingLevelUp, updateActiveCharacter, addMessage, runAchievementCheck, addToast]);

  // Handle combat ending — inject combat summary into chat, handle defeat
  const handleCombatEnd = useCallback(
    (endState: CombatState) => {
      if (endState.rewards) {
        const summary = [
          `**Combat ${endState.result === 'victory' ? 'Victory' : endState.result === 'fled' ? 'Escape' : endState.result === 'defeat' ? 'Defeat' : 'Ended'}!**`,
          endState.rewards.xpEarned > 0 ? `✨ Gained ${endState.rewards.xpEarned} XP` : '',
          endState.rewards.goldFound > 0 ? `💰 Found ${endState.rewards.goldFound} gold` : '',
          endState.rewards.narrativeOutcome || '',
        ]
          .filter(Boolean)
          .join('\n\n');

        const combatMsg: ChatMsg = {
          id: `combat-end-${Date.now()}`,
          role: 'system',
          content: summary,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, combatMsg]);
        addMessage({ role: 'assistant', content: summary, timestamp: Date.now() });

        // Track achievement stats from combat
        if (endState.result === 'victory') {
          achievementStatsRef.current.totalEnemiesDefeated += endState.enemies.length;
          if (endState.rewards?.goldFound) achievementStatsRef.current.totalGoldEarned += endState.rewards.goldFound;
          if (endState.enemies.some(e => e.name.toLowerCase().includes('dragon'))) {
            achievementStatsRef.current.events.push('dragon-defeated');
          }
          runAchievementCheck();
          addToast('⚔️ Combat victory!', 'success');
        } else if (endState.result === 'defeat') {
          addToast('💀 You have been defeated...', 'error');
        }

        // Update pacing after combat
        if (pacingState && fullCharacter) {
          const hpPct = Math.round((fullCharacter.hitPoints.current / fullCharacter.hitPoints.max) * 100);
          setPacingState(updatePacing(pacingState, 'combat', hpPct, 0, 0));
        }
      }

      // Handle defeat — create legacy and show epilogue
      if (endState.result === 'defeat' && fullCharacter && world) {
        const enemyNames = endState.enemies.map((e) => e.name).join(', ');
        const epilogueText = `${fullCharacter.name} fell in battle against ${enemyNames}. ` +
          `Though their journey ended here at level ${fullCharacter.level}, ` +
          `their deeds will be remembered in the Hall of Heroes.`;

        const legacy = retireCharacter(
          fullCharacter,
          world,
          {
            totalSessions: 1,
            totalPlayTimeMinutes: Math.floor((Date.now() - (fullCharacter.createdAt ? new Date(fullCharacter.createdAt).getTime() : Date.now())) / 60000),
            enemiesDefeated: endState.rewards?.xpEarned ? Math.floor(endState.rewards.xpEarned / 50) : 0,
            questsCompleted: activeQuests.filter((q) => q.status === 'completed').length,
            npcsRecruited: knownNPCs.filter((n) => n.isCompanion).length,
            deathsSuffered: 1,
            goldEarned: fullCharacter.gold || 0,
            goldSpent: 0,
            itemsCollected: fullCharacter.inventory?.length || 0,
            secretsDiscovered: 0,
          },
          epilogueText,
          'died'
        );

        setCharacterLegacy(legacy);
      }
    },
    [addMessage, fullCharacter, world, activeQuests, knownNPCs, runAchievementCheck, pacingState, setPacingState, addToast]
  );

  // Handle dice roll result — inject result into chat and send to DM
  const handleDiceResult = useCallback(
    (result: DiceRollResult) => {
      setPendingDiceCheck(null);
      const resultMsg: ChatMsg = {
        id: `dice-${Date.now()}`,
        role: 'system',
        content: `🎲 **${result.label}**: ${result.breakdown}${
          result.success !== undefined
            ? result.success
              ? ' — ✅ **Success!**'
              : ' — ❌ **Failure**'
            : ''
        }`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, resultMsg]);
      addMessage({ role: 'assistant', content: resultMsg.content, timestamp: Date.now() });

      // Send the result back to the DM so it can narrate the outcome
      sendMessage(
        `[Dice Roll Result: ${result.label} — rolled ${result.naturalRoll} + ${result.modifier} = ${result.total}${
          result.dc ? ` vs DC ${result.dc}` : ''
        }${result.success !== undefined ? (result.success ? ' (SUCCESS)' : ' (FAILURE)') : ''}]`
      );
    },
    [addMessage, sendMessage]
  );

  // Handle short rest via RestMenu
  const handleShortRest = useCallback(
    (hitDice: number) => {
      if (!fullCharacter) return;
      setShowRestMenu(false);
      const result = processShortRest(fullCharacter, hitDice);
      const newHP = Math.min(fullCharacter.hitPoints.max, fullCharacter.hitPoints.current + result.hpRecovered);
      updateActiveCharacter({
        hitPoints: {
          ...fullCharacter.hitPoints,
          current: newHP,
          hitDice: {
            ...fullCharacter.hitPoints.hitDice,
            remaining: fullCharacter.hitPoints.hitDice.remaining - result.hitDiceSpent,
          },
        },
      });
      setFullCharacter((prev) =>
        prev
          ? {
              ...prev,
              hitPoints: {
                ...prev.hitPoints,
                current: Math.min(prev.hitPoints.max, prev.hitPoints.current + result.hpRecovered),
                hitDice: {
                  ...prev.hitPoints.hitDice,
                  remaining: prev.hitPoints.hitDice.remaining - result.hitDiceSpent,
                },
              },
            }
          : prev
      );
      const restMsg: ChatMsg = {
        id: `rest-${Date.now()}`,
        role: 'system',
        content: `🌙 **Short Rest** — Recovered ${result.hpRecovered} HP (spent ${result.hitDiceSpent} hit dice). HP: ${newHP}/${fullCharacter.hitPoints.max}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, restMsg]);
      addMessage({ role: 'assistant', content: restMsg.content, timestamp: Date.now() });

      // Update pacing after short rest
      if (pacingState) {
        const hpPct = Math.round((newHP / fullCharacter.hitPoints.max) * 100);
        setPacingState(updatePacing(pacingState, 'rest', hpPct, 0, 0));
      }
    },
    [fullCharacter, updateActiveCharacter, addMessage, pacingState, setPacingState]
  );

  // Handle long rest via RestMenu — uses rest-engine for proper spell slot, condition, and exhaustion recovery
  const handleLongRest = useCallback(() => {
    if (!fullCharacter) return;
    setShowRestMenu(false);

    // Create a basic camp setup and run the full long rest engine
    const camp = createCampSetup('current location', 'natural_cover', true);
    const restResult = processLongRest(fullCharacter, camp, [], [], false);
    const restoredCharacter = applyLongRestToCharacter(fullCharacter, restResult);

    // Apply to store and local state
    updateActiveCharacter({
      hitPoints: restoredCharacter.hitPoints,
      spellcasting: restoredCharacter.spellcasting,
      features: restoredCharacter.features,
      conditions: restoredCharacter.conditions,
      exhaustionLevel: restoredCharacter.exhaustionLevel,
    });
    setFullCharacter(restoredCharacter);

    // Build summary message with actual results
    const parts: string[] = [`HP: ${restoredCharacter.hitPoints.current}/${restoredCharacter.hitPoints.max}`];
    if (restResult.hitDiceRecovered > 0) parts.push(`Recovered ${restResult.hitDiceRecovered} hit dice`);
    if (restResult.spellSlotsRecovered) parts.push('Spell slots restored');
    if (restResult.abilitiesRecharged.length > 0) parts.push(`Abilities recharged: ${restResult.abilitiesRecharged.join(', ')}`);
    if (restResult.conditionsRemoved.length > 0) parts.push(`Conditions cleared: ${restResult.conditionsRemoved.join(', ')}`);
    if (restResult.exhaustionReduced > 0) parts.push(`Exhaustion reduced by ${restResult.exhaustionReduced}`);

    const restMsg: ChatMsg = {
      id: `rest-${Date.now()}`,
      role: 'system',
      content: `🏕️ **Long Rest** — ${restResult.narration}\n${parts.join(' • ')}`,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, restMsg]);
    addMessage({ role: 'assistant', content: restMsg.content, timestamp: Date.now() });

    // Update pacing after long rest
    if (pacingState) {
      const hpPct = Math.round((restoredCharacter.hitPoints.current / restoredCharacter.hitPoints.max) * 100);
      setPacingState(updatePacing(pacingState, 'rest', hpPct, 0, 0));
    }

    // Also tell the DM about the long rest so narrative can advance
    sendMessage('I set up camp and take a long rest for the night.');
  }, [fullCharacter, updateActiveCharacter, addMessage, sendMessage, pacingState, setPacingState]);

  // Handle NPC interaction from sidebar
  const handleNPCDialogue = useCallback(
    (npc: NPC) => {
      setSelectedNPC(null);
      sendMessage(`I approach ${npc.name} and strike up a conversation.`);
    },
    [sendMessage]
  );

  const handleNPCTrade = useCallback(
    (npc: NPC) => {
      setSelectedNPC(null);
      sendMessage(`I ask ${npc.name} to show me their wares.`);
    },
    [sendMessage]
  );

  // ── Shop handlers ──
  const handleShopBuy = useCallback(
    (mi: MerchantItem) => {
      if (!fullCharacter || fullCharacter.gold < mi.price) return;
      const newGold = fullCharacter.gold - mi.price;
      const newInventory = [...(fullCharacter.inventory || []), mi.item.name];
      updateActiveCharacter({ gold: newGold, inventory: newInventory });
      setFullCharacter((prev) =>
        prev ? { ...prev, gold: newGold, inventory: newInventory } : prev
      );
      // Remove from shop stock or decrease quantity
      setActiveShop((prev) => {
        if (!prev) return prev;
        const updated = prev.stock
          .map((s) => (s === mi ? { ...s, quantity: s.quantity - 1 } : s))
          .filter((s) => s.quantity > 0);
        return { ...prev, stock: updated };
      });
      const buyMsg: ChatMsg = {
        id: `shop-buy-${Date.now()}`,
        role: 'system',
        content: `💰 Purchased **${mi.item.name}** for ${mi.price}g. (${newGold}g remaining)`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, buyMsg]);
      addMessage({ role: 'assistant', content: buyMsg.content, timestamp: Date.now() });
    },
    [fullCharacter, updateActiveCharacter, addMessage]
  );

  const handleShopSell = useCallback(
    (item: Item) => {
      if (!fullCharacter) return;
      const sellPrice = Math.max(1, Math.round((item.sellValue || item.baseValue || 10) * (activeShop?.sellMultiplier || 0.4)));
      const newGold = fullCharacter.gold + sellPrice;
      const idx = fullCharacter.inventory.findIndex(
        (name) => name.toLowerCase() === item.name.toLowerCase()
      );
      if (idx === -1) return;
      const newInventory = [...fullCharacter.inventory];
      newInventory.splice(idx, 1);
      updateActiveCharacter({ gold: newGold, inventory: newInventory });
      setFullCharacter((prev) =>
        prev ? { ...prev, gold: newGold, inventory: newInventory } : prev
      );
      const sellMsg: ChatMsg = {
        id: `shop-sell-${Date.now()}`,
        role: 'system',
        content: `💰 Sold **${item.name}** for ${sellPrice}g. (${newGold}g total)`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, sellMsg]);
      addMessage({ role: 'assistant', content: sellMsg.content, timestamp: Date.now() });
    },
    [fullCharacter, activeShop, updateActiveCharacter, addMessage]
  );

  const handleShopHaggle = useCallback(
    (mi: MerchantItem) => {
      setHaggleItem(mi);
    },
    []
  );

  const handleHaggleResolve = useCallback(
    (result: { success: boolean; finalPrice: number; reaction: string }) => {
      if (!haggleItem) return;
      // Update the item's price in the shop
      setActiveShop((prev) => {
        if (!prev) return prev;
        const updated = prev.stock.map((s) =>
          s === haggleItem ? { ...s, price: result.finalPrice } : s
        );
        return { ...prev, stock: updated };
      });
      const haggleMsg: ChatMsg = {
        id: `haggle-${Date.now()}`,
        role: 'system',
        content: `🤝 ${result.reaction} (${haggleItem.item.name}: ${haggleItem.price}g → ${result.finalPrice}g)`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, haggleMsg]);
      addMessage({ role: 'assistant', content: haggleMsg.content, timestamp: Date.now() });
      setHaggleItem(null);
    },
    [haggleItem, addMessage]
  );

  // Is combat active?
  const inCombat = combatState && combatState.phase !== 'idle';

  // Show nothing until initialized
  if (!initialized) {
    return <LoadingScreen message="Loading your adventure..." />;
  }

  // Derive display character info from fullCharacter
  const displayName = fullCharacter?.name || 'Adventurer';
  const displayClass = fullCharacter?.class || '';
  const displayLevel = fullCharacter?.level || 1;
  const displayHP = fullCharacter
    ? fullCharacter.hitPoints
    : { current: 10, max: 10 };

  return (
    <main className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Settings provider — applies CSS variables from user settings */}
      <SettingsProvider />

      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area + Input (or Combat View) */}
        <div className="flex-1 flex flex-col min-w-0">
          {inCombat && fullCharacter ? (
            <CombatView
              character={fullCharacter}
              onCombatEnd={handleCombatEnd}
            />
          ) : travelPlan ? (
            <div className="flex-1 overflow-y-auto p-4">
              <TravelView
                plan={travelPlan}
                currentSegmentIndex={travelSegmentIndex}
                onContinue={handleTravelContinue}
                onMakeCamp={handleTravelCamp}
                onCancel={handleTravelCancel}
                discoveries={travelDiscoveries}
                encounterPending={travelEncounterPending}
                onResolveEncounter={handleTravelEncounter}
              />
            </div>
          ) : (
            <>
              <ChatArea
                messages={chatMessages}
                isLoading={isLoading}
                streamingContent={streamingContent || undefined}
                onActionClick={handleActionClick}
              />
              <QuickActions
                onAction={sendMessage}
                disabled={isLoading}
              />
              <InputBar onSend={sendMessage} disabled={isLoading} />
            </>
          )}
        </div>

        {/* Character Sidebar — Desktop */}
        <div className="hidden lg:flex w-72 xl:w-80 border-l border-slate-700/50 bg-slate-900/50 flex-col overflow-y-auto">
          {fullCharacter ? (
            <CharacterSheet character={fullCharacter} />
          ) : (
            <CharacterSidebar
              name={displayName}
              className={displayClass}
              level={displayLevel}
              hp={displayHP}
              character={fullCharacter}
            />
          )}

          {/* Rest Button */}
          {fullCharacter && !inCombat && (
            <div className="px-3 py-2 border-t border-slate-700/30">
              <button
                onClick={() => setShowRestMenu(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/40 rounded-lg text-sm text-purple-300 transition-colors"
              >
                🌙 Rest & Recovery
              </button>
            </div>
          )}

          {/* Active Quests */}
          {activeQuests.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-700/30">
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Active Quests</h4>
              <div className="space-y-2">
                {activeQuests
                  .filter((q) => q.status === 'active')
                  .map((quest) => (
                    <QuestTracker
                      key={quest.id}
                      questId={quest.id}
                      title={quest.title}
                      description={quest.logline}
                      objectives={
                        quest.acts[quest.currentAct]?.objectives
                          ?.filter((o) => !o.isHidden)
                          .map((o) => ({
                            text: o.description,
                            completed: o.isCompleted,
                            optional: o.isOptional,
                          })) || []
                      }
                      priority={
                        quest.type === 'main'
                          ? 'main'
                          : quest.type === 'personal' || quest.type === 'companion'
                          ? 'personal'
                          : 'side'
                      }
                      isActive={quest.status === 'active'}
                      onClick={() =>
                        sendMessage(`I want to focus on the quest: ${quest.title}`)
                      }
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Known NPCs */}
          {knownNPCs.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-700/30">
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Known NPCs</h4>
              <div className="space-y-2">
                {knownNPCs.slice(0, 5).map((npc) => (
                  <NPCPanel
                    key={npc.id}
                    npc={npc}
                    compact
                    onDialogue={() => handleNPCDialogue(npc)}
                  />
                ))}
                {knownNPCs.length > 5 && (
                  <p className="text-[10px] text-slate-600 text-center">
                    +{knownNPCs.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-lg"
        aria-label="Toggle character sheet"
      >
        <User className="w-5 h-5 text-sky-400" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-slate-900 border-l border-slate-700 overflow-y-auto animate-slideUp">
            <div className="p-2 border-b border-slate-700 flex justify-between items-center">
              <span className="text-sm font-cinzel text-amber-400">
                Character Sheet
              </span>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-slate-500 hover:text-slate-300 px-2 py-1"
              >
                ✕
              </button>
            </div>
            {fullCharacter ? (
              <CharacterSheet character={fullCharacter} />
            ) : (
              <CharacterSidebar
                name={displayName}
                className={displayClass}
                level={displayLevel}
                hp={displayHP}
                character={fullCharacter}
              />
            )}

            {/* Rest Button — Mobile */}
            {fullCharacter && !inCombat && (
              <div className="px-3 py-2 border-t border-slate-700/30">
                <button
                  onClick={() => { setShowRestMenu(true); setShowSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/40 rounded-lg text-sm text-purple-300 transition-colors"
                >
                  🌙 Rest & Recovery
                </button>
              </div>
            )}

            {/* Active Quests — Mobile */}
            {activeQuests.length > 0 && (
              <div className="px-3 py-2 border-t border-slate-700/30">
                <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Active Quests</h4>
                <div className="space-y-2">
                  {activeQuests
                    .filter((q) => q.status === 'active')
                    .map((quest) => (
                      <QuestTracker
                        key={quest.id}
                        questId={quest.id}
                        title={quest.title}
                        description={quest.logline}
                        objectives={
                          quest.acts[quest.currentAct]?.objectives
                            ?.filter((o) => !o.isHidden)
                            .map((o) => ({
                              text: o.description,
                              completed: o.isCompleted,
                              optional: o.isOptional,
                            })) || []
                        }
                        priority={
                          quest.type === 'main'
                            ? 'main'
                            : quest.type === 'personal' || quest.type === 'companion'
                            ? 'personal'
                            : 'side'
                        }
                        isActive={quest.status === 'active'}
                        onClick={() => {
                          setShowSidebar(false);
                          sendMessage(`I want to focus on the quest: ${quest.title}`);
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Known NPCs — Mobile */}
            {knownNPCs.length > 0 && (
              <div className="px-3 py-2 border-t border-slate-700/30">
                <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Known NPCs</h4>
                <div className="space-y-2">
                  {knownNPCs.slice(0, 5).map((npc) => (
                    <NPCPanel
                      key={npc.id}
                      npc={npc}
                      compact
                      onDialogue={() => { setShowSidebar(false); handleNPCDialogue(npc); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Overlays ── */}

      {/* Dice Roller Modal */}
      {pendingDiceCheck && fullCharacter && (
        <DiceRoller
          check={pendingDiceCheck}
          abilityScores={fullCharacter.abilityScores as unknown as Record<string, { score: number; modifier: number }>}
          proficiencyBonus={fullCharacter.proficiencyBonus}
          proficientSkills={fullCharacter.skills?.filter((s) => s.proficient).map((s) => s.name) || []}
          onResult={handleDiceResult}
          onDismiss={() => setPendingDiceCheck(null)}
        />
      )}

      {/* Rest Menu Modal */}
      {showRestMenu && fullCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <RestMenu
            character={fullCharacter}
            onShortRest={handleShortRest}
            onLongRest={handleLongRest}
            onCancel={() => setShowRestMenu(false)}
            safeLocation={!inCombat}
          />
        </div>
      )}

      {/* NPC Detail Panel — shown when clicking an NPC for full view */}
      {selectedNPC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md mx-4">
            <NPCPanel
              npc={selectedNPC}
              onClose={() => setSelectedNPC(null)}
              onDialogue={() => handleNPCDialogue(selectedNPC)}
              onTrade={() => handleNPCTrade(selectedNPC)}
            />
          </div>
        </div>
      )}

      {/* Loot Popup — shown when items are gained */}
      {pendingLoot && (
        <LootPopup
          loot={pendingLoot}
          onTakeAll={() => setPendingLoot(null)}
          onTakeSelected={(selectedIds) => {
            // Items are already in inventory; remove any the player didn't select
            if (fullCharacter && pendingLoot.items.length > 0) {
              const selectedSet = new Set(selectedIds);
              const rejectedNames = pendingLoot.items
                .filter((item) => !selectedSet.has(item.id))
                .map((item) => item.name.toLowerCase());
              if (rejectedNames.length > 0) {
                const newInventory = (fullCharacter.inventory || []).filter(
                  (name) => !rejectedNames.includes(name.toLowerCase())
                );
                updateActiveCharacter({ inventory: newInventory });
                setFullCharacter((prev) =>
                  prev ? { ...prev, inventory: newInventory } : prev
                );
              }
            }
            setPendingLoot(null);
          }}
          onClose={() => setPendingLoot(null)}
        />
      )}

      {/* Shop View — merchant buy/sell interface */}
      {activeShop && fullCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl mx-4">
            <ShopView
              shopName={activeShop.shopName}
              merchantName={activeShop.merchantName}
              stock={activeShop.stock}
              playerGold={fullCharacter.gold}
              playerItems={stringsToItems(fullCharacter.inventory || [])}
              onBuy={handleShopBuy}
              onSell={handleShopSell}
              onHaggle={handleShopHaggle}
              onClose={() => setActiveShop(null)}
              sellMultiplier={activeShop.sellMultiplier}
            />
          </div>
        </div>
      )}

      {/* Shop Loading Indicator */}
      {shopLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 text-center">
            <div className="text-3xl animate-bounce mb-2">🏪</div>
            <p className="text-sm text-slate-300">Preparing merchant wares...</p>
          </div>
        </div>
      )}

      {/* Haggle Dialog — charisma check mini-game */}
      {haggleItem && fullCharacter && (
        <HaggleDialog
          item={haggleItem.item}
          originalPrice={haggleItem.price}
          charismaModifier={fullCharacter.abilityScores.cha.modifier}
          proficiencyBonus={fullCharacter.proficiencyBonus}
          hasPersuasion={fullCharacter.skills?.some((s) => s.name.toLowerCase() === 'persuasion' && s.proficient) || false}
          onResolve={handleHaggleResolve}
          onCancel={() => setHaggleItem(null)}
        />
      )}

      {/* Epilogue View — shown on character death/defeat */}
      {characterLegacy && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 overflow-y-auto backdrop-blur-sm animate-fadeIn">
          <EpilogueView
            legacy={characterLegacy}
            onNewGamePlus={() => {
              setCharacterLegacy(null);
              router.push('/');
            }}
            onReturnToHall={() => {
              setCharacterLegacy(null);
              router.push('/');
            }}
          />
        </div>
      )}

      {/* Crafting View — crafting station interface */}
      {craftingOpen && fullCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl mx-4">
            <CraftingView
              recipes={craftingRecipes}
              characterSkillBonus={fullCharacter.proficiencyBonus}
              currentStation={craftingStation}
              onCraft={handleCraft}
              onClose={() => setCraftingOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Skill Challenge View — multi-phase ability check */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl mx-4">
            <SkillChallengeView
              challenge={activeChallenge}
              onAttempt={handleChallengeAttempt}
              onRequestHint={handleChallengeHint}
              lastResult={lastChallengeResult}
              onComplete={handleChallengeComplete}
            />
          </div>
        </div>
      )}

      {/* Level-Up Ceremony */}
      {pendingLevelUp && fullCharacter && (
        <LevelUpCeremony
          character={fullCharacter}
          gains={pendingLevelUp}
          onAccept={handleAcceptLevelUp}
        />
      )}

      {/* Achievement Popup */}
      {achievementPopupQueue.length > 0 && (
        <AchievementPopup
          achievement={achievementPopupQueue[0]}
          onDismiss={dismissAchievementPopup}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}


