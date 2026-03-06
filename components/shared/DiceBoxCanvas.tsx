'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface DiceResult {
  groupId: number;
  rollId: number;
  sides: number;
  value: number;
  theme?: string;
}

export interface DiceBoxHandle {
  roll: (notation: string) => void;
  clear: () => void;
}

interface DiceBoxCanvasProps {
  onResult: (results: DiceResult[]) => void;
  onReady?: () => void;
  scale?: number;
}

// Singleton - only one dice-box instance ever exists across the app
let globalBox: any = null;
let globalReady = false;
let globalCallbacks: Array<(results: DiceResult[]) => void> = [];
let globalReadyCallbacks: Array<() => void> = [];
let initPromise: Promise<void> | null = null;

async function initGlobalBox(scale: number) {
  if (globalReady) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[DiceBox] Initialising global instance...');

      const { default: DiceBox } = await import('@3d-dice/dice-box');

      // Default container is document.body - let the library handle it.
      // We style the canvas element it creates after init.
      globalBox = new DiceBox({
        assetPath: '/dice/',
        theme: 'default',
        offscreen: true,
        scale,
        gravity: 1.5,
        mass: 1,
        friction: 0.8,
        restitution: 0.05,
        angularDamping: 0.5,
        linearDamping: 0.5,
        spinForce: 5,
        throwForce: 5,
        startingHeight: 10,
        settleTimeout: 5000,
        suspendSimulation: false,
        enableShadows: true,
        lightIntensity: 0.9,
      });

      await globalBox.init();

      // The library creates <canvas id="dice-canvas"> on document.body.
      // Give it fixed full-screen overlay styling so it appears over everything.
      const canvas = document.getElementById('dice-canvas') as HTMLElement | null;
      if (canvas) {
        Object.assign(canvas.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          zIndex: '99999',
          pointerEvents: 'none',
        });
        console.log('[DiceBox] Canvas styled OK');
      } else {
        console.warn('[DiceBox] #dice-canvas not found after init');
      }

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
  ({ onResult, onReady, scale = 7 }, ref) => {
    const onResultRef = useRef(onResult);
    onResultRef.current = onResult;

    useImperativeHandle(ref, () => ({
      roll(notation: string) {
        console.log(`[DiceBox] roll("${notation}") ready=${globalReady}`);
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