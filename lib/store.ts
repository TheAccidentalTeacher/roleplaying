import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export interface GameState {
  character: Character | null
  messages: Message[]
  currentLocation: string
  questLog: string[]
  isLoading: boolean
  
  setCharacter: (character: Character) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  updateLocation: (location: string) => void
  addQuest: (quest: string) => void
  setLoading: (loading: boolean) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      character: null,
      messages: [],
      currentLocation: 'Unknown',
      questLog: [],
      isLoading: false,

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
        }),
    }),
    {
      name: 'ai-rpg-storage',
    }
  )
)
