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
        themeColor: '#f59e0b',  // amber — dark numbers on bright face = readable
        offscreen: true,
        scale,
        gravity: 1,
        mass: 1,
        friction: 0.8,
        restitution: 0.1,
        angularDamping: 0.4,
        linearDamping: 0.4,
        spinForce: 4,
        throwForce: 2,
        startingHeight: 8,
        settleTimeout: 5000,
        delay: 100,
        suspendSimulation: false,
        enableShadows: true,
        lightIntensity: 1,
      });

      // Watch for the canvas being appended to body BEFORE init so we catch it
      // regardless of whether it's added sync or async.
      function styleCanvas(el: HTMLElement) {
        // Do NOT set width/height — library controls the pixel buffer.
        // Setting CSS dimensions larger than the buffer causes pixelation.
        Object.assign(el.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '99999',
          pointerEvents: 'none',
        });
        console.log('[DiceBox] Canvas styled OK:', el.id || el.tagName);
      }

      // Try immediately in case it already exists
      const existing = document.getElementById('dice-canvas');
      if (existing) styleCanvas(existing);

      // Also observe body for any canvas added during/after init
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.tagName === 'CANVAS') {
              styleCanvas(node);
              observer.disconnect();
            }
          });
        }
      });
      observer.observe(document.body, { childList: true });

      await globalBox.init();

      // Disconnect observer after init settles; canvas should be styled by now
      setTimeout(() => {
        observer.disconnect();
        // Last-chance check
        const canvas = document.getElementById('dice-canvas') ||
                       document.body.querySelector('canvas');
        if (canvas && !(canvas as HTMLElement).style.position) {
          styleCanvas(canvas as HTMLElement);
        }
      }, 2000);

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