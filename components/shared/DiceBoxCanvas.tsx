'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

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
          container: `#${containerId}`,
          assetPath: '/dice/',
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
