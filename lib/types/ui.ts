// ============================================================
// UI TYPES — Panel modes, tabs, layout, component props
// Reference: CHARACTER-SHEET-UI.md
// ============================================================

// ---- Panel & Layout ----

export type PanelMode = 'collapsed' | 'compact' | 'expanded' | 'fullscreen';
export type LayoutBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

export type GameTab =
  | 'narrative'
  | 'character'
  | 'inventory'
  | 'map'
  | 'journal'
  | 'combat'
  | 'quests'
  | 'bestiary'
  | 'settings';

export type CharacterSheetTab =
  | 'overview'
  | 'abilities'
  | 'inventory'
  | 'spells'
  | 'features'
  | 'notes';

export type InventoryView = 'grid' | 'list' | 'equipped';
export type MapView = 'world' | 'regional' | 'dungeon' | 'tactical';

// ---- Notification & Toast ----

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'loot' | 'combat';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number; // ms, default 5000
  icon?: string;
  dismissible: boolean;
  timestamp: number;
}

// ---- Modal ----

export type ModalType =
  | 'confirm'
  | 'item-detail'
  | 'character-detail'
  | 'npc-detail'
  | 'spell-detail'
  | 'map-viewer'
  | 'dice-roller'
  | 'settings'
  | 'save-load'
  | 'loot-pickup'
  | 'level-up'
  | 'rest'
  | 'shop'
  | 'craft';

export interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data?: Record<string, unknown>;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ---- Dice Roller ----

export interface DiceRollDisplay {
  id: string;
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  purpose: string; // e.g., "Attack Roll", "Damage"
  advantage?: boolean;
  disadvantage?: boolean;
  criticalHit?: boolean;
  criticalFail?: boolean;
  timestamp: number;
}

// ---- Chat / Narrative ----

export type MessageRole = 'user' | 'dm' | 'system' | 'narrator';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  diceRolls?: DiceRollDisplay[];
  imageUrl?: string;
  metadata?: {
    combatAction?: string;
    questUpdate?: string;
    itemReceived?: string;
    xpGained?: number;
  };
}

// ---- Theme & Settings ----

export type ThemeMode = 'dark' | 'light' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';
export type AnimationLevel = 'none' | 'reduced' | 'full';

export interface UserSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  animations: AnimationLevel;
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoSave: boolean;
  autoSaveIntervalMs: number;
  showDiceRolls: boolean;
  showDamageNumbers: boolean;
  narrativeSpeed: 'instant' | 'fast' | 'normal' | 'dramatic';
  tooltipsEnabled: boolean;
  compactMode: boolean;
}

// ---- UI State (for store) ----

export interface UIState {
  activeTab: GameTab;
  characterSheetTab: CharacterSheetTab;
  panelMode: PanelMode;
  inventoryView: InventoryView;
  mapView: MapView;
  modal: ModalState;
  toasts: Toast[];
  isSidebarOpen: boolean;
  isLoading: boolean;
  loadingMessage: string;
  chatMessages: ChatMessage[];
  diceHistory: DiceRollDisplay[];
  settings: UserSettings;
}
