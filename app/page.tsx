'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sword, BookOpen, Skull, Stars, Sparkles } from 'lucide-react'

const AMBIENT_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 4}s`,
  duration: `${3 + Math.random() * 4}s`,
  size: Math.random() > 0.5 ? 'w-1 h-1' : 'w-0.5 h-0.5',
}))

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-bg">
      {/* Dark vignette corners */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)'
        }}
      />

      {/* Ambient floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {AMBIENT_PARTICLES.map(p => (
          <div
            key={p.id}
            className={`absolute ${p.size} rounded-full bg-primary-400/30`}
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
              boxShadow: '0 0 6px rgba(56,189,248,0.5)',
            }}
          />
        ))}
      </div>

      {/* Horizontal divider glow lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl w-full px-4 sm:px-8 py-16 flex flex-col items-center gap-12">

        {/* ── Header ── */}
        <div className="text-center space-y-5">
          {/* Decorative rune row */}
          <div className="flex items-center justify-center gap-3 text-primary-400/50 text-sm tracking-[0.4em] uppercase">
            <span>✦</span>
            <span className="font-cinzel">Est. Anno Domini</span>
            <span>✦</span>
          </div>

          {/* Title */}
          <h1 className="font-cinzel text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-wide">
            <span className="text-gradient-arcane">AI</span>
            <br className="sm:hidden" />
            <span className="text-white"> Dungeon</span>
            <br className="sm:hidden" />
            <span className="text-gradient-gold"> Master</span>
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 my-2">
            <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-slate-500" />
            <Sparkles className="w-4 h-4 text-amber-400/60" />
            <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-slate-500" />
          </div>

          <p className="text-lg sm:text-xl text-slate-400 font-merriweather max-w-lg mx-auto leading-relaxed">
            An <em className="text-slate-300 not-italic">AI-driven</em> tabletop adventure.
            Infinite worlds. Boundless stories.
          </p>
        </div>

        {/* ── Menu Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full max-w-3xl">

          {/* New Adventure */}
          <Link
            href="/character/new"
            className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm
                       hover:border-primary-500/70 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-900/30
                       transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex flex-col items-center gap-4 p-7">
              <div className="w-16 h-16 rounded-xl bg-primary-900/40 border border-primary-700/40
                              group-hover:border-primary-500/60 group-hover:bg-primary-900/60
                              flex items-center justify-center transition-all duration-300
                              group-hover:shadow-lg group-hover:shadow-primary-900/40">
                <Sword className="w-8 h-8 text-primary-400 group-hover:text-primary-300 transition-colors" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-cinzel font-bold text-white mb-1.5">New Adventure</h2>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-snug">
                  Forge a hero and step into a world shaped by your choices
                </p>
              </div>
            </div>

            {/* Bottom label */}
            <div className="border-t border-slate-800/80 px-7 py-2.5 text-center">
              <span className="text-xs text-primary-400/60 group-hover:text-primary-400 font-cinzel tracking-wider transition-colors">
                BEGIN →
              </span>
            </div>
          </Link>

          {/* Continue */}
          <Link
            href="/game/continue"
            className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm
                       hover:border-amber-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/20
                       transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex flex-col items-center gap-4 p-7">
              <div className="w-16 h-16 rounded-xl bg-amber-900/30 border border-amber-800/40
                              group-hover:border-amber-600/50 group-hover:bg-amber-900/50
                              flex items-center justify-center transition-all duration-300
                              group-hover:shadow-lg group-hover:shadow-amber-900/30">
                <BookOpen className="w-8 h-8 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-cinzel font-bold text-white mb-1.5">Continue</h2>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-snug">
                  Return to your ongoing saga where you left off
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 px-7 py-2.5 text-center">
              <span className="text-xs text-amber-400/60 group-hover:text-amber-400 font-cinzel tracking-wider transition-colors">
                RESUME →
              </span>
            </div>
          </Link>

          {/* About */}
          <Link
            href="/about"
            className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm
                       hover:border-purple-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20
                       transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex flex-col items-center gap-4 p-7">
              <div className="w-16 h-16 rounded-xl bg-purple-900/30 border border-purple-800/40
                              group-hover:border-purple-600/50 group-hover:bg-purple-900/50
                              flex items-center justify-center transition-all duration-300
                              group-hover:shadow-lg group-hover:shadow-purple-900/30">
                <Stars className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-cinzel font-bold text-white mb-1.5">About</h2>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-snug">
                  Learn the arcane secrets behind this AI adventure
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 px-7 py-2.5 text-center">
              <span className="text-xs text-purple-400/60 group-hover:text-purple-400 font-cinzel tracking-wider transition-colors">
                DISCOVER →
              </span>
            </div>
          </Link>
        </div>

        {/* ── Footer ── */}
        <div className="text-center space-y-1">
          <p className="text-slate-600 text-xs font-cinzel tracking-widest uppercase">
            Powered by Claude &amp; GPT · Infinite worlds await
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-700 text-xs">
            <span>⚔</span>
            <span>An endless adventure for the lone explorer</span>
            <span>⚔</span>
          </div>
        </div>

      </div>
    </main>
  )
}

