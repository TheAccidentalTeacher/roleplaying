# Character Sheet UI — Full Design Specification
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: The Most Beautiful Character Sheet Ever

In TTRPG, your character sheet is your **most personal artifact**. It's covered in eraser marks, has coffee stains, holds years of memories. In this game, the character sheet should be:

1. **Gorgeous** — Dark RPG aesthetic, animated stat bars, glowing highlights
2. **Dense** — Everything visible, nothing hidden behind clicks if possible
3. **Alive** — Stats update in real-time, items glow when equipped, abilities pulse when ready
4. **Personal** — Your portrait, your story-earned abilities, your annotations

---

## Layout: The Five-Tab Panel

The character sheet is a **persistent side panel** that slides out from the right edge of the game screen. It has five tabs, each a full page of content.

```
┌──────────────────────────────────────────────────────────┐
│  GAME NARRATIVE AREA                    [📋 Sheet] [🗺 Map] │
│                                                          │
│  The DM speaks...                       ┌──────────────┐ │
│  "You enter the ancient tomb..."        │ CHAR SHEET   │ │
│                                          │ PANEL        │ │
│  [Action buttons]                        │ (slides out) │ │
│  [Player input]                          │              │ │
│                                          │ [5 tabs]     │ │
│                                          │              │ │
│                                          └──────────────┘ │
└──────────────────────────────────────────────────────────┘
```

The panel can be:
- **Docked** — Always visible, game text area shrinks
- **Overlay** — Overlays the game text when opened
- **Minimized** — Just the tab icons visible, click to expand
- **Detached** — Separate browser window (for dual monitor setups)

---

## Tab 1: OVERVIEW (The Character at a Glance)

This is the D&D character sheet front page. Everything you need during gameplay.

```
┌─────────────────────────────────────┐
│        ╔══════════════╗             │
│        ║  [PORTRAIT]  ║  KAELITH STORMWEAVER  │
│        ║   256x256    ║  Level 8 Half-Elf Sorcerer │
│        ╚══════════════╝  "The Stormcaller"    │
│                                               │
│  ═══════════════════════════════════          │
│  HP  [████████████░░░░] 67/100               │
│  MP  [████████░░░░░░░░] 40/80                │
│  STM [████████████████] 50/50                │
│  XP  [██████████░░░░░░] 4,200/6,000          │
│  ═══════════════════════════════════          │
│                                               │
│  ┌─────┬─────┬─────┐                         │
│  │ STR │ DEX │ CON │                         │
│  │  12 │  14 │  13 │                         │
│  │ (+1)│ (+2)│ (+1)│                         │
│  ├─────┼─────┼─────┤                         │
│  │ INT │ WIS │ CHA │                         │
│  │  10 │  15 │  20 │                         │
│  │ (+0)│ (+2)│ (+5)│                         │
│  └─────┴─────┴─────┘                         │
│                                               │
│  AC: 15  |  Init: +2  |  Speed: 30ft         │
│  Prof: +3  |  Passive Perception: 14          │
│                                               │
│  SAVING THROWS:                               │
│  ✓ CON +4  ✓ CHA +8  │  STR +1  DEX +2      │
│  INT +0   WIS +2                              │
│                                               │
│  ─── ACTIVE CONDITIONS ───                    │
│  ⚡ Inspired (+1d4 to next check)             │
│  🛡️ Mage Armor (AC 13 + DEX, 8hrs)           │
│                                               │
│  ─── QUICK ACTIONS ───                        │
│  [⚔️ Attack]  [🛡️ Defend]  [🎒 Items]        │
│  [✨ Spells]  [💬 Talk]   [🔍 Examine]       │
│                                               │
│  ─── GOLD ───                                 │
│  🪙 347 GP  |  42 SP  |  15 CP               │
│                                               │
│  ─── DEATH SAVES ───                          │
│  Success: ○ ○ ○  |  Failure: ○ ○ ○           │
└─────────────────────────────────────┘
```

