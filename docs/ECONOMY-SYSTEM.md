# Economy System — Full Design Specification
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: Gold Means Something

In too many RPGs, gold becomes meaningless after mid-game. You have 50,000 gold and nothing to spend it on. In a TTRPG, the DM controls the economy — merchants have limited stock, prices vary, rare items can't just be bought. This system makes gold **always relevant** through:

1. **Money sinks**: There's always something worth buying (training, property, commissions)
2. **Dynamic pricing**: Prices fluctuate based on supply, demand, and your reputation
3. **Merchant personalities**: Shopkeepers are NPCs, not vending machines
4. **Scarcity**: The best items can't be bought — but good ones can

---

## Currency System

### Base Currency

The currency adapts to world genre:

| Genre | Currency | Symbol | Subdivisions |
|-------|----------|--------|-------------|
| Fantasy | Gold Pieces (GP) | 🪙 | 1 GP = 10 Silver (SP) = 100 Copper (CP) |
| Sci-Fi | Credits (CR) | ₵ | 1 Credit = 100 Cents |
| Post-Apocalypse | Caps / Trade Goods | ⊕ | Barter-based, no subdivision |
| Horror | Currency of the setting | $ | Dollars, Francs, Marks, etc. |
| Cyberpunk | Eurodollars (ED) | €$ | 1 ED = 100 cents |
| Steampunk | Sovereigns (SV) | ⚙ | 1 SV = 20 Shillings = 240 Pence |

### Starting Gold

Based on character background (from PLAYER-HANDBOOK):

| Background | Starting Gold | Starting Items |
|-----------|--------------|---------------|
| Noble | 200 GP | Fine clothes, signet ring, letter of introduction |
| Merchant | 150 GP | Cart, trade goods, merchant contacts |
| Soldier | 75 GP | Weapons, armor, military badge |
| Criminal | 100 GP | Thieves' tools, dark clothes, fence contact |
| Scholar | 50 GP | Books, ink, writing supplies, library access |
| Urchin | 15 GP | Knife, street clothes, pet mouse, survival instinct |
| Hermit | 25 GP | Herbs, staff, journal of discoveries |

### Gold Sources

Where gold comes from during gameplay:

```
COMBAT LOOT          — Enemies carry gold. Difficulty affects amount.
QUEST REWARDS        — Major quests pay well. Side quests pay less.
SELLING ITEMS        — Sell unwanted loot to merchants.
CRAFTED ITEMS        — Craft and sell for profit.
TREASURE HOARDS      — Dungeon treasure rooms, buried treasure, hidden stashes.
SERVICES             — Bard performs, healer heals NPCs, etc.
GAMBLING             — Win gold at games (or lose it).
BOUNTIES             — Bounty board rewards for eliminating threats.
THEFT                — Pickpocket, burglary (risky, consequences if caught).
BUSINESS INCOME      — If you own a shop/tavern (downtime activity).
INVESTMENTS          — Put gold into ventures, get returns later.
DISCOVERED VALUABLES — Art objects, gems, sellable artifacts.
```

---

## Merchant System

### Merchants as NPCs

Every merchant is a **persistent NPC** with personality, inventory, and relationship with the player:

```typescript
interface Merchant extends NPC {
  // Commerce-specific
  shopName: string              // "Ironforge Arms", "The Bubbling Cauldron"
  shopType: ShopType
  
  // Inventory
  inventory: MerchantInventory
  restockSchedule: RestockRule
  
  // Pricing
  basePriceModifier: number     // 1.0 = standard, 0.9 = cheap, 1.3 = expensive
  haggleWillingness: number     // 0-100, how much they'll negotiate
  reputationDiscount: number    // % discount based on relationship
  
  // Behavior
  buyFromPlayer: boolean        // Will they buy your items?
  buyPriceMultiplier: number    // 0.3 = pays 30% of value, 0.5 = 50%
  specialInterests: string[]    // Items they pay MORE for: ["gems", "ancient artifacts"]
  refuseToBuy: string[]         // Items they won't touch: ["cursed items", "stolen goods"]
  
  // Quest hooks
  commissionQuests: string[]    // "Bring me 10 iron ingots and I'll forge you something special"
  rumorsKnown: string[]         // Information they'll share if you're friendly
  secretInventory?: Item[]      // Items only shown to trusted customers (high relationship)
}

type ShopType = 
  | 'general-store'      // A bit of everything
  | 'blacksmith'         // Weapons and armor
  | 'alchemist'          // Potions and reagents
  | 'magic-shop'         // Scrolls, wands, magical items
  | 'tailor'             // Cloth armor, bags, fashion
  | 'jeweler'            // Rings, amulets, gems
  | 'herbalist'          // Herbs, medicines, natural remedies
  | 'black-market'       // Illegal goods, poisons, stolen items
  | 'curiosities'        // Rare and unusual items, mystery boxes
  | 'bookshop'           // Spell books, lore tomes, maps
  | 'fletcher'           // Bows, arrows, ranged weapons
  | 'stable'             // Mounts, mount equipment
  | 'tavern'             // Food, drink, rumors, rooms
  | 'temple'             // Holy items, healing services, blessings
```

