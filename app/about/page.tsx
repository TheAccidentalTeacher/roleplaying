'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Zap, ImageIcon, BookOpen, ChevronLeft, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    color: 'text-amber-400',
    bg: 'bg-amber-900/30 border-amber-800/40',
    title: 'Dynamic Storytelling',
    desc: 'The AI generates unique narratives based on your actions — no two adventures are ever alike.',
  },
  {
    icon: Zap,
    color: 'text-primary-400',
    bg: 'bg-primary-900/30 border-primary-800/40',
    title: 'Real-time Responses',
    desc: 'Get instant feedback on every decision. The world reacts to you in real time.',
  },
  {
    icon: ImageIcon,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30 border-purple-800/40',
    title: 'Visual Generation',
    desc: 'AI-generated art brings your characters, locations, and epic moments to life.',
  },
  {
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30 border-emerald-800/40',
    title: 'Persistent Progress',
    desc: 'Your story, character, and inventory auto-save so you can pick up exactly where you left off.',
  },
]

export default function AboutPage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen hero-bg overflow-hidden">
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-12">

        {/* ── Header ── */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-slate-500 text-xs tracking-[0.4em] uppercase font-cinzel mb-2">
            <span>✦</span><span>Codex</span><span>✦</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-cinzel font-black">
            <span className="text-gradient-gold">About the</span>
            <br />
            <span className="text-white">AI Dungeon Master</span>
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-600" />
            <Sparkles className="w-4 h-4 text-amber-400/50" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-600" />
          </div>
          <p className="text-lg text-slate-400 font-merriweather max-w-xl mx-auto">
            Your personal AI-powered RPG experience
          </p>
        </div>

        {/* ── How It Works ── */}
        <div className="card">
          <h2 className="text-2xl font-cinzel font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-primary-400">⚙</span> How It Works
          </h2>
          <p className="text-slate-300 mb-3 leading-relaxed">
            This is a single-player role-playing game where an advanced AI acts as your Dungeon Master,
            creating dynamic stories, memorable encounters, and responding to your every action.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Unlike scripted games, every adventure is unique. The AI adapts to your choices,
            crafting a truly personalized experience that evolves with each playthrough.
          </p>
        </div>

        {/* ── Feature Grid ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="card">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${bg} border flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-cinzel font-bold text-white mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── AI Features callout ── */}
        <div className="relative rounded-2xl border border-primary-500/25 bg-gradient-to-br from-primary-900/25 to-purple-900/20 p-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
          <h2 className="text-2xl font-cinzel font-bold text-white mb-5 flex items-center gap-2">
            <span className="text-arcane">✦</span> Under the Hood
          </h2>
          <ul className="space-y-3">
            {[
              'Advanced language models (GPT-4 / Claude) for natural, engaging dialogue',
              'DALL-E integration for generating scene and character artwork',
              'Contextual memory — the world remembers your choices and their consequences',
              "Dynamic difficulty that scales with your character's power and experience",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5 flex-shrink-0">▸</span>
                <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Menu
          </button>
          <button
            onClick={() => router.push('/character/new')}
            className="btn-primary flex items-center gap-2"
          >
            Begin Your Adventure
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </main>
  )
}