### Component Breakdown

```typescript
interface OverviewTab {
  // Portrait section
  portrait: {
    imageUrl: string          // AI-generated or HeroForge screenshot
    canRegenerate: boolean    // Click to regenerate with AI
    frameStyle: string        // 'ornate-gold' | 'dark-iron' | 'ethereal' | matches class
  }
  
  // Identity
  name: string
  title: string               // Earned title: "The Stormcaller"
  level: number
  race: string
  class: string
  subclass?: string
  background: string
  
  // Resource bars (animated, gradient colored)
  hp: ResourceBar             // Red gradient
  mana: ResourceBar           // Blue gradient 
  stamina: ResourceBar        // Green gradient
  xp: ResourceBar             // Gold gradient
  
  // Ability scores (6-grid, shows score + modifier)
  abilityScores: AbilityScores
  
  // Derived stats
  armorClass: number
  initiative: number
  speed: number
  proficiencyBonus: number
  passivePerception: number
  
  // Saving throws (shows proficiency)
  savingThrows: { [ability: string]: { bonus: number; proficient: boolean } }
  
  // Active conditions (buffs/debuffs with icons)
  conditions: ActiveCondition[]
  
  // Quick action buttons (context-aware)
  quickActions: QuickAction[]
  
  // Currency display
  gold: { gp: number; sp: number; cp: number }
  
  // Death saves (only visible when relevant)
  deathSaves: { successes: number; failures: number }
}

interface ResourceBar {
  current: number
  max: number
  temporary?: number         // Temp HP shown as overlay
  color: string              // CSS gradient
  animateOnChange: boolean   // Pulse animation when value changes
  showNumbers: boolean       // Show "67/100" text
}
```

### Visual Design Notes

```css
/* Color palette for the character sheet */
:root {
  --sheet-bg: #1a1a2e;           /* Deep navy background */
  --sheet-border: #16213e;       /* Darker border */
  --sheet-accent: #e94560;       /* Red accent for HP */
  --sheet-mana: #0f3460;         /* Deep blue for mana */
  --sheet-gold: #d4a574;         /* Warm gold for XP, currency */
  --sheet-text: #e0e0e0;         /* Light gray text */
  --sheet-text-dim: #8888aa;     /* Dimmed text */
  --sheet-highlight: #ffd700;    /* Bright gold for highlights */
  --sheet-success: #4ecca3;      /* Teal for positive */
  --sheet-danger: #e94560;       /* Red for negative */
}

/* Ability score boxes */
.ability-score {
  background: linear-gradient(135deg, #16213e, #1a1a2e);
  border: 1px solid #0f3460;
  border-radius: 8px;
  text-align: center;
  padding: 8px;
}

.ability-score .modifier {
  font-size: 1.2rem;
  color: var(--sheet-highlight);
}

/* Resource bars */
.resource-bar {
  height: 24px;
  border-radius: 12px;
  background: #0a0a1a;
  overflow: hidden;
  position: relative;
}

.resource-bar .fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease-out;
  /* HP: linear-gradient(90deg, #e94560, #ff6b6b) */
  /* Mana: linear-gradient(90deg, #0f3460, #4a9eff) */
  /* Stamina: linear-gradient(90deg, #1a6b3a, #4ecca3) */
}

.resource-bar .temp-overlay {
  position: absolute;
  top: 0;
  background: rgba(255, 215, 0, 0.3);
  border-right: 2px solid gold;
}
```

---

## Tab 2: ABILITIES & SPELLS

All abilities, spells, and skills on one page.