### Merchant Inventory

Inventory is **not infinite**. Merchants have limited, curated stock that rotates:

```typescript
interface MerchantInventory {
  // What's currently for sale
  currentStock: MerchantItem[]
  
  // Stock tiers — what types of items this merchant CAN have
  stockTiers: {
    common: number          // % chance of common items: 60%
    uncommon: number        // % chance of uncommon: 25%
    rare: number            // % chance of rare: 12%
    epic: number            // % chance of epic: 3%
    legendary: number       // Never in regular stock: 0%
  }
  
  // Restock behavior
  lastRestock: Date
  restockInterval: 'daily' | 'weekly' | 'monthly' | 'event-based'
  maxItems: number          // Total items in stock at once
  
  // Player sold items
  playerSoldItems: Item[]   // Items you sold to this merchant
  playerItemRetentionDays: number  // How long they keep your sold items
}

interface MerchantItem {
  item: Item
  quantity: number          // Limited supply
  price: number            // May differ from base value
  priceNegotiable: boolean // Can you haggle?
  requiresReputation: boolean // Need high relationship to see this
  isNew: boolean           // Just restocked (visual indicator)
}
```

### Restock Rules

Merchants don't have infinite supply. Stock rotates:

```
GENERAL STORE: Restocks weekly
  - Always has: basics (rope, rations, torches, bedrolls)
  - Rotates: 3-5 random uncommon items per restock
  - Rare items: 10% chance of 1 rare item per restock

BLACKSMITH: Restocks on delivery (event-based)
  - Iron/steel weapons always available
  - Special materials (mithril, adamantine) appear when supply arrives
  - Can commission custom work (takes days, costs more)

MAGIC SHOP: Restocks monthly  
  - Random 2-4 scrolls and potions
  - 1 uncommon magic item
  - 5% chance of a rare magic item
  - NEVER stocks legendary items (those are quest rewards)

BLACK MARKET: Restocks irregularly
  - Different inventory every time
  - Prices are higher (illegal goods markup)
  - Unique items not found elsewhere
  - Might have stolen quest items...
```

---

## Shopping Experience

### The Shop UI

When entering a shop, the AI generates an atmospheric description + structured inventory:

```
You push through the heavy door of IRONFORGE ARMS. 
The heat from the forge hits you immediately. Brenn, 
a scarred dwarf with arms like tree trunks, looks up 
from his work.

"Ah, you again. Looking to buy or sell today?"

🏪 IRONFORGE ARMS — Brenn (Blacksmith)
Relationship: Friendly (+15)  |  Discount: 5%

FOR SALE:                              PRICE (after discount)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COMMON]  Iron Longsword               38 GP
[COMMON]  Steel Shield                  48 GP
[COMMON]  Chain Mail Armor             143 GP
[UNCOMMON] Dwarven Warhammer            190 GP  ⭐ NEW
[UNCOMMON] Reinforced Steel Plate       380 GP
[RARE]    Flamesteel Dagger             850 GP  🔥 SPECIAL
[SERVICE] Repair Equipment              5-50 GP (depends on damage)
[SERVICE] Sharpen Weapons               10 GP (+1 dmg, 24hr)
[SERVICE] Custom Commission             Varies (ask Brenn)

YOUR GOLD: 347 GP

[Buy an item]  [Sell items]  [Ask about Custom Work]
[Haggle]  [Talk to Brenn]  [Leave]
```

### Haggling System

Players can negotiate prices. This is a **mini social encounter**:

