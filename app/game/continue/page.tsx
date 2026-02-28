'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'

export default function ContinuePage() {
  const router = useRouter()
  const { characters, activeCharacterId, messages } = useGameStore()

  useEffect(() => {
    const hasCharacter = characters.length > 0 && activeCharacterId
    const hasGameInProgress = messages.length > 0

    if (hasCharacter || hasGameInProgress) {
      router.push('/game')
    } else {
      // No saved game — start fresh
      router.push('/character/new')
    }
  }, [characters, activeCharacterId, messages, router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading your adventure...</p>
      </div>
    </main>
  )
}
