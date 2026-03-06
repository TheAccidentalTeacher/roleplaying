declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    container?: string;
    id?: string;
    assetPath?: string;
    theme?: string;
    themeColor?: string;
    offscreen?: boolean;
    scale?: number;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    angularDamping?: number;
    linearDamping?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    settleTimeout?: number;
    suspendSimulation?: boolean;
    enableShadows?: boolean;
    lightIntensity?: number;
    delay?: number;
    onBeforeRoll?: () => void;
    onRollComplete?: (results: DiceResult[]) => void;
  }

  interface DiceResult {
    groupId: number;
    rollId: number;
    sides: number;
    value: number;
    theme?: string;
  }

  class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string): Promise<DiceResult[]>;
    clear(): void;
    hide(): void;
    show(): void;
    onRollComplete: ((results: DiceResult[]) => void) | null;
  }

  export default DiceBox;
}