```typescript
interface HaggleAttempt {
  basePrice: number
  merchantWillingness: number    // How much they'll budge
  playerCHA: number
  relationshipBonus: number
  
  // The haggle roll
  persuasionDC: number           // Based on item rarity and merchant personality
  
  // Outcomes
  outcomes: {
    criticalSuccess: number      // Beat DC by 10+: 30% off
    success: number              // Beat DC: 10-20% off
    partialSuccess: number       // Beat DC by 1-2: 5% off
    failure: number              // Miss DC: No discount
    criticalFailure: number      // Miss by 10+: Merchant offended, prices go UP
  }
}
```

Example haggle flow:
```
"That Flamesteel Dagger is 850 gold? That's steep, Brenn."

[Persuasion check: DC 18]

Roll options:
  [Honest appeal] — "I'm on a quest to save Millhaven. Can you help?"
  [Flattery] — "Only the finest dwarven craftsman could make such a blade."
  [Business pitch] — "I'll bring you rare materials from my adventures."
  [Hard bargain] — "I've seen similar for 600 at the capital."
  [Walk away] — Sometimes the best negotiation is leaving.
  
[Your approach]: ___
```

The AI evaluates the player's argument, not just the roll:
- A good argument might lower the DC
- A bad argument might raise it
- Referencing the merchant's interests (they want rare materials?) helps
- Insulting their work HURTS

---

## Price Tables

### Baseline Prices (Fantasy Setting)

#### Adventuring Gear
| Item | Price |
|------|-------|
| Rope (50ft) | 1 GP |
| Torch (10) | 1 GP |
| Rations (1 day) | 5 SP |
| Bedroll | 1 GP |
| Waterskin | 2 SP |
| Backpack | 2 GP |
| Healing Kit | 5 GP |
| Climber's Kit | 25 GP |
| Thieves' Tools | 25 GP |

#### Weapons
| Item | Price | Damage |
|------|-------|--------|
| Dagger | 2 GP | 1d4 piercing |
| Longsword | 15 GP | 1d8 slashing |
| Greatsword | 50 GP | 2d6 slashing |
| Shortbow | 25 GP | 1d6 piercing |
| Longbow | 50 GP | 1d8 piercing |
| Hand Crossbow | 75 GP | 1d6 piercing |
| Staff | 5 GP | 1d6 bludgeoning |
| Warhammer | 15 GP | 1d8 bludgeoning |

#### Armor
| Item | Price | AC |
|------|-------|-----|
| Leather Armor | 10 GP | 11 + DEX |
| Chain Shirt | 50 GP | 13 + DEX (max 2) |
| Scale Mail | 50 GP | 14 + DEX (max 2) |
| Chain Mail | 75 GP | 16 |
| Plate Armor | 1,500 GP | 18 |
| Shield | 10 GP | +2 AC |

#### Potions & Consumables
| Item | Price |
|------|-------|
| Healing Potion (2d4+2) | 50 GP |
| Greater Healing (4d4+4) | 150 GP |
| Superior Healing (8d4+8) | 500 GP |
| Mana Potion (restore 30) | 75 GP |
| Antidote | 50 GP |
| Alchemist's Fire | 50 GP |
| Smoke Bomb | 25 GP |
| Scroll (Common spell) | 50-100 GP |
| Scroll (Rare spell) | 500-2,500 GP |

#### Services
| Service | Price |
|---------|-------|
| Inn (common room) | 5 SP / night |
| Inn (private room) | 2 GP / night |
| Inn (luxury suite) | 10 GP / night |
| Meal (modest) | 3 SP |
| Meal (fine) | 8 SP |
| Stabling (per day) | 5 SP |
| Healing (temple) | 10-100 GP per spell level |
| Cure Disease | 100 GP |
| Remove Curse | 250 GP |
| Resurrection | 1,000 GP + quest |
| Identify magic item | 20 GP per item |
| Weapon enchantment | 500+ GP |
| Training (per day) | 1-10 GP depending on skill |
| Messenger service | 2 GP per day of travel |
| Guide/Scout hire | 5 GP / day |
| Mercenary hire | 2-10 GP / day depending on quality |

---

## Dynamic Pricing

Prices aren't fixed — they respond to the world state:

