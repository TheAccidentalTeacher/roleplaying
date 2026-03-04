'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Trash2,
  Play,
  Save,
  Plus,
  Clock,
  MapPin,
  Swords,
  ScrollText,
  AlertTriangle,
  HardDrive,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import {
  listSavedGames,
  deleteGame,
  loadGame,
  saveCurrentGame,
  hasActiveGame,
  getActiveGamePreview,
  renameSave,
  type SavedGamePreview,
} from '@/lib/services/saved-games'
import { useGameStore } from '@/lib/store'

// ---- Helpers ----

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function genreColor(genre: string): string {
  if (genre.includes('fantasy')) return 'text-purple-400'
  if (genre.includes('sci-fi') || genre.includes('cyber')) return 'text-cyan-400'
  if (genre.includes('horror') || genre.includes('dark') || genre.includes('lovecraft')) return 'text-red-400'
  if (genre.includes('post-apocalypse') || genre.includes('survival')) return 'text-amber-400'
  if (genre.includes('pirate') || genre.includes('western')) return 'text-yellow-400'
  if (genre.includes('steampunk')) return 'text-orange-400'
  if (genre.includes('myth')) return 'text-emerald-400'
  return 'text-slate-400'
}

function genreBorder(genre: string): string {
  if (genre.includes('fantasy')) return 'border-purple-700/50 hover:border-purple-500/60'
  if (genre.includes('sci-fi') || genre.includes('cyber')) return 'border-cyan-700/50 hover:border-cyan-500/60'
  if (genre.includes('horror') || genre.includes('dark') || genre.includes('lovecraft')) return 'border-red-700/50 hover:border-red-500/60'
  if (genre.includes('post-apocalypse') || genre.includes('survival')) return 'border-amber-700/50 hover:border-amber-500/60'
  if (genre.includes('pirate') || genre.includes('western')) return 'border-yellow-700/50 hover:border-yellow-500/60'
  if (genre.includes('steampunk')) return 'border-orange-700/50 hover:border-orange-500/60'
  if (genre.includes('myth')) return 'border-emerald-700/50 hover:border-emerald-500/60'
  return 'border-slate-700/50 hover:border-slate-500/60'
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function GamesPage() {
  const router = useRouter()
  const resetGame = useGameStore(s => s.resetGame)

  const [saves, setSaves] = useState<SavedGamePreview[]>([])
  const [activePreview, setActivePreview] = useState<SavedGamePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editNameValue, setEditNameValue] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listSavedGames()
      setSaves(list)
      setActivePreview(getActiveGamePreview())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
  }, [refresh])

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  // ---- Actions ----

  const handleSaveCurrent = async () => {
    try {
      await saveCurrentGame()
      showNotification('Game saved successfully!')
      await refresh()
    } catch (err) {
      showNotification(`Save failed: ${(err as Error).message}`)
    }
  }

  const handleLoad = async (saveId: string) => {
    try {
      // If there's an active game, auto-save it first
      if (hasActiveGame()) {
        try {
          await saveCurrentGame()
        } catch {
          // Ignore save errors on auto-save — might be at max saves
        }
      }
      await loadGame(saveId)
      // Force a page reload to rehydrate the Zustand store from localStorage
      window.location.href = '/game'
    } catch (err) {
      showNotification(`Load failed: ${(err as Error).message}`)
    }
  }

  const handleDelete = async (saveId: string) => {
    if (deleteConfirm !== saveId) {
      setDeleteConfirm(saveId)
      return
    }
    await deleteGame(saveId)
    setDeleteConfirm(null)
    showNotification('Save deleted.')
    await refresh()
  }

  const handleRename = async (saveId: string) => {
    if (editNameValue.trim()) {
      await renameSave(saveId, editNameValue.trim())
      setEditingName(null)
      setEditNameValue('')
      await refresh()
    }
  }

  const handleNewAdventure = async () => {
    // Auto-save current game if exists
    if (hasActiveGame()) {
      try {
        await saveCurrentGame()
        showNotification('Current game auto-saved!')
      } catch {
        // Continue anyway
      }
    }
    // Clear active state and navigate
    resetGame()
    localStorage.setItem('rpg-new-game', 'true')
    router.push('/character/new')
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen hero-bg">
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-primary-500/50 rounded-lg px-4 py-3 
                        text-sm text-slate-200 shadow-xl shadow-primary-900/20 animate-in slide-in-from-right">
          {notification}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg border border-slate-700/60 bg-slate-900/50 hover:border-slate-600 
                       hover:bg-slate-800/50 transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-white">Saved Adventures</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your worlds and characters</p>
          </div>
        </div>

        {/* ── Save Count ── */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6 px-1">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{saves.length} saved game{saves.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>Cloud synced</span>
          <span className="ml-auto">{20 - saves.length} slot{20 - saves.length !== 1 ? 's' : ''} remaining</span>
        </div>

        {/* ── Active Game ── */}
        {activePreview && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-sm font-cinzel text-green-400 tracking-wider uppercase">Currently Playing</h2>
            </div>
            <div className="rounded-xl border border-green-700/40 bg-slate-900/80 backdrop-blur-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-cinzel text-xl font-bold text-white truncate">
                    {activePreview.characterName}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Level {activePreview.characterLevel} {activePreview.characterRace} {activePreview.characterClass}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activePreview.worldName}
                    </span>
                    <span className={`flex items-center gap-1 ${genreColor(activePreview.primaryGenre)}`}>
                      {activePreview.primaryGenre.replace(/-/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ScrollText className="w-3 h-3" />
                      {activePreview.messageCount} messages
                    </span>
                    <span className="flex items-center gap-1">
                      <Swords className="w-3 h-3" />
                      {activePreview.questCount} quest{activePreview.questCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <button
                    onClick={() => router.push('/game')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 border border-green-600/40
                               text-green-400 hover:bg-green-600/30 hover:border-green-500/60 transition-all text-sm font-medium"
                  >
                    <Play className="w-4 h-4" /> Resume
                  </button>
                  <button
                    onClick={handleSaveCurrent}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600/20 border border-primary-600/40
                               text-primary-400 hover:bg-primary-600/30 hover:border-primary-500/60 transition-all text-sm font-medium"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── New Adventure button ── */}
        <button
          onClick={handleNewAdventure}
          className="w-full mb-6 flex items-center justify-center gap-3 px-5 py-4 rounded-xl
                     border border-dashed border-slate-700/60 bg-slate-900/40
                     hover:border-primary-500/50 hover:bg-slate-900/70 transition-all
                     text-slate-400 hover:text-primary-400 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-cinzel text-lg">Start New Adventure</span>
          {activePreview && (
            <span className="text-xs text-slate-600 ml-2">(current game will be auto-saved)</span>
          )}
        </button>

        {/* ── Saved Games List ── */}
        {saves.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-cinzel text-lg mb-2">No Saved Adventures</p>
            <p className="text-slate-600 text-sm">
              Your saved games will appear here. Start an adventure and save your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-cinzel text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Saved Games
            </h2>

            {saves.map((save) => (
              <div
                key={save.id}
                className={`group rounded-xl border bg-slate-900/70 backdrop-blur-sm p-4
                           transition-all duration-200 hover:bg-slate-900/90
                           ${genreBorder(save.primaryGenre)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Save name (editable) */}
                    {editingName === save.id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(save.id)}
                          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white 
                                     focus:border-primary-500 focus:outline-none w-full max-w-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(save.id)}
                          className="p-1 rounded hover:bg-green-900/30 text-green-400"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingName(null); setEditNameValue('') }}
                          className="p-1 rounded hover:bg-red-900/30 text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-cinzel text-lg font-bold text-white truncate">
                          {save.saveName}
                        </h3>
                        <button
                          onClick={() => { setEditingName(save.id); setEditNameValue(save.saveName) }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-800 
                                     text-slate-500 hover:text-slate-300 transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <p className="text-slate-400 text-sm">
                      Level {save.characterLevel} {save.characterRace} {save.characterClass}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className={genreColor(save.primaryGenre)}>
                        {save.primaryGenre.replace(/-/g, ' ')}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {save.currentLocation}
                      </span>
                      <span>·</span>
                      <span>{save.messageCount} messages</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(save.lastPlayedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Created {formatDate(save.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => handleLoad(save.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600/15 border border-primary-600/30
                                 text-primary-400 hover:bg-primary-600/25 hover:border-primary-500/50 transition-all text-sm"
                    >
                      <Play className="w-4 h-4" /> Load
                    </button>

                    {deleteConfirm === save.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(save.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600/20 border border-red-500/50
                                     text-red-400 hover:bg-red-600/30 transition-all text-xs font-medium"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50
                                     text-slate-400 hover:text-white transition-all text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(save.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50
                                   text-slate-500 hover:text-red-400 hover:border-red-700/50 hover:bg-red-900/20 transition-all text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-12 text-center text-xs text-slate-700">
          <p>Games are saved to the cloud. You can access your saves from any device.</p>
        </div>

      </div>
    </main>
  )
}