```
┌─────────────────────────────────────┐
│  ═══ ABILITIES & SPELLS ═══        │
│                                     │
│  ─── CLASS ABILITIES ───            │
│  ┌──────────────────────────────┐  │
│  │ ⚡ Metamagic: Twinned Spell  │  │
│  │ Cost: Sorcery Points (3)     │  │
│  │ Target a second creature     │  │
│  │ with the same spell          │  │
│  │ [READY] ▪▪▪▪▪○○ (5/7 SP)   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ 🌊 Font of Magic             │  │
│  │ Convert sorcery points ↔     │  │
│  │ spell slots. Bonus action.    │  │
│  │ [READY]                       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ─── STORY-EARNED ABILITIES ───    │
│  ┌──────────────────────────────┐  │
│  │ 🐉 Dragonscaled              │  │
│  │ Fire resistance (half dmg)    │  │
│  │ Earned: Survived the red     │  │
│  │ dragon's breath in the       │  │
│  │ Thornwood (Session 12)       │  │
│  │ [PASSIVE]                     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ─── SPELLS KNOWN ───              │
│  Slots: 1st ●●●○  2nd ●●○        │
│         3rd ●○○   4th ●○          │
│                                     │
│  CANTRIPS (at will):                │
│  [Fire Bolt] [Prestidigitation]    │
│  [Minor Illusion] [Mage Hand]      │
│                                     │
│  1st LEVEL (3 slots):              │
│  [Shield ●] [Magic Missile ●]     │
│  [Chromatic Orb] [Mage Armor ✓]   │
│                                     │
│  2nd LEVEL (2 slots):              │
│  [Scorching Ray ●] [Misty Step]   │
│  [Hold Person]                      │
│                                     │
│  3rd LEVEL (1 slot):               │
│  [Fireball ●] [Counterspell]      │
│                                     │
│  4th LEVEL (1 slot):               │
│  [Polymorph]                        │
│                                     │
│  ● = slot used  ✓ = currently active│
│                                     │
│  ─── SKILLS ───                     │
│  ✓ Arcana        +6               │
│  ✓ Deception     +8               │
│  ✓ Insight       +5               │
│  ✓ Persuasion    +8               │
│    Acrobatics    +2               │
│    Athletics     +1               │
│    History       +0               │
│    Medicine      +2               │
│    Perception    +2               │
│    ... [Show All Skills]           │
│                                     │
│  ─── PROFICIENCIES ───             │
│  Weapons: Daggers, darts, slings  │
│  Armor: None                       │
│  Tools: None                       │
│  Languages: Common, Elvish,       │
│    Draconic                        │
└─────────────────────────────────────┘
```

### Spell Card (click to expand)

```
┌─────────────────────────────────────┐
│  ⚡ FIREBALL                        │
│  3rd-level Evocation                │
│  ────────────────────────────────   │
│  Casting Time: 1 action             │
│  Range: 150 feet                    │
│  Area: 20-foot radius sphere        │
│  Duration: Instantaneous            │
│  Components: V, S, M               │
│  ────────────────────────────────   │
│  A bright streak flashes from your  │
│  pointing finger to a point you     │
│  choose within range and then       │
│  blossoms with a low roar into an   │
│  explosion of flame.                │
│                                      │
│  Damage: 8d6 fire damage            │
│  Save: DEX save for half            │
│  At Higher Levels: +1d6 per slot    │
│  ────────────────────────────────   │
│  [Cast Now]  [Upcast (4th)] [Back]  │
│                                      │
│  💡 AI TIP: "Enemies are grouped    │
│  near the oil barrels — Fireball     │
│  would hit 4 of them AND ignite      │
│  the barrels for bonus damage."      │
└─────────────────────────────────────┘
```

---

## Tab 3: INVENTORY & EQUIPMENT