```typescript
interface PriceModifier {
  factor: string
  modifier: number          // Multiplier (1.0 = normal)
  
  // Examples:
  // { factor: "war nearby", modifier: 1.5 }           — everything costs more during war
  // { factor: "trade route disrupted", modifier: 2.0 } — specific goods scarce
  // { factor: "harvest season", modifier: 0.8 }        — food is cheap
  // { factor: "you saved the town", modifier: 0.85 }   — gratitude discount
  // { factor: "you're an outsider", modifier: 1.2 }    — stranger tax
  // { factor: "black market", modifier: 1.5 }          — illegal markup
  // { factor: "faction reputation", modifier: 0.9 }    — guild member discount
  // { factor: "bulk purchase", modifier: 0.95 }        — buying a lot? Small discount
}

function calculateFinalPrice(
  basePrice: number,
  merchant: Merchant,
  player: Character,
  worldState: WorldState
): number {
  let price = basePrice
  
  // Merchant personality
  price *= merchant.basePriceModifier
  
  // Relationship discount
  price *= (1 - merchant.reputationDiscount * getRelationshipLevel(merchant, player))
  
  // World modifiers
  for (const mod of getActivePriceModifiers(worldState)) {
    price *= mod.modifier
  }
  
  // Haggle result (if applicable)
  price *= haggleDiscount
  
  return Math.round(price)
}
```

---

## Money Sinks (Where Gold Goes)

The key to a functioning economy: **there must always be something worth spending gold on**.

### Tier 1: Essential Spending (Always Relevant)
- **Potions and consumables** — You always need more
- **Repairs** — Equipment degrades (durability system from BRAINSTORM)
- **Inn and food** — Rest costs money in towns
- **Ammunition** — Arrows, bolts, thrown weapons need restocking
- **Crafting materials** — Ingredients for alchemy, smithing

### Tier 2: Upgrade Spending (Mid-Game)
- **Better equipment** — Always a better sword out there
- **Training fees** — Learn new skills from masters
- **Enchantments** — Add magical properties to your gear
- **Gems and sockets** — Socket upgrades for equipment
- **Mounts** — Horses, exotic mounts, mount equipment
- **Hirelings** — Mercenaries, porters, specialists

### Tier 3: Luxury Spending (Late-Game)
- **Property** — Buy a house, a shop, a fortress
- **Business investment** — Fund a merchant venture for passive income
- **Commission legendary items** — Pay a master smith + provide materials
- **Political influence** — Bribe officials, fund campaigns, buy titles
- **Sponsoring** — Fund an expedition, a school, a temple
- **Trophy room** — Display your legendary loot (HeroForge gallery)
- **Ship** — Buy and outfit a vessel

### Tier 4: World-Shaping Spending (End-Game)
- **Build a stronghold** — Full base-building system
- **Raise an army** — Fund soldiers for the final war
- **Found a settlement** — Create a new town
- **Artifact creation** — Fund the creation of a mythic item
- **Dimensional travel** — Pay for portal magic

```typescript
interface GoldSink {
  name: string
  category: 'essential' | 'upgrade' | 'luxury' | 'world-shaping'
  cost: number | string       // Fixed or range
  recurring: boolean          // Is this a one-time or recurring cost?
  available: string           // When this becomes available
  description: string
}
```

---

## Selling System

### What You Can Sell

```
SELL TO MERCHANTS:
  - Weapons and armor: 30-50% of base value
  - Potions and consumables: 50% of base value
  - Crafting materials: 60-80% of base value (merchants want these)
  - Gems: 70-90% of base value (easy to resell)
  - Junk items: 10-20% of base value (vendor trash)
  - Quest items: CANNOT SELL (marked as quest items)
  - Unique/legendary: Some merchants will pay premium, most can't afford

SELL TO SPECIALISTS:
  - Magic items → magic shop: Better prices (60-70%)
  - Rare materials → craftsman: Best prices (80-90%)
  - Books/scrolls → scholar: Good prices (60-70%)
  - Stolen goods → fence (black market): Low prices (20-40%) but no questions

SELL VIA AUCTION:
  - Available in major cities
  - Takes time (1-3 days in-game)
  - Can get 80-120% of base value
  - Risk: item might not sell
  - Fee: 10% auctioneer cut
```

### Bulk Selling

After a dungeon crawl, players accumulate lots of loot. Quick sell option:

```
You return to Millhaven loaded with loot from the dungeon.

📦 INVENTORY REVIEW — Sell at Ironforge Arms?

WEAPONS (Brenn buys at 40%):
  [✓] Rusted Goblin Scimitar ×3    → 6 GP total
  [✓] Orcish Battle Axe            → 12 GP
  [ ] Flamesteel Dagger             → Keep (it's rare!)
  
ARMOR (Brenn buys at 35%):
  [✓] Goblin Leather Scraps ×5     → 5 GP total
  [✓] Dented Iron Shield           → 3 GP

MISCELLANEOUS (Brenn not interested — try general store):
  [ ] Ancient Tome                  → ❌ Can't sell here
  [ ] Mysterious Gem                → ❌ Can't sell here  

TOTAL SALE: 26 GP

[Sell Selected]  [Sell All Junk]  [Cancel]
```

