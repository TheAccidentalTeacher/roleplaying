import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character as FullCharacter } from '@/lib/types/character'
import type { WorldRecord } from '@/lib/types/world'
import type { CombatState } from '@/lib/types/combat'
import type { GameClock, Weather } from '@/lib/types/exploration'
import type { SessionStructure, PacingState } from '@/lib/types/session'
import type { Quest } from '@/lib/types/quest'
import type { NPC } from '@/lib/types/npc'
import type { UIState, ChatMessage, Toast, ModalState, UserSettings } from '@/lib/types/ui'

// ---- Legacy Character type (backward compat for existing pages) ----
// These pages will be rewritten in Phase 1.3 / 2.2
export interface Character {
  id: string
  name: string
  class: string
  level: number
  experience: number
  hitPoints: {
    current: number
    max: number
  }
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  background: string
  inventory: string[]
  gold: number
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

// ---- Default values ----

const defaultGameClock: GameClock = {
  year: 1,
  month: 1,
  day: 1,
  hour: 8,
  timeOfDay: 'morning',
  calendarName: 'Standard Calendar',
  monthNames: ['Deepwinter', 'Thawmonth', 'Greenrise', 'Rainmoot', 'Sunpeak', 'Highsun', 'Leaffall', 'Harvestide', 'Frostmarch', 'Darkmonth', 'Snowcloak', 'Longnight'],
  weekLength: 7,
  dayNames: ['Moonday', 'Starday', 'Windday', 'Earthday', 'Fireday', 'Lightday', 'Restday'],
  daysSinceStart: 0,
  currentSeason: 'spring',
}

const defaultWeather: Weather = {
  current: 'clear',
  temperature: 'mild',
  wind: 'calm',
  visibility: 'clear',
  duration: 12,
  travelModifier: 1.0,
  combatModifiers: [],
  perceptionModifier: 0,
  survivalDC: 5,
  narrativeDescription: 'A mild day with clear skies.',
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 'medium',
  animations: 'full',
  soundEnabled: false,
  musicEnabled: false,
  autoSave: true,
  autoSaveIntervalMs: 60000,
  showDiceRolls: true,
  showDamageNumbers: true,
  narrativeSpeed: 'normal',
  tooltipsEnabled: true,
  compactMode: false,
}

const defaultUIState: UIState = {
  activeTab: 'narrative',
  characterSheetTab: 'overview',
  panelMode: 'collapsed',
  inventoryView: 'list',
  mapView: 'world',
  modal: { isOpen: false, type: null },
  toasts: [],
  isSidebarOpen: false,
  isLoading: false,
  loadingMessage: '',
  chatMessages: [],
  diceHistory: [],
  settings: defaultSettings,
}

// ---- State interface ----

export interface GameState {
  // ---- Legacy fields (backward compat) ----
  character: Character | null
  messages: Message[]
  currentLocation: string
  questLog: string[]
  isLoading: boolean

  // ---- New full-system fields ----
  // Characters & World
  characters: FullCharacter[]
  activeCharacterId: string | null
  activeWorld: WorldRecord | null
  activeWorldId: string | null

  // Combat
  combatState: CombatState | null

  // Time & Environment
  gameClock: GameClock
  weather: Weather

  // Session & Pacing
  sessionState: SessionStructure | null
  pacingState: PacingState | null

  // Quests & NPCs (in-memory cache)
  activeQuests: Quest[]
  knownNPCs: NPC[]

  // UI
  uiState: UIState

  // ---- Legacy actions (backward compat) ----
  setCharacter: (character: Character) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  updateLocation: (location: string) => void
  addQuest: (quest: string) => void
  setLoading: (loading: boolean) => void
  resetGame: () => void

  // ---- New actions ----
  // Characters
  setActiveCharacter: (character: FullCharacter) => void
  updateActiveCharacter: (updates: Partial<FullCharacter>) => void
  addCharacter: (character: FullCharacter) => void
  removeCharacter: (id: string) => void

  // World
  setActiveWorld: (world: WorldRecord, worldId: string) => void
  clearWorld: () => void

  // Combat
  setCombatState: (combat: CombatState | null) => void
  updateCombatState: (updates: Partial<CombatState>) => void

  // Time & Environment
  setGameClock: (clock: GameClock) => void
  advanceTime: (hours: number) => void
  setWeather: (weather: Weather) => void

  // Session
  setSessionState: (session: SessionStructure) => void
  setPacingState: (pacing: PacingState) => void

  // Quests
  setActiveQuests: (quests: Quest[]) => void
  addActiveQuest: (quest: Quest) => void
  updateQuest: (questId: string, updates: Partial<Quest>) => void

  // NPCs
  setKnownNPCs: (npcs: NPC[]) => void
  addKnownNPC: (npc: NPC) => void
  updateNPC: (npcId: string, updates: Partial<NPC>) => void

  // UI
  setUIState: (updates: Partial<UIState>) => void
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
  setModal: (modal: ModalState) => void
  closeModal: () => void
  addChatMessage: (message: ChatMessage) => void
  setChatMessages: (messages: ChatMessage[]) => void
  setSettings: (updates: Partial<UserSettings>) => void
}

// ---- Store ----

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // ---- Legacy defaults ----
      character: null,
      messages: [],
      currentLocation: 'Unknown',
      questLog: [],
      isLoading: false,

