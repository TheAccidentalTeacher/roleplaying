'use client'

import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { Sparkles, Zap, Image, Volume2, BookOpen } from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-600">
            About AI Dungeon Master
          </h1>
          <p className="text-xl text-gray-400">
            Your Personal AI-Powered RPG Experience
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-300 mb-4">
            This is a single-player role-playing game where an advanced AI acts as your Dungeon Master,
            creating dynamic stories, memorable encounters, and responding to your every action.
          </p>
          <p className="text-gray-300">
            Unlike pre-scripted games, every adventure is unique. The AI adapts to your choices,
            creating a truly personalized experience that changes with each playthrough.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center space-x-3 mb-3">
              <Sparkles className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-bold">Dynamic Storytelling</h3>
            </div>
            <p className="text-gray-300 text-sm">
              The AI generates unique narratives based on your actions, creating endless possibilities
              and ensuring no two adventures are the same.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-bold">Real-time Responses</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Get instant feedback on your actions. The AI Dungeon Master responds quickly,
              keeping your adventure flowing smoothly.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-3">
              <Image className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-bold">Visual Generation</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Generate images of characters, locations, and epic moments using AI image generation
              to bring your adventure to life.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-bold">Persistent Progress</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Your character, inventory, and story progress are automatically saved.
              Continue your adventure anytime, right where you left off.
            </p>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-primary-900/30 to-purple-900/30 border-primary-500/30">
          <h2 className="text-2xl font-bold mb-4">AI Features</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start space-x-3">
              <span className="text-primary-400 font-bold">•</span>
              <span>Advanced language models for natural, engaging dialogue</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-primary-400 font-bold">•</span>
              <span>DALL-E integration for generating scene and character artwork</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-primary-400 font-bold">•</span>
              <span>Contextual memory that remembers your choices and their consequences</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-primary-400 font-bold">•</span>
              <span>Dynamic difficulty adjustment based on your character's level</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <button onClick={() => router.push('/')} className="btn-secondary">
            Back to Menu
          </button>
          <button onClick={() => router.push('/character/new')} className="btn-primary">
            Start Adventure
          </button>
        </div>
      </div>
    </main>
  )
}