```
┌─────────────────────────────────────┐
│  ═══ INVENTORY & EQUIPMENT ═══     │
│                                     │
│  ─── EQUIPPED ───                   │
│  ┌─────────────────────────────┐   │
│  │     [Head: Empty]            │   │
│  │  [Ring1]  [Amul.]  [Ring2]  │   │
│  │     [Chest: Robe of Stars]  │   │
│  │  [Main: Staff] [Off: ---]   │   │
│  │     [Legs: Traveler's]      │   │
│  │  [Gloves: Bracers]         │   │
│  │     [Feet: Boots of Speed] │   │
│  └─────────────────────────────┘   │
│                                     │
│  Total AC: 15 (13 base + 2 DEX)    │
│  Total Bonuses: +2 INT, +1 CHA    │
│                                     │
│  ─── BACKPACK ───                   │
│  Capacity: 24/30 slots             │
│  Weight: 42/150 lbs                │
│                                     │
│  Sort: [Name] [Rarity] [Type] [New]│
│                                     │
│  [💜] Wand of Lightning    ×1      │
│       +2d6 lightning, 7 charges     │
│       [Equip] [Drop] [Inspect]     │
│                                     │
│  [🔵] Greater Healing Pot. ×3      │
│       Restore 4d4+4 HP             │
│       [Use] [Drop]                  │
│                                     │
│  [🟢] Iron Ingot           ×12     │
│       Crafting material             │
│       [Drop] [Inspect]             │
│                                     │
│  [⬜] Torch                ×6      │
│       Light source, 1hr each       │
│       [Use] [Drop]                  │
│                                     │
│  [🟡] Ancient Tome         ×1      │
│       📕 Quest Item                │
│       [Read] [Inspect]             │
│                                     │
│  ... [Show All (24 items)]          │
│                                     │
│  ─── QUICK SLOTS ───               │
│  [1: Health Pot] [2: Mana Pot]     │
│  [3: Scroll of TP] [4: Bomb]      │
│                                     │
│  🪙 347 GP  |  42 SP  |  15 CP    │
└─────────────────────────────────────┘
```

### Equipment Paper Doll

The equipped items section uses a visual paper doll layout:

```typescript
interface PaperDoll {
  slots: {
    head: EquipSlot
    amulet: EquipSlot
    chest: EquipSlot
    hands: EquipSlot
    mainHand: EquipSlot
    offHand: EquipSlot
    ring1: EquipSlot  
    ring2: EquipSlot
    legs: EquipSlot
    feet: EquipSlot
    back: EquipSlot       // Cloak/cape
    waist: EquipSlot      // Belt
  }
}

interface EquipSlot {
  slotName: string
  equipped: Item | null
  validItemTypes: string[]
  bonusDisplay: string      // Shown on hover
}
```

### Item Rarity Colors

Used consistently throughout the UI:

```typescript
const rarityColors = {
  junk:      '#9d9d9d',  // Gray
  common:    '#ffffff',  // White
  uncommon:  '#1eff00',  // Green
  rare:      '#0070dd',  // Blue
  epic:      '#a335ee',  // Purple
  legendary: '#ff8000',  // Orange
  mythic:    '#e6cc80',  // Gold/tan
  set:       '#00ff96',  // Bright teal
}
```

---

## Tab 4: JOURNAL & LORE

The player's personal chronicle — maps, quest log, bestiary, notes.

```
┌─────────────────────────────────────┐
│  ═══ JOURNAL & LORE ═══            │
│                                     │
│  [📜 Quests] [🗺 Maps] [📖 Lore]  │
│  [🐉 Bestiary] [📝 Notes]         │
│                                     │
│  ─── ACTIVE QUESTS ───             │
│                                     │
│  📜 MAIN QUEST                     │
│  The Shadow Over Millhaven          │
│  "Investigate the source of the     │
│   undead plaguing the valley."      │
│  Progress: ████░░░░ 50%            │
│  ✅ Talked to Mayor Aldric         │
│  ✅ Investigated the cemetery      │
│  ⬜ Find the necromancer's lair    │
│  ⬜ Stop the ritual                │
│                                     │
│  📜 SIDE QUESTS                    │
│  ▸ The Missing Apprentice (new!)   │
│  ▸ Bounty: Wolf Pack (2/5 wolves)  │
│  ▸ Deliver letter to Ironhaven     │
│                                     │
│  ─── COMPLETED QUESTS ───          │
│  ▸ Rescue the merchant caravan ✓   │
│  ▸ Clear the spider cave ✓        │
│                                     │
│  ─── WORLD MAP ───                 │
│  [🗺 Open Full Map]                │
│  Locations discovered: 12/??       │
│  Current location: Millhaven       │
│                                     │
│  ─── BESTIARY ───                  │
│  Creatures discovered: 15/???      │
│  [Zombie ●●●○○] [Ghoul ●●○○○]    │
│  [Wolf ●●●●●] [Orc ●●●○○]        │
│  [Show All Entries]                 │
│                                     │
│  ─── MY NOTES ───                  │
│  ▸ "The mayor seems nervous..."    │
│  ▸ "Brenn mentioned dwarven ruins" │
│  ▸ [Add new note]                  │
└─────────────────────────────────────┘
```

