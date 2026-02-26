'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { Send, Loader2, User, Scroll, Map, Backpack } from 'lucide-react'

export default function GamePage() {
  const router = useRouter()
  const { character, messages, addMessage, isLoading, setLoading } = useGameStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (!character) {
      router.push('/character/new')
      return
    }

    // Send initial message from DM if no messages
    if (messages.length === 0) {
      sendInitialMessage()
    }
  }, [character])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendInitialMessage = async () => {
    setLoading(true)
    
    const initialPrompt = `Start an epic adventure for ${character?.name}, a level ${character?.level} ${character?.class}. Begin with an engaging opening scene. Set the tone and present the first situation or choice.`
    
    try {
      const response = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: initialPrompt }],
          character,
          gameState: 'Beginning of adventure',
        }),
      })

      if (!response.ok) throw new Error('Failed to get DM response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let dmResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          dmResponse += chunk
        }
      }

      addMessage({
        role: 'assistant',
        content: dmResponse,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    }

    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          character,
          gameState: `Recent actions and current situation based on conversation`,
        }),
      })

      if (!response.ok) throw new Error('Failed to get DM response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let dmResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          dmResponse += chunk
        }
      }

      addMessage({
        role: 'assistant',
        content: dmResponse,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Error:', error)
      addMessage({
        role: 'assistant',
        content: 'The mystical connection to the DM has been disrupted. Please try again.',
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  if (!character) return null

  return (
    <main className="h-screen flex flex-col bg-dark-300">
      {/* Header */}
      <div className="bg-dark-200 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <User className="w-6 h-6 text-primary-400" />
            <div>
              <h2 className="font-bold text-lg">{character.name}</h2>
              <p className="text-sm text-gray-400">
                Level {character.level} {character.class}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="btn-secondary text-sm"
            >
              {showStats ? 'Hide' : 'Show'} Stats
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-200 border border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Scroll className="w-4 h-4 text-primary-400" />
                        <span className="text-xs font-semibold text-primary-400">
                          Dungeon Master
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-dark-200 border border-gray-700 rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 bg-dark-200 p-4">
            <div className="max-w-4xl mx-auto flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="What do you do?..."
                className="input-field flex-1"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="btn-primary px-6"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        {showStats && (
          <div className="w-80 border-l border-gray-700 bg-dark-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Stats */}
              <div className="card">
                <h3 className="font-bold mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Stats</span>
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between">
                      <span className="capitalize text-gray-400">{stat}:</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HP */}
              <div className="card">
                <h3 className="font-bold mb-3">Hit Points</h3>
                <div className="flex justify-between text-lg">
                  <span className="text-red-400">{character.hitPoints.current}</span>
                  <span className="text-gray-500">/</span>
                  <span>{character.hitPoints.max}</span>
                </div>
              </div>

              {/* Inventory */}
              <div className="card">
                <h3 className="font-bold mb-3 flex items-center space-x-2">
                  <Backpack className="w-5 h-5" />
                  <span>Inventory</span>
                </h3>
                <ul className="space-y-1 text-sm">
                  {character.inventory.map((item, index) => (
                    <li key={index} className="text-gray-300">
                      • {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="font-bold text-yellow-500">
                    Gold: {character.gold}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
