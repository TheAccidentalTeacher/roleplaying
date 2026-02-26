# Exploration System — Travel, Weather & Time
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: The World Breathes

In the best TTRPGs, the world has a **clock**. Day turns to night to dawn. Storms roll in. Seasons change. Traveling isn't a loading screen — it's gameplay. The ranger tracks through rain-soaked forest. The party camps under stars. The Underdark has no sun at all. Time and weather make the world real.

---

## Time System

### The In-Game Clock

Time passes at a pace dictated by narrative events:

```typescript
interface GameClock {
  // Current time
  year: number
  month: number              // 1-12
  day: number                // 1-30 (simplified months)
  hour: number               // 0-23
  timeOfDay: TimeOfDay
  
  // Calendar
  calendarName: string       // "The Common Calendar" or genre-appropriate
  monthNames: string[]       // ["Frostmoon", "Greenleaf", ...] or real months
  weekLength: number         // Usually 7
  dayNames: string[]         // ["Moonday", "Fireday", ...]
  
  // Tracking
  daysSinceStart: number     // Total days elapsed in this playthrough
  questStartDays: Map<string, number>  // When each quest started
  
  // Season
  currentSeason: Season
}

type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight'
type Season = 'spring' | 'summer' | 'autumn' | 'winter'
```

### How Time Passes

Time doesn't tick in real-time. It advances **narratively**:

| Action | Time Cost | Notes |
|--------|----------|-------|
| Conversation with NPC | 10-30 minutes | AI estimates based on dialogue length |
| Combat encounter | 1-10 minutes (in-world) | Combat rounds are 6 seconds each |
| Short rest | 1 hour | Fixed |
| Long rest | 8 hours | Fixed, advances to next day segment |
| Travel (foot, per segment) | 4 hours | One travel segment |
| Travel (mounted) | 4 hours for 2x distance | Faster coverage |
| Shopping | 30 min - 2 hours | Depends on complexity |
| Dungeon exploration (per room) | 5-15 minutes | Searching, traps, etc. |
| Crafting | Variable (hours to days) | Based on complexity |
| Extended rest / downtime | 1-30 days | Player chooses duration |
| Fast travel | Variable (days) | Based on distance, world advances |

### Time of Day Effects

```typescript
interface TimeEffects {
  dawn: {
    visibility: 'dim',
    encounterChance: -10,     // Fewer encounters
    narrative: 'Mist rises from the ground. Birds begin to sing.',
    specialEvents: ['merchants preparing stalls', 'guard shift change']
  },
  morning: {
    visibility: 'bright',
    encounterChance: 0,       // Normal
    narrative: 'Warm sunlight filters through the canopy.',
    specialEvents: ['shops open', 'NPCs at work']
  },
  midday: {
    visibility: 'bright',
    encounterChance: -5,      // Slightly fewer (too hot for ambush)
    narrative: 'The sun beats down from directly overhead.',
    specialEvents: ['markets busiest', 'midday meal']
  },
  afternoon: {
    visibility: 'bright',
    encounterChance: 0,
    narrative: 'Shadows begin to lengthen across the road.',
    specialEvents: ['evening preparations begin']
  },
  dusk: {
    visibility: 'dim',
    encounterChance: +10,     // More encounters (predators emerge)
    narrative: 'The sky turns amber and violet as the sun sinks.',
    specialEvents: ['shops closing', 'taverns filling', 'nocturnal creatures stir']
  },
  evening: {
    visibility: 'dark',
    encounterChance: +15,     // Higher danger
    narrative: 'Darkness has fallen. Stars appear one by one.',
    specialEvents: ['tavern life', 'black market active', 'guard patrols'],
    darkvisionRequired: true  // Non-darkvision characters have disadvantage on perception
  },
  night: {
    visibility: 'dark',
    encounterChance: +20,     // Most dangerous
    narrative: 'The world is still and dark. Only the wind speaks.',
    specialEvents: ['thief activity', 'undead active', 'secret meetings'],
    darkvisionRequired: true
  },
  midnight: {
    visibility: 'pitch-dark',
    encounterChance: +10,     // Fewer than night (most things are sleeping)
    narrative: 'The deepest hour. Even the wind has gone to sleep.',
    specialEvents: ['rituals', 'vampire activity', 'ghostly apparitions'],
    darkvisionRequired: true,
    specialRule: 'Magical events more likely'
  }
}
```

### The Calendar Display