### Quest Tracker Component

```typescript
interface QuestDisplay {
  quest: Quest
  
  // Visual
  icon: string                // Main quest = gold icon, side = silver
  progressBar: number         // 0.0 to 1.0
  objectives: QuestObjective[]
  rewards: QuestReward[]
  
  // Interaction
  canPin: boolean             // Pin to main game UI for easy tracking
  canAbandon: boolean         // Can drop this quest
  showOnMap: boolean          // Show quest markers on map
}
```

---

## Tab 5: PARTY & RELATIONSHIPS

```
┌─────────────────────────────────────┐
│  ═══ PARTY & RELATIONSHIPS ═══     │
│                                     │
│  ─── CURRENT PARTY ───             │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ [Portrait]  LYRA MOONWHISPER │  │
│  │  Level 7 Elf Wizard          │  │
│  │  HP: ████████░░ 45/60        │  │
│  │  MP: ██████░░░░ 35/70        │  │
│  │  Relationship: ████████░░ 78 │  │
│  │  Mood: Worried               │  │
│  │  Loyalty: High               │  │
│  │  [Talk] [Tactics] [Inspect]  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ [Portrait]  THROK IRONJAW    │  │
│  │  Level 8 Half-Orc Fighter    │  │
│  │  HP: ████████████ 95/110     │  │
│  │  Relationship: ██████░░░░ 55 │  │
│  │  Mood: Eager for battle      │  │
│  │  Loyalty: Moderate           │  │
│  │  [Talk] [Tactics] [Inspect]  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ [Portrait]  PIP QUICKFINGERS │  │
│  │  Level 6 Halfling Rogue      │  │
│  │  HP: ██████░░░░ 32/50        │  │
│  │  Relationship: ██████████ 92 │  │
│  │  Mood: Amused                │  │
│  │  Loyalty: Devoted            │  │
│  │  [Talk] [Tactics] [Inspect]  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ─── NOTABLE NPCs ───              │
│  Mayor Aldric — Friendly           │
│  Brenn (Blacksmith) — Friendly     │
│  Lady Vex (Thieves Guild) — Wary   │
│  [Show All Known NPCs (23)]       │
│                                     │
│  ─── FACTIONS ───                  │
│  Millhaven Guard: ████░░ Trusted   │
│  Merchant Guild: ██░░░░ Neutral    │
│  Thieves Guild: █░░░░░ Suspicious  │
│  Temple of Light: █████░ Honored   │
└─────────────────────────────────────┘
```

### Party Member Detail View (click to expand)

Clicking a party member opens a full D&D-style character sheet for them — identical to the player's overview but for the companion:

```typescript
interface PartyMemberDetail {
  // Full stat block (same as player)
  abilityScores: AbilityScores
  hp: ResourceBar
  mana: ResourceBar
  ac: number
  
  // Combat tactics settings
  tactics: {
    mode: 'ai-auto' | 'player-manual' | 'tactics-rules'
    aggressiveness: 'defensive' | 'balanced' | 'aggressive'
    targetPriority: 'nearest' | 'weakest' | 'strongest' | 'caster'
    healthThreshold: number   // % HP where they switch to defensive
    specialRules: string[]    // Player-set combat behavior rules
  }
  
  // Relationship system
  relationship: {
    score: number             // 0-100
    level: 'stranger' | 'acquaintance' | 'companion' | 'friend' | 'close-friend' | 'devoted'
    events: RelationshipEvent[] // "Saved your life in the cave", "You shared your rations"
    personalQuest?: Quest     // Their loyalty quest
    romanceable: boolean
    romanceStatus?: 'none' | 'interested' | 'courting' | 'together'
  }
  
  // Their equipment (viewable, some controllable)
  equipment: PaperDoll
  
  // Their abilities (viewable)
  abilities: Ability[]
}
```

---

## Responsive Design

### Desktop (1200px+)
- Character sheet is a docked side panel (350px wide)
- Game narrative takes remaining width
- Both visible simultaneously

### Tablet (768px-1199px)
- Character sheet is an overlay (90% width)
- Toggle button in header to show/hide
- Swipe to dismiss

### Mobile (< 768px)
- Character sheet is a full-screen view
- Bottom nav bar to switch between game and sheet
- Tabs become a scrollable horizontal bar

```typescript
interface ResponsiveLayout {
  breakpoints: {
    mobile: 768
    tablet: 1200
    desktop: 1440
    ultrawide: 1920
  }
  
  sheetBehavior: {
    mobile: 'fullscreen-toggle'
    tablet: 'overlay'
    desktop: 'docked-side-panel'
    ultrawide: 'docked-wide-panel'  // Extra wide, shows more detail
  }
  
  sheetWidth: {
    mobile: '100%'
    tablet: '90%'
    desktop: '350px'
    ultrawide: '420px'
  }
}
```

---

## Animations & Micro-Interactions

### Resource Bar Animations
- **Damage taken**: HP bar shrinks with a red flash, delayed shadow shows where HP was
- **Healing**: HP bar grows with a green pulse
- **Mana spent**: Blue bar shrinks with a sparkle effect
- **Level up**: XP bar fills, flashes gold, resets with burst animation

### Stat Changes
- When a buff applies: affected stat glows green briefly, shows "+2" floating up
- When a debuff applies: affected stat pulses red, shows "-2" floating down
- When equipment changes stats: old and new values shown side by side for 3 seconds

### Item Interactions
- **Equip item**: Item slides from backpack to equipment slot with a satisfying click
- **Unequip**: Item slides back
- **New item**: Item glows with its rarity color, "NEW" badge
- **Rare+ drops**: Brief celebration animation (screen edge glow in rarity color)
- **Quest item found**: Special quest chime + golden border

### Spell/Ability Ready
- When an ability becomes available (recharged): Subtle pulse on the icon
- When you can cast: Spell slot dots glow
- When you can't cast: Slot dots dim

```typescript
interface CharacterSheetAnimations {
  hpChange: {
    duration: '500ms'
    easing: 'ease-out'
    damageFlash: 'red-pulse 200ms'
    healFlash: 'green-glow 300ms'
    shadowDelay: '200ms'     // Shows where HP was before damage
  }
  
  levelUp: {
    duration: '2000ms'
    steps: ['xp-bar-fill', 'gold-flash', 'burst', 'new-level-display']
    sound: 'level-up-chime'
  }
  
  itemEquip: {
    duration: '300ms'
    easing: 'ease-in-out'
    sound: 'equip-click'
  }
  
  rareItem: {
    glow: 'rarity-color-pulse 1500ms'
    badge: 'NEW tag with fade-in'
    epic_plus: 'screen-edge-shimmer in rarity color'
  }
}
```

---

## Keyboard Shortcuts

```
C          — Toggle character sheet
1-5        — Switch to tab 1-5
I          — Open inventory directly
M          — Open map
J          — Open journal
Escape     — Close sheet / go back
Tab        — Next tab
Shift+Tab  — Previous tab
```

