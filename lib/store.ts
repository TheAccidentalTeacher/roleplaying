import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character as FullCharacter } from '@/lib/types/character'
import type { WorldRecord } from '@/lib/types/world'
import type { CombatState } from '@/lib/types/combat'
import type { GameClock, Weather } from '@/lib/types/exploration'
import type { SessionStructure, PacingState } from '@/lib/types/session'
import type { Quest } from '@/lib/types/quest'
import type { NPC } from '@/lib/types/npc'
import type { UIState, UserSettings } from '@/lib/types/ui'
import { getTimeOfDay } from '@/lib/engines/clock-engine'

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
  // ---- Core fields ----
  messages: Message[]
  currentLocation: string
  isLoading: boolean

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

  // ---- Actions ----
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  updateLocation: (location: string) => void
  setLoading: (loading: boolean) => void
  resetGame: () => void

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
  setSettings: (updates: Partial<UserSettings>) => void
}

// ---- Store ----

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // ---- Defaults ----
      messages: [],
      currentLocation: 'Unknown',
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

      // ---- Actions ----

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setMessages: (messages) => set({ messages }),

      updateLocation: (location) => set({ currentLocation: location }),

      setLoading: (loading) => set({ isLoading: loading }),

      resetGame: () =>
        set({
          messages: [],
          currentLocation: 'Unknown',
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
          let newHour = state.gameClock.hour + hours
          let newDay = state.gameClock.day
          let newMonth = state.gameClock.month
          let newYear = state.gameClock.year
          let daysSinceStart = state.gameClock.daysSinceStart

          // Roll over hours → days
          while (newHour >= 24) {
            newHour -= 24
            newDay += 1
            daysSinceStart += 1
          }
          while (newHour < 0) {
            newHour += 24
            newDay -= 1
            daysSinceStart -= 1
          }

          // Roll over days → months (30 days per month)
          while (newDay > 30) {
            newDay -= 30
            newMonth += 1
          }

          // Roll over months → years (12 months per year)
          while (newMonth > 12) {
            newMonth -= 12
            newYear += 1
          }

          // Derive season from month
          let currentSeason = state.gameClock.currentSeason
          if (newMonth >= 3 && newMonth <= 5) currentSeason = 'spring'
          else if (newMonth >= 6 && newMonth <= 8) currentSeason = 'summer'
          else if (newMonth >= 9 && newMonth <= 11) currentSeason = 'autumn'
          else currentSeason = 'winter'

          const timeOfDay = getTimeOfDay(Math.floor(newHour))
          return {
            gameClock: {
              ...state.gameClock,
              hour: Math.floor(newHour),
              day: newDay,
              month: newMonth,
              year: newYear,
              daysSinceStart: Math.max(0, daysSinceStart),
              timeOfDay,
              currentSeason,
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
        // Persist essential game state
        characters: state.characters,
        activeCharacterId: state.activeCharacterId,
        activeWorld: state.activeWorld,
        activeWorldId: state.activeWorldId,
        gameClock: state.gameClock,
        weather: state.weather,
        currentLocation: state.currentLocation,
        // Persist messages so chat history survives refresh
        messages: state.messages,
        activeQuests: state.activeQuests,
        knownNPCs: state.knownNPCs,
        // Persist combat so refresh mid-fight resumes properly
        combatState: state.combatState,
        // Persist session so session number & recap survive refresh
        sessionState: state.sessionState,
        // Persist pacing so encounter/rest cadence survives refresh
        pacingState: state.pacingState,
        uiState: {
          settings: state.uiState.settings,
        },
      }),
    }
  )
)

// getTimeOfDay imported from @/lib/engines/clock-engine