The player can open a calendar view showing:
- Current date and time
- Moon phase (affects certain magic, werewolves, etc.)
- Upcoming events ("Harvest Festival in 3 days", "Monthly market tomorrow")
- Quest deadlines ("The ritual must be stopped within 5 days")
- Seasonal effects

---

## Weather System

### Weather Generation

Weather is generated based on region, season, and narrative needs:

```typescript
interface Weather {
  current: WeatherCondition
  temperature: Temperature
  wind: WindLevel
  visibility: VisibilityLevel
  duration: number            // Hours until weather changes
  forecast: WeatherCondition  // What's coming next
  
  // Effects on gameplay
  travelModifier: number      // Speed multiplier (0.5 = half speed in blizzard)
  combatModifier: string[]    // ["ranged attacks at disadvantage", "fire spells empowered"]
  perceptionModifier: number  // Bonus/penalty to perception checks
  survivalDC: number          // DC for survival checks in this weather
  narrativeDescription: string
}

type WeatherCondition = 
  | 'clear'          // No effects
  | 'overcast'       // Minor mood effect
  | 'light-rain'     // Slight travel penalty, tracks easier to follow
  | 'heavy-rain'     // Travel penalty, ranged disadvantage, tracks washed away
  | 'thunderstorm'   // Heavy rain + lightning risk, metal armor dangerous
  | 'fog'            // Severely reduced visibility, stealth advantage
  | 'snow'           // Cold damage risk, travel penalty, beautiful
  | 'blizzard'       // Severe cold, near-zero visibility, survival check required
  | 'hail'           // Damage risk, travel penalty
  | 'wind'           // Ranged disadvantage, flying hazard
  | 'sandstorm'      // Desert: visibility zero, damage, navigation impossible
  | 'extreme-heat'   // Exhaustion risk, fire spells empowered
  | 'extreme-cold'   // Exhaustion risk, cold spells empowered
  | 'magical-storm'  // Wild magic surges, unpredictable effects
  | 'eclipse'        // Darkness at midday, undead empowered, magical significance
  | 'blood-moon'     // Enhanced undead, lycanthropes transform, dark rituals

type Temperature = 'freezing' | 'cold' | 'cool' | 'mild' | 'warm' | 'hot' | 'scorching'
type WindLevel = 'calm' | 'breeze' | 'windy' | 'strong-wind' | 'gale' | 'hurricane'
```

### Seasonal Weather Tables

```
SPRING:
  Clear 30% | Overcast 25% | Light Rain 20% | Heavy Rain 10% | 
  Thunderstorm 5% | Fog 10%
  Temperature: Cool to Mild

SUMMER:
  Clear 45% | Overcast 15% | Light Rain 10% | Thunderstorm 10% | 
  Extreme Heat 10% | Wind 10%
  Temperature: Warm to Hot

AUTUMN:
  Overcast 30% | Light Rain 25% | Heavy Rain 15% | Fog 15% | 
  Clear 10% | Wind 5%
  Temperature: Mild to Cold

WINTER:
  Overcast 25% | Snow 25% | Clear 15% | Blizzard 10% | 
  Extreme Cold 10% | Fog 10% | Wind 5%
  Temperature: Cold to Freezing
```

### Weather Effect Table

| Weather | Travel Speed | Combat Effect | Special |
|---------|-------------|---------------|---------|
| Clear | Normal | No effect | Best visibility |
| Overcast | Normal | No effect | Harder to navigate by sun |
| Light Rain | 90% | Ranged -1 | Tracks more visible |
| Heavy Rain | 75% | Ranged disadvantage | Tracks washed away, fire extinguished |
| Thunderstorm | 50% | Ranged disadv., lightning risk | Metal armor: CON save or 2d10 lightning |
| Fog | 75% | Visibility 30ft, stealth advantage | Surprise attacks more likely |
| Snow | 75% | Difficult terrain | CON save/hour or 1 exhaustion |
| Blizzard | 25% | Visibility 10ft, all disadv. | CON save/30min or 1 exhaustion, navigation DC 18 |
| Extreme Heat | 90% | CON save/hr or 1 exhaustion | Fire +2d6, cold heals extra |
| Extreme Cold | 75% | CON save/hr or 1 exhaustion | Cold +2d6, fire heals extra |
| Magical Storm | 75% | Wild magic surges on spell cast | Random magical effects |

### AI Weather Narration

The DM weaves weather into descriptions naturally:

```
// Without weather system:
"You walk along the road toward Millhaven."

// With weather system:
"The autumn rain has turned the road to mud. Your boots 
squelch with every step, and Throk's armor runs with 
rivulets of water. Through the gray curtain of rain, 
you can barely make out the lights of Millhaven ahead. 
It's been raining for two days now. The river will be 
high — if the bridge is washed out, you'll need another 
way across."
```

---

## Travel System

### The Travel Loop

When the player decides to travel between locations, the system runs a **travel sequence**:

```
1. DEPARTURE
   - Choose destination (or direction if exploring)
   - Choose travel method (foot, mounted, vehicle, magical)
   - Choose pace (cautious, normal, fast)
   - Estimate travel time based on distance and conditions
   
2. TRAVEL SEGMENTS (4-hour blocks)
   For each segment:
   - Weather check (may change)
   - Random encounter check
   - Navigation check (if necessary)
   - Resource consumption (rations, water)
   - Narrative description of the journey
   
3. EVENTS (if any trigger)
   - Combat encounters
   - Discovery events (find something interesting)
   - Social events (meet travelers)
   - Environmental events (landslide, river crossing)
   - Nothing (peaceful travel, atmospheric narration)
   
4. ARRIVAL
   - Arrive at destination
   - Time of day on arrival
   - First impressions of the location
```

### Travel Pace

```typescript
interface TravelPace {
  pace: 'cautious' | 'normal' | 'fast' | 'forced-march'
  
  speedMultiplier: number     // 0.67x, 1.0x, 1.33x, 1.5x
  encounterModifier: number   // Chance of detecting/avoiding encounters
  perceptionBonus: number     // Bonus to notice things along the way
  stealthPenalty: number      // Penalty to being stealthy
  exhaustionRisk: boolean     // Does this pace risk exhaustion?
  
  descriptions: {
    cautious: 'You move carefully, watching for danger and points of interest.'
    normal: 'You set a steady pace along the path.'
    fast: 'You push the pace, covering ground quickly.'
    forcedMarch: 'You push beyond normal limits. CON save each hour or gain exhaustion.'
  }
}
```

| Pace | Speed | Per Day (8hr) | Encounter Detection | Stealth | Exhaustion |
|------|-------|--------------|-------------------|---------|-----------|
| Cautious | 2 mph | 16 miles | Advantage on Perception | Normal | No |
| Normal | 3 mph | 24 miles | Normal | -5 Stealth | No |
| Fast | 4 mph | 32 miles | -5 Perception | -10 Stealth | No |
| Forced March | 4 mph + extends day | 40+ miles | -5 Perception | Impossible | CON save/hr |

### Travel Methods

```typescript
type TravelMethod = 
  | 'foot'              // 3 mph base, most accessible
  | 'horse'             // 6 mph base, requires mount
  | 'cart-wagon'        // 2 mph, carries lots of goods
  | 'ship-sailing'      // Variable, depends on wind
  | 'ship-rowing'       // 3 mph on water
  | 'flying-mount'      // 8 mph, no terrain penalties
  | 'teleportation'     // Instant, requires spell/device
  | 'portal'            // Instant, requires found portal
  | 'caravan'           // 2 mph, safe, can trade on the way
```

### Navigation

In well-traveled areas (roads, near cities), navigation is automatic. In wilderness, the party needs to navigate:

```typescript
interface NavigationCheck {
  terrain: TerrainType
  baseDC: number
  modifiers: NavigationModifier[]
  navigator: string          // Who's navigating (usually highest WIS)
  result: 'on-course' | 'slightly-off' | 'lost'
}

// Navigation DCs by terrain:
// Road/Trail:        No check needed
// Open Plains:       DC 10
// Forest:            DC 13
// Dense Forest:      DC 15
// Mountains:         DC 14
// Swamp/Marsh:       DC 16
// Desert:            DC 17
// Underground:       DC 18
// Magical/Shifting:  DC 20

// Modifiers:
// Has a map:               -3 to DC
// Been here before:        -5 to DC  
// Guide/ranger:            -5 to DC
// Bad weather:              +2 to +5 to DC
// Night (no darkvision):    +5 to DC
// Compass/navigation tool:  -2 to DC
```

