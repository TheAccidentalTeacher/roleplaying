'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, Character } from '@/lib/store'
import { Dices } from 'lucide-react'

const CLASSES = [
  { name: 'Warrior', description: 'Strong and brave, skilled in combat' },
  { name: 'Mage', description: 'Master of arcane magic and spells' },
  { name: 'Rogue', description: 'Cunning and agile, expert in stealth' },
  { name: 'Cleric', description: 'Divine spellcaster and healer' },
  { name: 'Ranger', description: 'Expert tracker and wilderness survivor' },
  { name: 'Bard', description: 'Charismatic performer with magical abilities' },
]

export default function NewCharacter() {
  const router = useRouter()
  const { setCharacter, resetGame } = useGameStore()
  
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [background, setBackground] = useState('')

  const rollStats = () => {
    return {
      strength: Math.floor(Math.random() * 6) + 10,
      dexterity: Math.floor(Math.random() * 6) + 10,
      constitution: Math.floor(Math.random() * 6) + 10,
      intelligence: Math.floor(Math.random() * 6) + 10,
      wisdom: Math.floor(Math.random() * 6) + 10,
      charisma: Math.floor(Math.random() * 6) + 10,
    }
  }

  const handleCreateCharacter = () => {
    if (!name || !selectedClass) {
      alert('Please fill in all required fields')
      return
    }

    const stats = rollStats()
    const character: Character = {
      id: Date.now().toString(),
      name,
      class: selectedClass,
      level: 1,
      experience: 0,
      hitPoints: {
        current: 20 + Math.floor((stats.constitution - 10) / 2),
        max: 20 + Math.floor((stats.constitution - 10) / 2),
      },
      stats,
      background: background || 'A mysterious adventurer with an unknown past',
      inventory: ['Rusty Sword', 'Leather Armor', 'Backpack', 'Rations (3 days)'],
      gold: 10,
    }

    resetGame()
    setCharacter(character)
    router.push('/game')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-600">
          Create Your Character
        </h1>

        <div className="card space-y-6">
          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Character Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter your character's name"
            />
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Class *
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {CLASSES.map((cls) => (
                <button
                  key={cls.name}
                  onClick={() => setSelectedClass(cls.name)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedClass === cls.name
                      ? 'border-primary-500 bg-primary-900/30'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-bold text-lg">{cls.name}</div>
                  <div className="text-sm text-gray-400">{cls.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Background (Optional)
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Describe your character's background story..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4 flex items-start space-x-3">
            <Dices className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
            <div className="text-sm text-gray-300">
              Your character's stats will be automatically rolled when you create them.
              The AI Dungeon Master will guide you through your adventure!
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCharacter}
              className="btn-primary flex-1"
            >
              Begin Adventure
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