---

## Dark Mode / Theme Variants

The sheet supports multiple visual themes (matches world genre):

| Theme | Background | Accent | Font | Feel |
|-------|-----------|--------|------|------|
| Classic Fantasy | Dark navy (#1a1a2e) | Gold (#ffd700) | Serif | Elegant RPG |
| Dark Fantasy | Near black (#0d0d0d) | Blood red (#8b0000) | Gothic | Grim, heavy |
| Sci-Fi | Dark blue-gray (#1a1a2a) | Cyan (#00ffff) | Monospace | Terminal/HUD |
| Horror | Dark purple-black (#1a0a2e) | Sickly green (#7fff00) | Handwritten | Unsettling |
| Steampunk | Dark brown (#2a1a0a) | Brass (#b5a642) | Victorian serif | Mechanical |
| Post-Apocalypse | Dark olive (#1a1a0a) | Warning orange (#ff6600) | Stencil/military | Survival |

The theme auto-switches based on the world genre. Player can override in settings.

---

## React Component Structure

```typescript
// components/character-sheet/
//   CharacterSheet.tsx        — Main wrapper, tab management
//   tabs/
//     OverviewTab.tsx         — Tab 1: stats, portrait, resources
//     AbilitiesTab.tsx        — Tab 2: abilities, spells, skills
//     InventoryTab.tsx        — Tab 3: equipment, backpack
//     JournalTab.tsx          — Tab 4: quests, maps, bestiary, notes
//     PartyTab.tsx            — Tab 5: party members, NPCs, factions
//   components/
//     ResourceBar.tsx         — Animated HP/MP/XP bars
//     AbilityScore.tsx        — Single ability score box
//     SpellCard.tsx           — Expandable spell detail card
//     SpellSlotTracker.tsx    — Dot-based spell slot display
//     ItemCard.tsx            — Item display with rarity border
//     PaperDoll.tsx           — Equipment slot visual layout
//     QuestTracker.tsx        — Quest with progress bar
//     PartyMemberCard.tsx     — Companion summary card
//     ConditionBadge.tsx      — Active buff/debuff display
//     SkillList.tsx           — Full skill list with proficiency markers
//     FactionBar.tsx          — Reputation bar for factions
//   hooks/
//     useCharacterSheet.ts    — Zustand state for sheet open/close/tab
//     useAnimations.ts        — Animation triggers and timings
//     useResponsive.ts        — Responsive layout management
```

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Layout | 5-tab side panel, dockable/overlay/detachable | Accessible without leaving game |
| Tab 1 (Overview) | Full stat block with resource bars, ability scores, quick actions | The "at a glance" page |
| Tab 2 (Abilities) | Class abilities, story-earned abilities, spells, skills, proficiencies | Everything you can DO |
| Tab 3 (Inventory) | Paper doll equipment + sortable backpack + quick slots | Visual and functional |
| Tab 4 (Journal) | Quest log, maps, bestiary, player notes | The chronicle |
| Tab 5 (Party) | Party member cards, NPC relationships, faction reputation | Social state |
| Visual style | Dark RPG aesthetic, genre-adaptive themes | Matches world genre |
| Animations | Damage flash, heal glow, level-up burst, item equip slide | Juicy micro-interactions |
| Responsive | Desktop=docked, tablet=overlay, mobile=fullscreen | Works on all devices |
| Item rarity colors | WoW-standard: gray/white/green/blue/purple/orange/gold | Instant recognition |
| Spell cards | Expandable detail cards with AI combat tips | Full spell reference |
| Keyboard shortcuts | C=toggle, 1-5=tabs, I=inventory, M=map, J=journal | Power user friendly |
| Component architecture | Modular React components with Zustand state | Clean maintainability |
| Portrait | AI-generated, regeneratable, framed per class | Personal and beautiful |