Getting lost:
```
Navigation check: FAILED (Survival DC 15, rolled 12)

You've been walking for hours, but something doesn't 
feel right. The sun is in the wrong position. The 
landmarks don't match your map.

You're lost.

[Try to backtrack – Survival DC 13]
[Climb a tree/hill for vantage – Athletics DC 12]
[Wait and observe – Perception DC 14, costs 1 hour]
[Press forward anyway – higher risk random encounter]
[Ask Lyra to use magic – Locate spell, costs mana]
```

### Terrain Types and Effects

```typescript
interface TerrainType {
  name: string
  speedModifier: number       // 1.0 = normal, 0.5 = half speed
  encounterTypes: string[]    // What kinds of encounters happen here
  forageAvailability: string  // How easy to find food/herbs
  shelterAvailability: string // How easy to find camp spots
  hazards: string[]           // Terrain-specific dangers
  narrativeFeels: string      // Mood/atmosphere
}
```

| Terrain | Speed | Encounters | Forage | Shelter | Hazards |
|---------|-------|-----------|--------|---------|---------|
| Road | 100% | Bandits, travelers, merchants | Poor | Inns | Few |
| Open Plains | 100% | Beasts, mounted enemies, storms | Moderate | Poor | Exposure |
| Forest | 75% | Beasts, fey, bandits, herbs | Excellent | Good | Getting lost |
| Dense Forest | 50% | Predators, magical creatures | Excellent | Moderate | Lost, falls |
| Mountains | 50% | Giants, eagles, goats, caves | Poor | Caves | Falls, altitude, cold |
| Desert | 75% | Scorpions, bandits, djinn | Terrible | Terrible | Heat, dehydration, sandstorms |
| Swamp | 50% | Undead, lizardfolk, disease | Herbs only | Poor | Disease, quicksand, fog |
| Coast | 90% | Pirates, sea creatures, merfolk | Fish | Moderate | Storms, tides |
| Tundra | 75% | Wolves, yeti, frost giants | Terrible | Poor | Cold, blizzards |
| Underground | 50% | Underdark creatures | Fungi | Frequent caves | No sun, cave-ins |

---

## Survival Mechanics

### Resource Consumption

During travel, the party consumes resources:

```typescript
interface TravelResources {
  // Rations: 1 per person per day
  rationsConsumed: number     // Party size × days
  rationsAvailable: number
  
  // Water: 1 waterskin per person per day (2 in hot climates)
  waterConsumed: number
  waterAvailable: number
  
  // Torches/light: 1 per 2 hours in darkness
  lightSourcesConsumed: number
  lightSourcesAvailable: number
  
  // Mount feed: 1 feed per mount per day
  mountFeedConsumed: number
  mountFeedAvailable: number
}
```

### Foraging

Characters can forage during travel (reduces pace by one step):

```
Survival check to forage (DC based on terrain):
  DC 10 (forest):   Find 1d4 days of rations
  DC 13 (plains):   Find 1d2 days of rations
  DC 15 (mountain): Find 1 day of rations
  DC 18 (desert):   Find 1d4 waterskins (if successful at all)
  
  Bonus: Herbalism proficiency → also find 1d4 herbs if DC beaten by 5+
```

### Starvation and Dehydration

If resources run out:

```
NO FOOD:
  Day 1: No effect (body's reserves)
  Day 2: -1 to all ability checks
  Day 3+: 1 level of exhaustion per day
  
NO WATER:
  Day 1: 1 level of exhaustion
  Day 2+: 2 levels of exhaustion per day
  (Dehydration is faster than starvation)
  
EXTREME COLD without shelter:
  CON save DC 10 every hour
  Failure: 1 level of exhaustion
  
EXTREME HEAT without water:
  CON save DC 12 every hour
  Failure: 1 level of exhaustion
```

---

## Discovery System

### Finding Things Along the Way

Travel isn't just "walk from A to B." The world has things to discover:

```typescript
interface TravelDiscovery {
  type: DiscoveryType
  perceptionDC: number        // DC to notice it while traveling
  description: string
  interaction: string[]       // What the player can do
  reward?: string             // If investigated
}

type DiscoveryType = 
  | 'landmark'          // Interesting visual, marks the map
  | 'campsite'          // Safe rest spot
  | 'hidden-path'       // Shortcut or alternative route
  | 'herb-patch'        // Craftable herbs discovered
  | 'ruins'             // Small ruin, possible loot/lore
  | 'shrine'            // Blessing/prayer stop
  | 'hermit-hut'        // NPC encounter
  | 'monster-den'       // Optional combat/avoidance
  | 'treasure-cache'    // Hidden chest/stash
  | 'natural-wonder'    // Beautiful/unusual sight (XP for discovery)
  | 'danger-sign'       // Warning of upcoming threat
  | 'old-battlefield'   // Loot and lore, possible undead
```

