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

// Singleton — only one dice-box instance ever exists across the app
let globalBox: any = null;
let globalReady = false;
let globalCallbacks: Array<(results: DiceResult[]) => void> = [];
let globalReadyCallbacks: Array<() => void> = [];
let initPromise: Promise<void> | null = null;

function ensureRootDiv(): HTMLElement {
  let el = document.getElementById('dice-box-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'dice-box-root';
    Object.assign(el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '99999',
      pointerEvents: 'none',
    });
    document.body.appendChild(el);
  }
  return el;
}

async function initGlobalBox(scale: number) {
  if (globalReady) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[DiceBox] Initialising global instance...');
      ensureRootDiv();

      const { default: DiceBox } = await import('@3d-dice/dice-box');

      globalBox = new DiceBox({
        container: '#dice-box-root',
        assetPath: '/dice/assets/',
        theme: 'default',
        offscreen: false,
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

      globalBox.onRollComplete = (results: DiceResult[]) => {
        console.log('[DiceBox] Roll complete:', results);
        globalCallbacks.forEach(cb => cb(results));
      };

      globalReady = true;
      console.log('[DiceBox] Ready ✓');
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
      // Register this instance's result callback
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

    // Renders nothing — the canvas lives on document.body
    return null;
  }
);

DiceBoxCanvas.displayName = 'DiceBoxCanvas';
export default DiceBoxCanvas;


/* ─── Types ─────────────────────────────────────────────── */
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
  /** Unique id — becomes the DOM container id */
  containerId: string;
  width?: number;
  height?: number;
  onResult: (results: DiceResult[]) => void;
  /** Optional: called when box finishes initialising */
  onReady?: () => void;
  theme?: string;
  scale?: number;
}

/* ─── Component ─────────────────────────────────────────── */
const DiceBoxCanvas = forwardRef<DiceBoxHandle, DiceBoxCanvasProps>(
  (
    {
      containerId,
      width = 400,
      height = 260,
      onResult,
      onReady,
      theme = 'default',
      scale = 7,
    },
    ref
  ) => {
    const boxRef = useRef<any>(null);
    const readyRef = useRef(false);
    const onResultRef = useRef(onResult);
    onResultRef.current = onResult;

    useImperativeHandle(ref, () => ({
      roll(notation: string) {
        console.log(`[DiceBox] roll("${notation}") — ready:`, readyRef.current, '| box:', !!boxRef.current);
        if (!boxRef.current || !readyRef.current) return;
        boxRef.current.roll(notation);
      },
      clear() {
        console.log('[DiceBox] clear()');
        if (!boxRef.current) return;
        boxRef.current.clear?.();
      },
    }));

    useEffect(() => {
      let mounted = true;

      const init = async () => {
        console.log(`[DiceBox] Starting init for #${containerId}`);

        const el = document.getElementById(containerId);
        console.log(`[DiceBox] Container element:`, el, '| dimensions:', el?.clientWidth, 'x', el?.clientHeight);

        let DiceBox: any;
        try {
          const mod = await import('@3d-dice/dice-box');
          DiceBox = mod.default;
          console.log('[DiceBox] Module loaded:', DiceBox);
        } catch (err) {
          console.error('[DiceBox] Failed to import module:', err);
          return;
        }

        if (!mounted) return;

        const config = {
          container: '#dice-box-root',
          assetPath: '/dice/assets/',
          theme,
          offscreen: false,
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
        };
        console.log('[DiceBox] Config:', config);

        let box: any;
        try {
          box = new DiceBox(config);
          console.log('[DiceBox] Instance created:', box);
        } catch (err) {
          console.error('[DiceBox] Constructor failed:', err);
          return;
        }

        try {
          console.log('[DiceBox] Calling init()...');
          await box.init();
          console.log('[DiceBox] init() complete');
        } catch (err) {
          console.error('[DiceBox] init() failed:', err);
          return;
        }

        if (!mounted) return;

        box.onRollComplete = (results: DiceResult[]) => {
          console.log('[DiceBox] onRollComplete:', results);
          onResultRef.current(results);
        };

        boxRef.current = box;
        readyRef.current = true;
        console.log('[DiceBox] Ready ✓');
        onReady?.();
      };

      init().catch((err) => console.error('[DiceBox] Unhandled init error:', err));

      return () => {
        mounted = false;
        readyRef.current = false;
        try {
          boxRef.current?.clear?.();
        } catch (_) {}
        boxRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerId, theme, scale]);

    return (
      <div
        id={containerId}
        style={{
          width,
          height,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 12,
          background: 'radial-gradient(ellipse at 60% 40%, #1e293b 0%, #0f172a 70%)',
          boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.6), inset 0 -1px 4px rgba(255,255,255,0.03)',
        }}
      />
    );
  }
);

DiceBoxCanvas.displayName = 'DiceBoxCanvas';
export default DiceBoxCanvas;
