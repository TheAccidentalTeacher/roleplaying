'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sword, BookOpen, Skull } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-600">
            AI Dungeon Master
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 font-merriweather">
            Embark on an epic adventure guided by artificial intelligence
          </p>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Link href="/character/new" className="card hover:border-primary-500 transition-all transform hover:scale-105 cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <Sword className="w-16 h-16 text-primary-500" />
              <h2 className="text-2xl font-cinzel font-bold">New Adventure</h2>
              <p className="text-gray-400 text-center">
                Create a new character and begin your journey
              </p>
            </div>
          </Link>

          <Link href="/game/continue" className="card hover:border-primary-500 transition-all transform hover:scale-105 cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <BookOpen className="w-16 h-16 text-primary-500" />
              <h2 className="text-2xl font-cinzel font-bold">Continue</h2>
              <p className="text-gray-400 text-center">
                Resume your ongoing adventure
              </p>
            </div>
          </Link>

          <Link href="/about" className="card hover:border-primary-500 transition-all transform hover:scale-105 cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <Skull className="w-16 h-16 text-primary-500" />
              <h2 className="text-2xl font-cinzel font-bold">About</h2>
              <p className="text-gray-400 text-center">
                Learn how this AI-powered RPG works
              </p>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm mt-12">
          <p>Powered by advanced AI language models</p>
          <p className="mt-2">Your adventure awaits...</p>
        </div>
      </div>
    </main>
  )
}