---

## Gambling

### Games of Chance

Available at taverns and certain locations:

```typescript
interface GamblingGame {
  name: string              // "Three Dragon Ante", "Liar's Dice", "Arm Wrestling"
  type: 'pure-chance' | 'skill-based' | 'hybrid'
  minBet: number
  maxBet: number
  
  // Resolution
  playerSkill?: string      // "Insight" for poker, "Athletics" for arm wrestling
  dc?: number               // Skill DC if applicable
  houseEdge: number         // 0.0 to 0.3 — how much the game favors the house
  
  // Cheating
  canCheat: boolean
  cheatSkill: string        // "Sleight of Hand"
  cheatDC: number           // DC to cheat successfully
  caughtConsequence: string // What happens if caught
}
```

Available games:
| Game | Type | Skill | Notes |
|------|------|-------|-------|
| Dice (high roll) | Pure chance | None | Simple, fast, fair |
| Three Dragon Ante | Hybrid | Insight DC 13 | Poker-like, read opponents |
| Arm Wrestling | Skill | Athletics vs Athletics | STR contest |
| Liar's Dice | Hybrid | Deception / Insight | Bluffing game |
| Monster Fights | Pure chance | Animal Handling to pick well | Bet on pit fights |
| Card Shark | Skill | Sleight of Hand DC 15 | You cheat. Don't get caught. |

---

## Property and Business

### Buying Property

Late-game money sink: real estate.

```typescript
interface Property {
  type: 'house' | 'shop' | 'tavern' | 'farm' | 'workshop' | 'tower' | 'fortress' | 'ship'
  name: string
  location: string
  purchasePrice: number
  maintenanceCost: number     // Per in-game month
  
  // Benefits
  freeRest: boolean           // Rest here for free
  storage: number             // Extra inventory slots
  income?: number             // Passive gold per month (if business)
  craftingBonus?: string      // "Workshop provides +2 to Smithing"
  reputationBonus?: number    // Owning property boosts local reputation
  
  // Upgrades
  availableUpgrades: PropertyUpgrade[]
  
  // NPCs
  employees?: NPC[]           // Hired staff
  visitors?: NPC[]            // Random visitors with quests/trade
}
```

Property prices:
| Property | Price | Monthly Cost | Income |
|----------|-------|-------------|--------|
| Small house | 500 GP | 10 GP | — |
| Shop | 1,500 GP | 30 GP | 50-100 GP/month |
| Tavern | 3,000 GP | 50 GP | 100-200 GP/month |
| Workshop | 2,000 GP | 25 GP | — (crafting bonus) |
| Farm | 1,000 GP | 15 GP | 30-80 GP/month |
| Tower | 5,000 GP | 50 GP | — (arcane bonus) |
| Fortress | 25,000 GP | 200 GP | — (military power) |
| Ship | 10,000 GP | 100 GP | Variable (trade/piracy) |

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Currency system | Genre-adaptive (GP for fantasy, Credits for sci-fi, etc.) | Immersion over consistency |
| Starting gold | Varies by background (15-200 GP range) | Meaningful starting differences |
| Merchant system | Full NPC merchants with inventory, personality, relationship | Not vending machines |
| Inventory limits | Merchants have limited, rotating stock | Scarcity creates value |
| Haggling | CHA-based social encounter, player argument affects DC | Rewards roleplay |
| Dynamic pricing | World events modify prices (war, harvest, reputation) | Living economy |
| Sell prices | 30-50% to merchants, higher to specialists, auctions available | Items retain some value |
| Money sinks | 4 tiers: essential → upgrade → luxury → world-shaping | Gold always relevant |
| Property system | Buy houses, shops, fortresses — late game gold sink | Base building lite |
| Gambling | 6 game types: chance, skill, hybrid | Tavern gameplay |
| Restock schedule | Varies by shop type: daily to monthly | Creates shopping strategy |
| Black market | Available in cities, higher prices, illegal goods | Risk/reward shopping |
| Custom commissions | Pay merchants to craft specific items (takes time) | Premium crafting option |
| Bulk selling | Quick-sell UI after dungeon runs | QoL feature |
