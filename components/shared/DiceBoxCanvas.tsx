'use client';

/**
 * DiceBoxCanvas — Singleton 3D physics dice renderer.
 *
 * ## Architecture
 * One global `DiceBox` instance is shared across the entire app. All React
 * components that mount this wrapper share the same canvas and physics world.
 *
 * ## Canvas visibility
 * The library appends a `<canvas class="dice-box-canvas">` to `document.body`.
 * `app/globals.css` applies `position:fixed; 100vw×100vh; z-index:99999;
 * pointer-events:none` to that class **before** any JS runs, which is critical:
 * `DiceBox.init()` reads `canvas.clientWidth/clientHeight` to size the physics
 * world. If this CSS is missing, the canvas defaults to 300×150 px and all dice
 * spawn in the top-left corner.
 *
 * ## Roll results
 * Values come from `onRollComplete` — the actual physics simulation outcome.
 * Never pre-compute random numbers and ignore what the dice show.
 *
 * ## Mixed die types
 * Pass an array: `roll(['2d6', '1d20'])`. A single string like `'2d6+1d20'`
 * only works for same-type dice.
 *
 * ## Assets
 * Workers and WASM live in `/public/dice/` (`assetPath: '/dice/'`).
 * Directory layout: workers at root, `ammo/` for physics, `themes/` for textures.
 */

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface DiceResult {
  groupId: number;
  rollId: number;
  sides: number;
  value: number;
  theme?: string;
}

export interface DiceBoxHandle {
  roll: (notation: string | string[]) => void;
  clear: () => void;
}

interface DiceBoxCanvasProps {
  onResult: (results: DiceResult[]) => void;
  onReady?: () => void;
  scale?: number;
}

// ─── Singleton state ────────────────────────────────────────────────────────
// Module-level variables survive React component unmounts/remounts, ensuring
// only one DiceBox instance is ever created per browser session.
let globalBox: any = null;                                       // DiceBox instance
let globalReady = false;                                         // true after init() resolves
let globalCallbacks: Array<(results: DiceResult[]) => void> = []; // one per mounted consumer
let globalReadyCallbacks: Array<() => void> = [];                // queued onReady handlers
let initPromise: Promise<void> | null = null;                    // deduplicates parallel init calls

async function initGlobalBox(scale: number) {
  if (globalReady) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[DiceBox] Initialising global instance...');

      const { default: DiceBox } = await import('@3d-dice/dice-box');

      globalBox = new DiceBox({
        assetPath: '/dice/',
        container: 'body',
        theme: 'default',
        themeColor: '#f59e0b',
        offscreen: true,
        scale: 6,
        gravity: 1,
        mass: 1,
        friction: 0.8,
        restitution: 0.1,
        angularDamping: 0.4,
        linearDamping: 0.4,
        spinForce: 5,
        throwForce: 8,
        startingHeight: 8,
        settleTimeout: 5000,
        delay: 100,
        suspendSimulation: false,
        enableShadows: true,
        lightIntensity: 1,
      });

      await globalBox.init();
      console.log('[DiceBox] init() complete');

      globalBox.onRollComplete = (results: DiceResult[]) => {
        console.log('[DiceBox] Roll complete:', results);
        globalCallbacks.forEach(cb => cb(results));
      };

      globalReady = true;
      console.log('[DiceBox] Ready');
      globalReadyCallbacks.forEach(cb => cb());
      globalReadyCallbacks = [];
    } catch (err) {
      console.error('[DiceBox] Init failed:', err);
      initPromise = null;
    }
  })();

  return initPromise;
}

const DiceBoxCanvas = forwardRef<DiceBoxHandle, DiceBoxCanvasProps>(
  ({ onResult, onReady, scale = 25 }, ref) => {
    const onResultRef = useRef(onResult);
    onResultRef.current = onResult;

    useImperativeHandle(ref, () => ({
      roll(notation: string | string[]) {
        console.log(`[DiceBox] roll(`, notation, `) ready=${globalReady}`);
        if (!globalReady || !globalBox) return;
        globalBox.roll(notation);
      },
      clear() {
        if (!globalBox) return;
        globalBox.clear?.();
      },
    }));

    useEffect(() => {
      // Register this instance result callback
      const cb = (results: DiceResult[]) => onResultRef.current(results);
      globalCallbacks.push(cb);

      if (globalReady) {
        onReady?.();
      } else {
        globalReadyCallbacks.push(() => onReady?.());
        initGlobalBox(scale);
      }

      return () => {
        globalCallbacks = globalCallbacks.filter(c => c !== cb);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Renders nothing - the canvas lives on document.body
    return null;
  }
);

DiceBoxCanvas.displayName = 'DiceBoxCanvas';
export default DiceBoxCanvas;