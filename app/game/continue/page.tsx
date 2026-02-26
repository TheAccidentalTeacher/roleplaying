'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'

export default function ContinuePage() {
  const router = useRouter()
  const { character } = useGameStore()

  useEffect(() => {
    // If there's a saved character, continue to game
    if (character) {
      router.push('/game')
    } else {
      // Otherwise, redirect to character creation
      router.push('/character/new')
    }
  }, [character, router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your adventure...</p>
      </div>
    </main>
  )
}
