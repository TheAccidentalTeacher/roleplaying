/**
 * Type declarations for @3d-dice/dice-box v1.1.4
 * Library: https://fantasticdice.games
 * Babylon.js v5.57.1 + Ammo.js WASM physics
 *
 * Canvas: The library appends <canvas class="dice-box-canvas"> to the container
 * element. With container:'body' the canvas is full-viewport.
 * IMPORTANT: CSS must size the canvas BEFORE init() runs — the library reads
 * clientWidth/clientHeight at init time to set physics world bounds.
 *
 * Asset layout (assetPath: '/dice/'):
 *   /dice/world.offscreen.js  — offscreen physics worker
 *   /dice/Dice.js             — die mesh worker
 *   /dice/ammo/               — Ammo.js WASM physics files
 *   /dice/themes/default/     — die face textures
 */
declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    /** CSS selector or 'body'. The library creates its canvas inside this element. */
    container?: string;
    /** HTML id to give the canvas element (defaults to 'dice-canvas-{timestamp}'). */
    id?: string;
    /** Base URL for worker + WASM + theme assets. Must end with '/'. e.g. '/dice/' */
    assetPath?: string;
    /** Theme name, maps to a folder under assetPath/themes/. Default: 'default' */
    theme?: string;
    /** CSS color string applied to die faces. e.g. '#f59e0b' for amber. */
    themeColor?: string;
    /** Use OffscreenCanvas + web worker for physics (better perf). Falls back to false if unsupported. */
    offscreen?: boolean;
    /** Die size relative to canvas. Current app value: 6. */
    scale?: number;
    /** Gravity multiplier. Default: 1 */
    gravity?: number;
    /** Die mass. Affects collision response. Default: 1 */
    mass?: number;
    /** Surface friction coefficient. Default: 0.8 */
    friction?: number;
    /** Bounciness (0 = no bounce, 1 = fully elastic). Default: 0.1 */
    restitution?: number;
    /** Angular velocity damping. Higher = stops spinning sooner. Default: 0.4 */
    angularDamping?: number;
    /** Linear velocity damping. Higher = slides to rest sooner. Default: 0.4 */
    linearDamping?: number;
    /** Rotational force applied at launch. Default: 5 */
    spinForce?: number;
    /** Translational force applied at launch. Current app value: 8 */
    throwForce?: number;
    /** Height above the floor from which dice are dropped. Default: 8 */
    startingHeight?: number;
    /** Milliseconds to wait after last movement before declaring roll complete. Default: 5000 */
    settleTimeout?: number;
    /** Pause physics simulation (useful for performance when not rolling). */
    suspendSimulation?: boolean;
    /** Enable shadow rendering. Slightly more expensive. Default: true */
    enableShadows?: boolean;
    /** Ambient + directional light intensity. Default: 1 */
    lightIntensity?: number;
    /** Milliseconds between rolling each die in a multi-die roll. Default: 100 */
    delay?: number;
    onBeforeRoll?: () => void;
    onRollComplete?: (results: DiceResult[]) => void;
  }

  /** A single resolved die result from onRollComplete. */
  interface DiceResult {
    /** Index of the roll group (e.g. all d6s = one group). */
    groupId: number;
    /** Index of this die within its group. */
    rollId: number;
    /** Number of faces on this die (4, 6, 8, 10, 12, 20, 100). */
    sides: number;
    /** The actual face value the die landed on — use this, not a pre-rolled number. */
    value: number;
    theme?: string;
  }

  class DiceBox {
    constructor(config: DiceBoxConfig);
    /** Initialise Babylon.js scene, load WASM physics, append canvas to container. */
    init(): Promise<void>;
    /**
     * Roll dice by notation.
     * - Single string: '2d6' or '1d20' (same die type only)
     * - Array: ['2d6', '1d20'] — required for mixed die types
     * Results are delivered via onRollComplete, not this Promise.
     */
    roll(notation: string | string[]): Promise<any[]>;
    /** Remove all dice from the scene. Call before each new roll. */
    clear(): void;
    /** Hide the canvas (opacity 0 transition). */
    hide(): void;
    /** Show the canvas. */
    show(): void;
    /** Assign after init() to receive roll results. */
    onRollComplete: ((results: DiceResult[]) => void) | null;
  }

  export default DiceBox;
}