      // ---- New defaults ----
      characters: [],
      activeCharacterId: null,
      activeWorld: null,
      activeWorldId: null,
      combatState: null,
      gameClock: defaultGameClock,
      weather: defaultWeather,
      sessionState: null,
      pacingState: null,
      activeQuests: [],
      knownNPCs: [],
      uiState: defaultUIState,

      // ---- Legacy actions ----
      setCharacter: (character) => set({ character }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setMessages: (messages) => set({ messages }),

      updateLocation: (location) => set({ currentLocation: location }),

      addQuest: (quest) =>
        set((state) => ({
          questLog: [...state.questLog, quest],
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      resetGame: () =>
        set({
          character: null,
          messages: [],
          currentLocation: 'Unknown',
          questLog: [],
          isLoading: false,
          characters: [],
          activeCharacterId: null,
          activeWorld: null,
          activeWorldId: null,
          combatState: null,
          gameClock: defaultGameClock,
          weather: defaultWeather,
          sessionState: null,
          pacingState: null,
          activeQuests: [],
          knownNPCs: [],
          uiState: defaultUIState,
        }),

      // ---- Character actions ----
      setActiveCharacter: (character) =>
        set((state) => {
          const exists = state.characters.some((c) => c.id === character.id)
          return {
            activeCharacterId: character.id,
            characters: exists
              ? state.characters.map((c) => (c.id === character.id ? character : c))
              : [...state.characters, character],
          }
        }),

      updateActiveCharacter: (updates) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === state.activeCharacterId ? { ...c, ...updates } : c
          ),
        })),

      addCharacter: (character) =>
        set((state) => ({
          characters: [...state.characters, character],
        })),

      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
        })),

      // ---- World actions ----
      setActiveWorld: (world, worldId) => set({ activeWorld: world, activeWorldId: worldId }),

      clearWorld: () => set({ activeWorld: null, activeWorldId: null }),

      // ---- Combat actions ----
      setCombatState: (combat) => set({ combatState: combat }),

      updateCombatState: (updates) =>
        set((state) => ({
          combatState: state.combatState ? { ...state.combatState, ...updates } : null,
        })),

      // ---- Time & Environment ----
      setGameClock: (clock) => set({ gameClock: clock }),

      advanceTime: (hours) =>
        set((state) => {
          const newHour = state.gameClock.hour + hours
          const newDay = state.gameClock.day + Math.floor(newHour / 24)
          const timeOfDay = getTimeOfDay(newHour % 24)
          return {
            gameClock: {
              ...state.gameClock,
              hour: newHour % 24,
              day: newDay,
              daysSinceStart: state.gameClock.daysSinceStart + Math.floor(hours / 24),
              timeOfDay,
            },
          }
        }),

      setWeather: (weather) => set({ weather }),

      // ---- Session ----
      setSessionState: (session) => set({ sessionState: session }),
      setPacingState: (pacing) => set({ pacingState: pacing }),

      // ---- Quests ----
      setActiveQuests: (quests) => set({ activeQuests: quests }),

      addActiveQuest: (quest) =>
        set((state) => ({
          activeQuests: [...state.activeQuests, quest],
        })),

      updateQuest: (questId, updates) =>
        set((state) => ({
          activeQuests: state.activeQuests.map((q) =>
            q.id === questId ? { ...q, ...updates } : q
          ),
        })),

      // ---- NPCs ----
      setKnownNPCs: (npcs) => set({ knownNPCs: npcs }),

      addKnownNPC: (npc) =>
        set((state) => ({
          knownNPCs: [...state.knownNPCs, npc],
        })),

      updateNPC: (npcId, updates) =>
        set((state) => ({
          knownNPCs: state.knownNPCs.map((n) =>
            n.id === npcId ? { ...n, ...updates } : n
          ),
        })),

      // ---- UI ----
      setUIState: (updates) =>
        set((state) => ({
          uiState: { ...state.uiState, ...updates },
        })),

      addToast: (toast) =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            toasts: [...state.uiState.toasts, toast],
          },
        })),

      removeToast: (id) =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            toasts: state.uiState.toasts.filter((t) => t.id !== id),
          },
        })),

      setModal: (modal) =>
        set((state) => ({
          uiState: { ...state.uiState, modal },
        })),

      closeModal: () =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            modal: { isOpen: false, type: null },
          },
        })),

      addChatMessage: (message) =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            chatMessages: [...state.uiState.chatMessages, message],
          },
        })),

      setChatMessages: (messages) =>
        set((state) => ({
          uiState: { ...state.uiState, chatMessages: messages },
        })),

      setSettings: (updates) =>
        set((state) => ({
          uiState: {
            ...state.uiState,
            settings: { ...state.uiState.settings, ...updates },
          },
        })),
    }),
    {
      name: 'ai-rpg-storage',
      partialize: (state) => ({
        // Persist only essential state, not transient UI
        character: state.character,
        characters: state.characters,
        activeCharacterId: state.activeCharacterId,
        activeWorld: state.activeWorld,
        activeWorldId: state.activeWorldId,
        gameClock: state.gameClock,
        weather: state.weather,
        currentLocation: state.currentLocation,
        uiState: {
          settings: state.uiState.settings,
        },
      }),
    }
  )
)

// ---- Helper ----

function getTimeOfDay(hour: number): 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight' {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 13) return 'midday'
  if (hour >= 13 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 19) return 'dusk'
  if (hour >= 19 && hour < 21) return 'evening'
  if (hour >= 21 || hour < 1) return 'night'
  return 'midnight'
}