Example:
```
As you travel through the Whispering Valley, 
Perception check... [18] SUCCESS!

You notice something off the trail — partially hidden 
by overgrown vines, the entrance to a small cave. 
Fresh scratch marks on the rock suggest something 
lives here. From inside, you hear a faint... whimpering?

[Investigate the cave]
[Mark it on your map and continue]
[Call out to whatever's inside]
[Send Pip to scout ahead quietly]
[Ignore it]
```

---

## Fast Travel

### Unlocked Locations

Once you've visited a location, you can fast travel back to it:

```
FAST TRAVEL — Select Destination

📍 Current Location: The Thornwood (Forest)

Available Destinations:
  🏘️ Millhaven (2 days travel)
  🏰 Ironhaven (4 days travel)
  ⛺ Forest Camp (6 hours travel)
  🛕 Temple of Light (1 day travel)

⚠️ Fast travel advances the in-game clock.
⚠️ Random encounters may still occur.
⚠️ Time-sensitive quests continue during travel.

[Select destination]
[Travel on foot instead (manual travel)]
```

### Fast Travel Rules

```
1. Time passes normally during fast travel (days/hours)
2. The world advances (NPCs move, quests progress, events happen)
3. Random encounters are rolled but only significant ones interrupt
4. Resource consumption is automatic (rations deducted)
5. The AI generates a brief travel summary:
   "The three-day journey to Ironhaven passes quietly. 
    On the second day, you cross paths with a merchant 
    caravan heading south. The weather turns cold. By the 
    time the fortress towers appear on the horizon, 
    winter has arrived in earnest."
```

### Special Fast Travel Methods

```
PORTAL / TELEPORTATION:
  - Instant, no time passes
  - Requires discovering portal pairs or having teleportation magic
  - Some portals are one-way or dangerous

MAGIC ITEM:
  - Stone of Recall: Return to last inn/safe haven (1/day)
  - Waypoint Stones: Set a point, return to it later (rare item)

MOUNT:
  - 2x travel speed but still takes time
  - Mount needs rest and food

SHIP:
  - Travel along coasts and rivers
  - Own ship = go anywhere on water
  - Passage on merchant ship = costs gold, fixed routes

FLYING:
  - Griffin, dragon, airship
  - Fastest, ignores terrain
  - Very late-game or genre-specific
```

---

## Day/Night Cycle UI

A subtle indicator in the game UI shows the current time:

```
┌──────────────────────────────────────────┐
│ 🌅 Dawn — Day 14 — Autumn — Overcast    │
│ Thornwood Forest │ Mild, Light Wind      │
└──────────────────────────────────────────┘
```

This bar sits at the top of the game screen. It updates as time passes:
- Icon changes: 🌅 Dawn → ☀️ Morning → 🌤️ Afternoon → 🌆 Dusk → 🌙 Night → 🌑 Midnight
- Color gradient shifts from warm to cool as day progresses
- Weather icon updates when conditions change

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Time system | Narrative advancement, not real-time | Time passes based on actions taken |
| Time of day | 8 periods: dawn through midnight | Each has gameplay effects |
| Calendar | In-world named months and days, 30-day months | Genre-adaptive names |
| Seasons | 4 seasons affecting weather, ecology, events | Temperature + encounter shifts |
| Weather | 16 weather types including magical | Affects travel, combat, mood |
| Weather generation | Seasonal probability tables + AI narrative | Feels natural and impactful |
| Travel system | Segment-based (4-hour blocks) with event checks | Not a loading screen |
| Travel pace | 4 paces: cautious to forced march | Strategic choice |
| Navigation | Skill checks in wilderness, auto on roads | Getting lost is gameplay |
| Terrain types | 10 terrain types with unique effects | World variety |
| Survival | Rations, water, shelter, foraging | Resource management during travel |
| Discovery system | 12 discovery types along travel routes | Rewards exploration |
| Fast travel | Available to visited locations, time still passes | Convenience without breaking immersion |
| Day/night UI | Top bar with icon, date, weather, location | Always visible, never intrusive |
| Moon phases | Track lunar cycle for magic/lycanthropy/events | Atmospheric depth |
| Starvation/dehydration | Escalating exhaustion over days | Survival stakes |
