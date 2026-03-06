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
  roll: (notation: string | string[]) => void;
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

      // Create a fixed container div that defines the roll area (top half of screen).
      // Canvas pixel buffer matches this div exactly — no CSS stretching, no blur.
      let container = document.getElementById('dice-box-root');
      if (!container) {
        container = document.createElement('div');
        container.id = 'dice-box-root';
        Object.assign(container.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '60vh',
          zIndex: '99999',
          pointerEvents: 'none',
          overflow: 'hidden',
        });
        document.body.appendChild(container);
      }

      globalBox = new DiceBox({
        assetPath: '/dice/',
        container: '#dice-box-root',
        theme: 'default',
        themeColor: '#f59e0b',
        offscreen: true,
        scale: 25,
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