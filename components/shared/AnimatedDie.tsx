'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ============================================================
   AnimatedDie — A 3D CSS die with tumble + bounce animation
   Supports d6 (cube faces with pips) and d20 (icosahedron-style)
   ============================================================ */

// ── D6 pip layouts ──
const D6_PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function D6Face({ value, size }: { value: number; size: number }) {
  const pips = D6_PIPS[value] || D6_PIPS[1];
  const pipSize = size * 0.15;
  return (
    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-400/50 shadow-inner flex items-center justify-center">
      {pips.map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full bg-slate-800 shadow-sm"
          style={{
            width: pipSize,
            height: pipSize,
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

function D20Face({ value, size, color = 'amber' }: { value: number; size: number; color?: string }) {
  const colorMap: Record<string, string> = {
    amber: 'from-amber-600 to-amber-800 border-amber-500/60',
    sky: 'from-sky-600 to-sky-800 border-sky-500/60',
    emerald: 'from-emerald-600 to-emerald-800 border-emerald-500/60',
    red: 'from-red-600 to-red-800 border-red-500/60',
    purple: 'from-purple-600 to-purple-800 border-purple-500/60',
  };
  const gradient = colorMap[color] || colorMap.amber;
  // Scale font based on face size
  const fontSize = size * 0.38;
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} border shadow-inner flex items-center justify-center`}
      style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', borderRadius: 4 }}
    >
      <span
        className="font-bold text-white drop-shadow-lg font-cinzel"
        style={{ fontSize, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Pre-computed rotation targets for each d6 face ──
const D6_FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 180, y: 0 },
};

export interface AnimatedDieProps {
  /** 'd6' or 'd20' */
  type: 'd6' | 'd20';
  /** Final result value */
  value: number;
  /** Die size in px (default 80) */
  size?: number;
  /** Whether to play the animation */
  rolling: boolean;
  /** Called when the roll animation finishes */
  onAnimationEnd?: () => void;
  /** Color theme for d20 faces (default 'amber') */
  color?: string;
  /** Animation delay in ms (for staggering multiple dice) */
  delay?: number;
  /** Unique identifier for this die instance */
  id?: string;
}

export default function AnimatedDie({
  type,
  value,
  size = 80,
  rolling,
  onAnimationEnd,
  color = 'amber',
  delay = 0,
  id,
}: AnimatedDieProps) {
  const [phase, setPhase] = useState<'idle' | 'tumbling' | 'settling' | 'landed'>('idle');
  const [tumbleRotation, setTumbleRotation] = useState({ x: 0, y: 0, z: 0 });
  const [bounceY, setBounceY] = useState(0);
  const [bounceScale, setBounceScale] = useState(1);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Tumble duration (ms)
  const TUMBLE_DURATION = 1200;
  const SETTLE_DURATION = 400;

  const half = size / 2;

  // Start animation when `rolling` becomes true
  useEffect(() => {
    if (!rolling) {
      setPhase('idle');
      return;
    }

    const delayTimer = setTimeout(() => {
      setPhase('tumbling');
      startTimeRef.current = performance.now();

      // Pick random tumble parameters
      const spinSpeedX = (2 + Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1);
      const spinSpeedY = (2 + Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1);
      const spinSpeedZ = (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);

      // Target rotation for the final face
      const target = type === 'd6'
        ? D6_FACE_ROTATIONS[value] || { x: 0, y: 0 }
        : { x: (Math.floor(Math.random() * 4)) * 360, y: (Math.floor(Math.random() * 4)) * 360 };

      // Add full spins to ensure the tumble looks dramatic
      const finalX = target.x + Math.floor(spinSpeedX > 0 ? 3 : -3) * 360;
      const finalY = target.y + Math.floor(spinSpeedY > 0 ? 3 : -3) * 360;
      const finalZ = 0;

      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current;

        if (phaseRef.current !== 'tumbling' && phaseRef.current !== 'settling') return;

        if (elapsed < TUMBLE_DURATION) {
          // ── Tumble phase: wild spinning + bouncing ──
          const t = elapsed / TUMBLE_DURATION;
          // Ease-out for rotation deceleration
          const ease = 1 - Math.pow(1 - t, 2);

          const rx = spinSpeedX * 360 * ease;
          const ry = spinSpeedY * 360 * ease;
          const rz = spinSpeedZ * 180 * ease;

          // Bounce: 3 bounces with decreasing height
          const bounceT = t;
          const bounceCount = 3;
          const bouncePhase = (bounceT * bounceCount) % 1;
          const bounceHeight = Math.sin(bouncePhase * Math.PI) * (1 - t) * size * 1.5;
          const scale = 1 + Math.sin(bouncePhase * Math.PI) * 0.15 * (1 - t);

          setTumbleRotation({ x: rx, y: ry, z: rz });
          setBounceY(-bounceHeight);
          setBounceScale(scale);

          rafRef.current = requestAnimationFrame(animate);
        } else if (elapsed < TUMBLE_DURATION + SETTLE_DURATION) {
          // ── Settle phase: ease into final position ──
          if (phaseRef.current === 'tumbling') {
            setPhase('settling');
          }
          const settleT = (elapsed - TUMBLE_DURATION) / SETTLE_DURATION;
          const settleEase = 1 - Math.pow(1 - settleT, 3); // cubic ease-out

          setTumbleRotation({
            x: finalX * settleEase + spinSpeedX * 360 * (1 - settleEase),
            y: finalY * settleEase + spinSpeedY * 360 * (1 - settleEase),
            z: finalZ,
          });
          setBounceY(0);
          setBounceScale(1 + 0.05 * (1 - settleEase));

          rafRef.current = requestAnimationFrame(animate);
        } else {
          // ── Landed ──
          setPhase('landed');
          setTumbleRotation({ x: finalX, y: finalY, z: finalZ });
          setBounceY(0);
          setBounceScale(1);
          onAnimationEnd?.();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling, value, type, delay, size]);

  const isAnimating = phase === 'tumbling' || phase === 'settling';
  const showResult = phase === 'landed' || !rolling;

  if (type === 'd20') {
    // ── D20: Pentagon-shaped die with 3D tumble ──
    return (
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          perspective: size * 4,
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            transformStyle: 'preserve-3d',
            transform: isAnimating
              ? `translateY(${bounceY}px) scale(${bounceScale}) rotateX(${tumbleRotation.x}deg) rotateY(${tumbleRotation.y}deg) rotateZ(${tumbleRotation.z}deg)`
              : 'rotateX(0) rotateY(0)',
            transition: !isAnimating && !rolling ? 'transform 0.3s ease' : 'none',
          }}
        >
          {/* Front face (visible) */}
          <D20Face value={showResult ? value : Math.ceil(Math.random() * 20)} size={size} color={color} />

          {/* Shadow */}
          {isAnimating && (
            <div
              className="absolute rounded-full bg-black/30 blur-md"
              style={{
                width: size * 0.8,
                height: size * 0.3,
                bottom: -size * 0.15 - bounceY * 0.3,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: Math.max(0.1, 1 - Math.abs(bounceY) / (size * 1.5)),
              }}
            />
          )}
        </div>

        {/* Glow on landing */}
        {phase === 'landed' && (
          <div
            className="absolute inset-0 rounded-lg animate-pulse"
            style={{
              boxShadow: value === 20
                ? '0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.3)'
                : value === 1
                ? '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3)'
                : '0 0 20px rgba(14, 165, 233, 0.4)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  }

  // ── D6: Full 3D cube with 6 faces ──
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        perspective: size * 5,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: isAnimating
            ? `translateY(${bounceY}px) scale(${bounceScale}) rotateX(${tumbleRotation.x}deg) rotateY(${tumbleRotation.y}deg) rotateZ(${tumbleRotation.z}deg)`
            : `rotateX(${D6_FACE_ROTATIONS[value]?.x || 0}deg) rotateY(${D6_FACE_ROTATIONS[value]?.y || 0}deg)`,
          transition: !isAnimating && !rolling ? 'transform 0.3s ease' : 'none',
        }}
      >
        {/* Face 1 — front */}
        <div className="absolute" style={{ width: size, height: size, transform: `translateZ(${half}px)` }}>
          <D6Face value={1} size={size} />
        </div>
        {/* Face 6 — back */}
        <div className="absolute" style={{ width: size, height: size, transform: `rotateY(180deg) translateZ(${half}px)` }}>
          <D6Face value={6} size={size} />
        </div>
        {/* Face 2 — right */}
        <div className="absolute" style={{ width: size, height: size, transform: `rotateY(90deg) translateZ(${half}px)` }}>
          <D6Face value={2} size={size} />
        </div>
        {/* Face 5 — left */}
        <div className="absolute" style={{ width: size, height: size, transform: `rotateY(-90deg) translateZ(${half}px)` }}>
          <D6Face value={5} size={size} />
        </div>
        {/* Face 3 — top */}
        <div className="absolute" style={{ width: size, height: size, transform: `rotateX(90deg) translateZ(${half}px)` }}>
          <D6Face value={3} size={size} />
        </div>
        {/* Face 4 — bottom */}
        <div className="absolute" style={{ width: size, height: size, transform: `rotateX(-90deg) translateZ(${half}px)` }}>
          <D6Face value={4} size={size} />
        </div>
      </div>

      {/* Shadow beneath die */}
      {isAnimating && (
        <div
          className="absolute rounded-full bg-black/30 blur-md"
          style={{
            width: size * 0.8,
            height: size * 0.3,
            bottom: -size * 0.2 - bounceY * 0.3,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: Math.max(0.1, 1 - Math.abs(bounceY) / (size * 1.5)),
          }}
        />
      )}
    </div>
  );
}
