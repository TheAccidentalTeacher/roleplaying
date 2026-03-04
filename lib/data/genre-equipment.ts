// ============================================================
// GENRE-ADAPTIVE EQUIPMENT SYSTEM
//
// Translates standard D&D fantasy equipment into genre-appropriate
// equivalents. The MECHANICAL function stays identical (same AC,
// damage dice, slot types) — only the FLAVOR changes.
//
// A Fighter's "Chain mail + Longsword + Shield" becomes:
//   Post-apocalypse → "Scrap-plate riot vest + Sharpened rebar blade + Welded car-door shield"
//   Cyberpunk       → "Ballistic-weave tactical vest + Monomolecular blade + Hardlight barrier projector"
//   Sci-Fi          → "Composite battle plate + Plasma saber + Kinetic barrier generator"
// ============================================================

import type { WorldType, Genre } from '@/lib/types/world';

// ── Genre Families ─────────────────────────────────────────────────
// Groups of world types/genres that share an equipment aesthetic

export type GenreFamily =
  | 'medieval-fantasy'   // Classic D&D — no translation
  | 'dark-fantasy'       // Grimy, worn, desperate medieval
  | 'post-apocalypse'    // Scavenged, repurposed, makeshift
  | 'steampunk'          // Brass, gears, steam, Victorian
  | 'cyberpunk'          // Neon, synthetic, corporate tech
  | 'sci-fi'             // Advanced clean tech, space
  | 'contemporary'       // Modern day, urban, recognizable
  | 'mythological'       // Bronze age, divine, ancient cultures
  | 'pirate'             // Age of sail, nautical
  | 'western'            // Frontier, revolvers, frontier justice
  | 'japanese'           // Feudal Japan, samurai traditions
  | 'cosmic-horror';     // Eldritch, unknowable, warded

// ── World Type → Genre Family ──────────────────────────────────────

const WORLD_TYPE_TO_FAMILY: Record<string, GenreFamily> = {
  // Fantasy
  'classic-high-fantasy': 'medieval-fantasy',
  'dark-fantasy': 'dark-fantasy',
  'dying-world': 'post-apocalypse',
  'young-world': 'medieval-fantasy',
  'fallen-empire': 'dark-fantasy',
  'conquered-world': 'post-apocalypse',
  'mythic-age': 'mythological',
  'hidden-magic': 'contemporary',
  'clockwork-fantasy': 'steampunk',
  'planar-world': 'medieval-fantasy',
  // Sci-Fi
  'deep-space-opera': 'sci-fi',
  'hard-scifi': 'sci-fi',
  'post-singularity': 'cyberpunk',
  'generation-ship': 'sci-fi',
  'colony-world': 'sci-fi',
  'post-contact': 'contemporary',
  'dyson-sphere': 'sci-fi',
  'time-war': 'sci-fi',
  'uploaded-world': 'cyberpunk',
  // Contemporary
  'modern-magic-revealed': 'contemporary',
  'zombie-apocalypse': 'post-apocalypse',
  'alien-occupation': 'post-apocalypse',
  'pandemic-world': 'post-apocalypse',
  'climate-collapse': 'post-apocalypse',
  'corporate-dystopia': 'cyberpunk',
  'superhuman-emergence': 'contemporary',
  'secret-government': 'contemporary',
  'interdimensional-leak': 'contemporary',
  // Historical/Mythological
  'norse-twilight': 'mythological',
  'greek-heroic-age': 'mythological',
  'egyptian-eternal': 'mythological',
  'arthurian-twilight': 'medieval-fantasy',
  'feudal-japan-supernatural': 'japanese',
  'age-of-sail-mythology': 'pirate',
  'mesopotamian-dawn': 'mythological',
  'celtic-spiritworld': 'mythological',
  'aztec-sun-keeping': 'mythological',
  // Hybrid/Strange
  'dying-universe': 'cosmic-horror',
  'dream-world': 'cosmic-horror',
  'recursive-reality': 'cyberpunk',
  'the-long-fall': 'post-apocalypse',
  'reversed-history': 'steampunk',
  'monsters-world': 'dark-fantasy',
  'the-afterlife-itself': 'cosmic-horror',
  'inside-a-god': 'cosmic-horror',
  'pocket-universe': 'medieval-fantasy',
  'the-void-between': 'cosmic-horror',
};

const GENRE_TO_FAMILY: Record<string, GenreFamily> = {
  'epic-fantasy': 'medieval-fantasy',
  'dark-fantasy': 'dark-fantasy',
  'horror': 'cosmic-horror',
  'sci-fi': 'sci-fi',
  'cyberpunk': 'cyberpunk',
  'post-apocalypse': 'post-apocalypse',
  'mystery': 'contemporary',
  'noir': 'contemporary',
  'pirate': 'pirate',
  'lovecraftian': 'cosmic-horror',
  'mythological': 'mythological',
  'steampunk': 'steampunk',
  'western': 'western',
  'superhero': 'contemporary',
  'romance': 'medieval-fantasy',
  'comedy': 'medieval-fantasy',
  'political-intrigue': 'medieval-fantasy',
  'survival': 'post-apocalypse',
  'military': 'contemporary',
};

// ── Resolve Genre Family ───────────────────────────────────────────

export function resolveGenreFamily(
  worldType?: string,
  primaryGenre?: string,
): GenreFamily {
  // Prefer worldType (more specific) over primaryGenre
  if (worldType && WORLD_TYPE_TO_FAMILY[worldType]) {
    return WORLD_TYPE_TO_FAMILY[worldType];
  }
  if (primaryGenre && GENRE_TO_FAMILY[primaryGenre]) {
    return GENRE_TO_FAMILY[primaryGenre];
  }
  return 'medieval-fantasy';
}

// ── Equipment Translation Tables ───────────────────────────────────
// Each genre family maps D&D item names to genre-appropriate equivalents.
// Items not in the map stay as-is.

const EQUIPMENT_TRANSLATIONS: Record<GenreFamily, Record<string, string>> = {
  // ────────────────────────────────────────────────────────────────
  'medieval-fantasy': {}, // No translation needed — this IS the base

  // ────────────────────────────────────────────────────────────────
  'dark-fantasy': {
    // Armor
    'Chain mail': 'Blackened chain mail',
    'Scale mail': 'Tarnished scale mail',
    'Leather armor': 'Cracked leather armor',
    // Shields
    'Shield': 'Battered iron shield',
    'Wooden shield': 'Splintered wooden shield',
    // Melee
    'Longsword': 'Notched longsword',
    'Shortsword': 'Pitted shortsword',
    'Rapier': 'Corroded rapier',
    'Greataxe': 'Bloodstained greataxe',
    'Mace': 'Rusted flanged mace',
    'Scimitar': 'Blackened scimitar',
    'Quarterstaff': 'Gnarled blackwood staff',
    'Handaxe': 'Chipped hand axe',
    'Dagger': 'Serrated dagger',
    // Ranged
    'Light crossbow': 'Worn light crossbow',
    'Longbow': 'Sinew-wrapped longbow',
    'Shortbow': 'Cracked shortbow',
    // Focus/tools
    'Holy symbol': 'Tarnished holy symbol',
    'Druidic focus': 'Withered druidic focus',
    'Arcane focus': 'Cracked arcane focus',
    'Lute': 'Battered lute',
    'Spellbook': 'Blood-spattered spellbook',
    // Packs
    'Explorer\'s Pack': 'Survivor\'s pack',
    'Dungeoneer\'s Pack': 'Tomb-raider\'s pack',
    'Priest\'s Pack': 'Mourner\'s pack',
    'Scholar\'s Pack': 'Heretic\'s pack',
    'Burglar\'s Pack': 'Grave-robber\'s pack',
    'Diplomat\'s Pack': 'Deceiver\'s pack',
  },

  // ────────────────────────────────────────────────────────────────
  'post-apocalypse': {
    // Armor
    'Chain mail': 'Scrap-plate riot vest',
    'Scale mail': 'Reinforced leather jacket with bolt plates',
    'Leather armor': 'Patched leather jacket',
    // Shields
    'Shield': 'Welded car-door shield',
    'Wooden shield': 'Plywood riot shield',
    // Melee — improvised / repurposed
    'Longsword': 'Sharpened rebar blade',
    'Shortsword': 'Short machete',
    'Rapier': 'Sharpened pipe sword',
    'Greataxe': 'Concrete-headed sledgehammer',
    'Mace': 'Lead-pipe bludgeon',
    'Scimitar': 'Curved machete',
    'Quarterstaff': 'Reinforced pipe staff',
    'Handaxe': 'Hatchet',
    'Dagger': 'Sharpened box cutter',
    // Ranged — scavenged
    'Light crossbow': 'Modified crossbow',
    'Longbow': 'Compound hunting bow',
    'Shortbow': 'Improvised slingshot',
    // Ammo
    'Bolts': 'Bolts',
    'Arrows': 'Arrows',
    'Javelin': 'Sharpened rebar javelin',
    'Dart': 'Throwing spike',
    // Focus/tools — repurposed
    'Holy symbol': 'Salvaged medical relic',
    'Druidic focus': 'Twisted root totem',
    'Arcane focus': 'Scavenged power cell',
    'Lute': 'Battered acoustic guitar',
    'Thieves\' tools': 'Lockpick set and pry bar',
    'Spellbook': 'Tattered grimoire of the old world',
    // Packs — scavenger kits
    'Explorer\'s Pack': 'Scavenger\'s pack',
    'Dungeoneer\'s Pack': 'Urban crawler kit',
    'Priest\'s Pack': 'Medic\'s satchel',
    'Scholar\'s Pack': 'Salvaged data cache',
    'Burglar\'s Pack': 'Break-in kit',
    'Diplomat\'s Pack': 'Trade goods bundle',
  },

  // ────────────────────────────────────────────────────────────────
  'steampunk': {
    // Armor
    'Chain mail': 'Brass-riveted plate coat',
    'Scale mail': 'Clockwork-reinforced jacket',
    'Leather armor': 'Leather aviator coat',
    // Shields
    'Shield': 'Clockwork buckler',
    'Wooden shield': 'Riveted wooden shield',
    // Melee
    'Longsword': 'Gear-edged saber',
    'Shortsword': 'Spring-loaded short blade',
    'Rapier': 'Clockwork rapier',
    'Greataxe': 'Steam-powered cleaver',
    'Mace': 'Brass gear-mace',
    'Scimitar': 'Curved brass blade',
    'Quarterstaff': 'Pneumatic staff',
    'Handaxe': 'Riveted hand axe',
    'Dagger': 'Retractable blade',
    // Ranged
    'Light crossbow': 'Pneumatic bolt launcher',
    'Longbow': 'Tension-spring longbow',
    'Shortbow': 'Compact spring bow',
    // Ammo
    'Javelin': 'Steam-propelled javelin',
    'Dart': 'Clockwork dart',
    // Focus/tools
    'Holy symbol': 'Blessed cog medallion',
    'Druidic focus': 'Living-wood gear staff',
    'Arcane focus': 'Aetheric resonator',
    'Lute': 'Mechanical hurdy-gurdy',
    'Thieves\' tools': 'Locksmith\'s toolkit',
    'Spellbook': 'Aetheric formula journal',
    // Packs
    'Explorer\'s Pack': 'Aeronaut\'s pack',
    'Dungeoneer\'s Pack': 'Underground explorer\'s kit',
    'Priest\'s Pack': 'Chaplain\'s pack',
    'Scholar\'s Pack': 'Inventor\'s pack',
    'Burglar\'s Pack': 'Cat burglar\'s kit',
    'Diplomat\'s Pack': 'Socialite\'s pack',
  },

  // ────────────────────────────────────────────────────────────────
  'cyberpunk': {
    // Armor
    'Chain mail': 'Ballistic-weave tactical vest',
    'Scale mail': 'Reinforced synth-leather jacket',
    'Leather armor': 'Synth-weave jacket',
    // Shields
    'Shield': 'Hardlight barrier projector',
    'Wooden shield': 'Portable energy screen',
    // Melee — high-tech
    'Longsword': 'Monomolecular blade',
    'Shortsword': 'Vibro-knife',
    'Rapier': 'Neural whip-blade',
    'Greataxe': 'Thermal cleaver',
    'Mace': 'Shock baton',
    'Scimitar': 'Curved monoblade',
    'Quarterstaff': 'Electrified bo staff',
    'Handaxe': 'Throwing hatchet',
    'Dagger': 'Ceramic switchblade',
    // Ranged — tech weapons
    'Light crossbow': 'Compact rail pistol',
    'Longbow': 'Gauss rifle',
    'Shortbow': 'Holdout flechette pistol',
    // Ammo
    'Bolts': 'Rail slugs',
    'Arrows': 'Flechette rounds',
    'Javelin': 'Smart grenade',
    'Dart': 'Micro-drone',
    // Focus/tools
    'Holy symbol': 'Digital prayer node',
    'Druidic focus': 'Bio-interface implant',
    'Arcane focus': 'Neural interface jack',
    'Lute': 'Holographic synthesizer',
    'Thieves\' tools': 'Hacking toolkit',
    'Spellbook': 'Encrypted code library',
    // Packs
    'Explorer\'s Pack': 'Urban ops kit',
    'Dungeoneer\'s Pack': 'Infiltration kit',
    'Priest\'s Pack': 'Street medic\'s kit',
    'Scholar\'s Pack': 'Data researcher\'s kit',
    'Burglar\'s Pack': 'B&E kit',
    'Diplomat\'s Pack': 'Corporate negotiation kit',
  },

  // ────────────────────────────────────────────────────────────────
  'sci-fi': {
    // Armor
    'Chain mail': 'Composite battle plate',
    'Scale mail': 'Tactical EVA suit',
    'Leather armor': 'Light flight suit',
    // Shields
    'Shield': 'Kinetic barrier generator',
    'Wooden shield': 'Portable deflector',
    // Melee
    'Longsword': 'Plasma saber',
    'Shortsword': 'Force blade',
    'Rapier': 'Energy rapier',
    'Greataxe': 'Gravity hammer',
    'Mace': 'Pulse mace',
    'Scimitar': 'Arc blade',
    'Quarterstaff': 'Force staff',
    'Handaxe': 'Magnetic hatchet',
    'Dagger': 'Molecular knife',
    // Ranged
    'Light crossbow': 'Pulse pistol',
    'Longbow': 'Laser rifle',
    'Shortbow': 'Holdout blaster',
    // Ammo
    'Bolts': 'Energy cells',
    'Arrows': 'Charge packs',
    'Javelin': 'Micro-missile',
    'Dart': 'Tracking dart',
    // Focus/tools
    'Holy symbol': 'Psi-focus beacon',
    'Druidic focus': 'Bio-scanner',
    'Arcane focus': 'Psi amplifier',
    'Lute': 'Harmonic resonator',
    'Thieves\' tools': 'Override toolkit',
    'Spellbook': 'Quantum computation pad',
    // Packs
    'Explorer\'s Pack': 'Field survey kit',
    'Dungeoneer\'s Pack': 'Facility exploration kit',
    'Priest\'s Pack': 'Medic\'s field kit',
    'Scholar\'s Pack': 'Research terminal kit',
    'Burglar\'s Pack': 'Covert ops kit',
    'Diplomat\'s Pack': 'First contact kit',
  },

  // ────────────────────────────────────────────────────────────────
  'contemporary': {
    // Armor
    'Chain mail': 'Tactical body armor',
    'Scale mail': 'Reinforced kevlar vest',
    'Leather armor': 'Leather jacket with padding',
    // Shields
    'Shield': 'Riot shield',
    'Wooden shield': 'Ballistic shield',
    // Melee
    'Longsword': 'Combat machete',
    'Shortsword': 'Tactical knife',
    'Rapier': 'Fencing saber',
    'Greataxe': 'Fire axe',
    'Mace': 'Telescoping baton',
    'Scimitar': 'Kukri',
    'Quarterstaff': 'Collapsible bo staff',
    'Handaxe': 'Throwing hatchet',
    'Dagger': 'Combat knife',
    // Ranged
    'Light crossbow': 'Compact crossbow',
    'Longbow': 'Compound bow',
    'Shortbow': 'Recurve bow',
    // Ammo
    'Javelin': 'Throwing knife',
    'Dart': 'Throwing dart',
    // Focus/tools
    'Holy symbol': 'Blessed relic',
    'Druidic focus': 'Natural focus crystal',
    'Arcane focus': 'Enchanted smartphone',
    'Lute': 'Acoustic guitar',
    'Thieves\' tools': 'Lockpick set',
    'Spellbook': 'Encrypted grimoire tablet',
    // Packs
    'Explorer\'s Pack': 'Hiking backpack',
    'Dungeoneer\'s Pack': 'Urban explorer\'s kit',
    'Priest\'s Pack': 'First aid kit',
    'Scholar\'s Pack': 'Laptop bag',
    'Burglar\'s Pack': 'Break-in kit',
    'Diplomat\'s Pack': 'Briefcase kit',
  },

  // ────────────────────────────────────────────────────────────────
  'mythological': {
    // Armor — bronze age
    'Chain mail': 'Bronze-scale cuirass',
    'Scale mail': 'Studded leather breastplate',
    'Leather armor': 'Hardened leather armor',
    // Shields — ancient
    'Shield': 'Round bronze aspis',
    'Wooden shield': 'Hide-covered round shield',
    // Melee — ancient weapons
    'Longsword': 'Bronze kopis',
    'Shortsword': 'Bronze gladius',
    'Rapier': 'Bronze leaf blade',
    'Greataxe': 'Double-headed labrys',
    'Mace': 'Bronze war club',
    'Scimitar': 'Curved khopesh',
    'Quarterstaff': 'Ironwood staff',
    'Handaxe': 'Stone hand axe',
    'Dagger': 'Obsidian dagger',
    // Ranged
    'Light crossbow': 'Light hunting bow',
    'Longbow': 'War bow',
    'Shortbow': 'Short hunting bow',
    // Ammo/thrown
    'Javelin': 'Bronze-tipped javelin',
    'Dart': 'Throwing stone',
    // Focus/tools
    'Holy symbol': 'Divine idol',
    'Druidic focus': 'Sacred branch',
    'Arcane focus': 'Oracle\'s crystal',
    'Lute': 'Seven-string lyre',
    'Thieves\' tools': 'Lockpick set',
    'Spellbook': 'Scroll case of inscriptions',
    // Packs
    'Explorer\'s Pack': 'Traveler\'s satchel',
    'Dungeoneer\'s Pack': 'Tomb-explorer\'s kit',
    'Priest\'s Pack': 'Temple offering kit',
    'Scholar\'s Pack': 'Philosopher\'s kit',
    'Burglar\'s Pack': 'Tomb-raider\'s kit',
    'Diplomat\'s Pack': 'Ambassador\'s kit',
  },

  // ────────────────────────────────────────────────────────────────
  'pirate': {
    // Armor — lighter, nautical
    'Chain mail': 'Reinforced leather coat',
    'Scale mail': 'Studded leather baldric',
    'Leather armor': 'Sailor\'s leather vest',
    // Shields
    'Shield': 'Boarding shield',
    'Wooden shield': 'Ship-timber buckler',
    // Melee — nautical
    'Longsword': 'Cutlass',
    'Shortsword': 'Short cutlass',
    'Rapier': 'Dueling rapier',
    'Greataxe': 'Boarding axe',
    'Mace': 'Belaying pin club',
    'Scimitar': 'Curved cutlass',
    'Quarterstaff': 'Boat hook',
    'Handaxe': 'Throwing hatchet',
    'Dagger': 'Sailor\'s dirk',
    // Ranged
    'Light crossbow': 'Flintlock pistol',
    'Longbow': 'Long musket',
    'Shortbow': 'Hand crossbow',
    // Ammo
    'Bolts': 'Shot and powder',
    'Arrows': 'Shot and powder',
    'Javelin': 'Throwing knife',
    'Dart': 'Throwing spike',
    // Focus/tools
    'Holy symbol': 'Ship\'s compass charm',
    'Druidic focus': 'Coral talisman',
    'Arcane focus': 'Enchanted compass',
    'Lute': 'Concertina',
    'Thieves\' tools': 'Lockpick and grappling hook',
    'Spellbook': 'Waterproof scroll case',
    // Packs
    'Explorer\'s Pack': 'Sailor\'s pack',
    'Dungeoneer\'s Pack': 'Shore party kit',
    'Priest\'s Pack': 'Ship surgeon\'s kit',
    'Scholar\'s Pack': 'Navigator\'s kit',
    'Burglar\'s Pack': 'Smuggler\'s kit',
    'Diplomat\'s Pack': 'Captain\'s kit',
  },

  // ────────────────────────────────────────────────────────────────
  'western': {
    // Armor
    'Chain mail': 'Steel-plated leather duster',
    'Scale mail': 'Reinforced leather vest',
    'Leather armor': 'Leather duster coat',
    // Shields
    'Shield': 'Heavy leather buckler',
    'Wooden shield': 'Wooden plank shield',
    // Melee
    'Longsword': 'Cavalry saber',
    'Shortsword': 'Bowie knife',
    'Rapier': 'Dueling sword',
    'Greataxe': 'Heavy lumber axe',
    'Mace': 'Blacksmith\'s hammer',
    'Scimitar': 'Curved saber',
    'Quarterstaff': 'Walking stick',
    'Handaxe': 'Tomahawk',
    'Dagger': 'Folding knife',
    // Ranged
    'Light crossbow': 'Lever-action rifle',
    'Longbow': 'Long-range hunting rifle',
    'Shortbow': 'Six-shooter revolver',
    // Ammo
    'Bolts': 'Rifle cartridges',
    'Arrows': 'Rifle cartridges',
    'Javelin': 'Throwing knife',
    'Dart': 'Throwing spike',
    // Focus/tools
    'Holy symbol': 'Preacher\'s cross',
    'Druidic focus': 'Spirit feather bundle',
    'Arcane focus': 'Mystic gemstone',
    'Lute': 'Harmonica',
    'Thieves\' tools': 'Lockpick and skeleton keys',
    'Spellbook': 'Leather-bound journal of hexes',
    // Packs
    'Explorer\'s Pack': 'Trailhand\'s pack',
    'Dungeoneer\'s Pack': 'Miner\'s kit',
    'Priest\'s Pack': 'Preacher\'s kit',
    'Scholar\'s Pack': 'Schoolteacher\'s satchel',
    'Burglar\'s Pack': 'Outlaw\'s kit',
    'Diplomat\'s Pack': 'Traveler\'s trunk',
  },

  // ────────────────────────────────────────────────────────────────
  'japanese': {
    // Armor
    'Chain mail': 'Do-maru armor',
    'Scale mail': 'Kusari katabira (chain jacket)',
    'Leather armor': 'Leather suneate and kote',
    // Shields — Japan didn't use shields traditionally
    'Shield': 'Iron war fan (tessen)',
    'Wooden shield': 'Wooden ōte-dama (hand shield)',
    // Melee
    'Longsword': 'Katana',
    'Shortsword': 'Wakizashi',
    'Rapier': 'Kodachi (short blade)',
    'Greataxe': 'Ōdachi (great sword)',
    'Mace': 'Kanabō (iron club)',
    'Scimitar': 'Naginata',
    'Quarterstaff': 'Bō staff',
    'Handaxe': 'Ono (hand axe)',
    'Dagger': 'Tantō',
    // Ranged
    'Light crossbow': 'Yumi (shortbow)',
    'Longbow': 'Daikyū (great bow)',
    'Shortbow': 'Hankyu (half bow)',
    // Ammo/thrown
    'Bolts': 'Ya (arrows)',
    'Arrows': 'Ya (arrows)',
    'Javelin': 'Uchi-ne (throwing arrow)',
    'Dart': 'Shuriken',
    // Focus/tools
    'Holy symbol': 'Ofuda (sacred talisman)',
    'Druidic focus': 'Shinboku branch (sacred tree)',
    'Arcane focus': 'Magatama (spirit jewel)',
    'Lute': 'Shamisen',
    'Thieves\' tools': 'Shinobi tools',
    'Spellbook': 'Scroll case of sutras',
    // Packs
    'Explorer\'s Pack': 'Traveler\'s furoshiki pack',
    'Dungeoneer\'s Pack': 'Dungeon explorer\'s pack',
    'Priest\'s Pack': 'Monk\'s traveling kit',
    'Scholar\'s Pack': 'Calligrapher\'s kit',
    'Burglar\'s Pack': 'Shinobi kit',
    'Diplomat\'s Pack': 'Envoy\'s kit',
  },

  // ────────────────────────────────────────────────────────────────
  'cosmic-horror': {
    // Armor
    'Chain mail': 'Sigil-inscribed chain mail',
    'Scale mail': 'Warded scale mail',
    'Leather armor': 'Rune-stitched leather armor',
    // Shields
    'Shield': 'Ward-etched buckler',
    'Wooden shield': 'Elder-sign wooden shield',
    // Melee
    'Longsword': 'Void-touched longsword',
    'Shortsword': 'Whisper-edged short blade',
    'Rapier': 'Phase-shifting rapier',
    'Greataxe': 'Reality-cleaving great axe',
    'Mace': 'Entropy mace',
    'Scimitar': 'Dream-forged scimitar',
    'Quarterstaff': 'Staff of sealed knowledge',
    'Handaxe': 'Aberrant hand axe',
    'Dagger': 'Ritual dagger',
    // Ranged
    'Light crossbow': 'Hex-bolt crossbow',
    'Longbow': 'Sinew-of-the-deep longbow',
    'Shortbow': 'Whispering shortbow',
    // Focus/tools
    'Holy symbol': 'Elder ward talisman',
    'Druidic focus': 'Tendril-wrapped root focus',
    'Arcane focus': 'Fragment of the unknown',
    'Lute': 'Dissonance lyre',
    'Thieves\' tools': 'Reality-slip tools',
    'Spellbook': 'Tome of forbidden formulae',
    // Packs
    'Explorer\'s Pack': 'Investigator\'s pack',
    'Dungeoneer\'s Pack': 'Delver\'s pack',
    'Priest\'s Pack': 'Warden\'s pack',
    'Scholar\'s Pack': 'Occultist\'s pack',
    'Burglar\'s Pack': 'Infiltrator\'s pack',
    'Diplomat\'s Pack': 'Envoy\'s pack',
  },
};

// ── Genre-Specific Common Items (for item generator fallbacks) ─────

export interface GenreCommonItems {
  weapons: string[];
  armor: string[];
  consumables: string[];
  junk: string[];
}

const GENRE_COMMON_ITEMS: Record<GenreFamily, GenreCommonItems> = {
  'medieval-fantasy': {
    weapons: ['Iron Shortsword', 'Wooden Staff', 'Hunting Bow', 'Simple Dagger', 'Light Crossbow', 'Quarterstaff', 'Handaxe', 'Javelin'],
    armor: ['Leather Tunic', 'Padded Vest', 'Chainmail Shirt', 'Wooden Shield', 'Leather Cap', 'Studded Bracers', 'Travel Boots', 'Iron Buckler'],
    consumables: ['Healing Potion', 'Ration Pack', 'Torch', 'Rope (50ft)', 'Bandages', 'Antidote', 'Lantern Oil', 'Waterskin', 'Chalk', 'Flint & Steel'],
    junk: ['Rusty Nail', 'Broken Tooth', 'Moth-eaten Cloth', 'Cracked Vial', 'Bent Spoon', 'Faded Map Fragment', 'Rat Skull', 'Tarnished Button', 'Crumbling Brick', 'Dried Herbs', 'Empty Flask', 'Worn Leather Strap'],
  },
  'dark-fantasy': {
    weapons: ['Notched Iron Blade', 'Charred Staff', 'Sinew-Wrapped Bow', 'Rusted Dagger', 'Corroded Crossbow', 'Blackened Mace', 'Chipped Axe', 'Bone Javelin'],
    armor: ['Stitched Leather Jerkin', 'Blood-Stained Gambeson', 'Salvaged Chainmail', 'Dented Iron Shield', 'Cracked Helm', 'Torn Gauntlets', 'Muddy Boots', 'Battered Buckler'],
    consumables: ['Tainted Healing Draught', 'Stale Rations', 'Guttering Torch', 'Frayed Rope', 'Bloodied Bandages', 'Bitter Antidote', 'Rancid Oil', 'Cracked Waterskin', 'Chalk Dust', 'Damp Tinder'],
    junk: ['Broken Bone', 'Rotten Cloth', 'Cracked Skull Fragment', 'Congealed Blood Vial', 'Bent Nail', 'Torn Wanted Poster', 'Dead Rat', 'Rusted Coin', 'Charred Book Page', 'Matted Fur Scrap', 'Shattered Mirror Shard', 'Cursed Button'],
  },
  'post-apocalypse': {
    weapons: ['Pipe Wrench', 'Sharpened Rebar', 'Makeshift Crossbow', 'Broken Bottle Shiv', 'Nail Bat', 'Fire Axe', 'Duct-Tape Spear', 'Road Sign Cleaver'],
    armor: ['Duct-Tape Vest', 'Tire-Rubber Padding', 'Scrap Metal Plates', 'Trash Can Lid Shield', 'Hard Hat', 'Fingerless Work Gloves', 'Steel-Toed Boots', 'License Plate Buckler'],
    consumables: ['Salvaged Med-Pack', 'Canned Food', 'Road Flare', 'Zip Ties (bundle)', 'Torn Bandages', 'Water Purification Tab', 'Lighter Fluid', 'Plastic Jug of Water', 'Marker', 'Waterproof Matches'],
    junk: ['Bent Spoon', 'Cracked Phone Screen', 'Dead Battery', 'Tangled Wire', 'Faded Magazine', 'Rusty Can', 'Melted Plastic', 'Old USB Drive', 'Shattered Glass', 'Stripped Screw', 'Empty Fuel Can', 'Sun-Bleached Bone'],
  },
  'steampunk': {
    weapons: ['Brass Shortsword', 'Steam-Core Staff', 'Spring-Loaded Bow', 'Clockwork Dagger', 'Pneumatic Crossbow', 'Gear-Headed Mace', 'Riveted Hatchet', 'Piston Javelin'],
    armor: ['Leather Flight Jacket', 'Padded Airship Vest', 'Brass-Plated Shirt', 'Gear-Rimmed Buckler', 'Goggles and Helmet', 'Articulated Gauntlets', 'Insulated Boots', 'Riveted Shield'],
    consumables: ['Aether Tonic', 'Tinned Provisions', 'Gas Lamp', 'Steel Cable (50ft)', 'Gauze Wraps', 'Anti-Toxin Capsule', 'Lamp Oil', 'Canteen', 'Grease Stick', 'Spark Lighter'],
    junk: ['Bent Cog', 'Stripped Gear', 'Cracked Gauge', 'Burnt Fuse Wire', 'Loose Rivet', 'Faded Blueprint Scrap', 'Broken Clockwork Mouse', 'Tarnished Brass Button', 'Melted Solder', 'Leaky Valve', 'Spent Steam Cartridge', 'Worn Belt Loop'],
  },
  'cyberpunk': {
    weapons: ['Ceramic Blade', 'Electro-Staff', 'Micro-Flechette Pistol', 'Mono-Wire Garrote', 'Rail Pistol', 'Shock Knuckles', 'Nano-Edge Hatchet', 'Smart Shuriken'],
    armor: ['Armored Hoodie', 'Synth-Weave Vest', 'Carbon-Fiber Plating', 'Hardlight Wrist Guard', 'AR Visor Helmet', 'Haptic Feedback Gloves', 'Mag-Grip Boots', 'Wrist-Mounted Deflector'],
    consumables: ['Nano-Med Injector', 'Nutri-Paste Tube', 'Glow Stick', 'Fiber-Optic Line (50m)', 'Dermal Sealant', 'Anti-Virus Shot', 'Battery Pack', 'Hydration Pouch', 'Holo-Chalk', 'Arc Lighter'],
    junk: ['Cracked Data Chip', 'Dead Holo-Display', 'Burnt Neural Wire', 'Empty Stim Case', 'Corrupted MicroSD', 'Faded Neon Tube', 'Shorted Circuit Board', 'Broken AR Lens', 'Spent Battery Core', 'Frayed USB-C Cable', 'Old Data Stick', 'Cracked Biometric Reader'],
  },
  'sci-fi': {
    weapons: ['Plasma Pistol', 'Force Staff', 'Laser Carbine', 'Molecular Knife', 'Pulse Rifle', 'Gravity Mace', 'Magnetic Hatchet', 'Guided Micro-Missile'],
    armor: ['Light EVA Suit', 'Padded Ship Suit', 'Composite Plating', 'Deflector Module', 'Sealed Helmet', 'Adaptive Gloves', 'Mag-Lock Boots', 'Kinetic Shield Module'],
    consumables: ['Medi-Gel Pack', 'Nutrient Bar', 'Plasma Flare', 'Tether Line (50m)', 'Bio-Seal Strips', 'Detox Capsule', 'Power Cell', 'Hydration Pack', 'Luminous Marker', 'Fusion Lighter'],
    junk: ['Burnt Relay', 'Cracked Viewport', 'Dead Power Cell', 'Tangled Dataline', 'Faded Star Chart', 'Drained Capacitor', 'Warped Hull Fragment', 'Empty Oxygen Canister', 'Broken Scanner', 'Stripped Wire Bundle', 'Spent Cartridge', 'Asteroid Pebble'],
  },
  'contemporary': {
    weapons: ['Pocket Knife', 'Walking Stick', 'Compound Bow', 'Box Cutter', 'Taser', 'Telescoping Baton', 'Small Hatchet', 'Throwing Knife'],
    armor: ['Leather Jacket', 'Padded Vest', 'Kevlar Vest', 'Riot Shield', 'Hard Hat', 'Work Gloves', 'Steel-Toed Boots', 'Arm Guard'],
    consumables: ['First Aid Kit', 'Energy Bar', 'Flashlight', 'Paracord (50ft)', 'Gauze and Tape', 'Antacid Tablets', 'Lighter Fluid', 'Water Bottle', 'Chalk', 'Matches'],
    junk: ['Dead Pen', 'Cracked Phone Case', 'Used Tissue', 'Tangled Earbuds', 'Faded Receipt', 'Empty Gum Wrapper', 'Dead Battery', 'Broken Key', 'Old Newspaper', 'Bent Paperclip', 'Empty Wallet', 'Lost Button'],
  },
  'mythological': {
    weapons: ['Bronze Short Blade', 'Ironwood Staff', 'Bone Bow', 'Obsidian Knife', 'Sling', 'Stone Mace', 'Flint Axe', 'Bronze-Tipped Javelin'],
    armor: ['Hardened Leather Cuirass', 'Padded Linen Vest', 'Bronze Scale Shirt', 'Ox-Hide Shield', 'Bronze Helm', 'Leather Bracers', 'Woven Sandals', 'Bronze Buckler'],
    consumables: ['Herbal Poultice', 'Dried Figs and Bread', 'Clay Oil Lamp', 'Hemp Rope (50ft)', 'Linen Bandages', 'Medicinal Herbs', 'Olive Oil', 'Clay Water Jug', 'Chalk', 'Flint Striker'],
    junk: ['Broken Pottery Shard', 'Cracked Bone', 'Dried Flower', 'Faded Clay Tablet', 'Bent Bronze Ring', 'Torn Papyrus', 'Animal Tooth', 'Worn Stone Bead', 'Crumbling Mud Brick', 'Frayed Linen Scrap', 'Empty Amphora', 'Chipped Obsidian'],
  },
  'pirate': {
    weapons: ['Rusty Cutlass', 'Boat Hook', 'Boarding Crossbow', 'Sailor\'s Dirk', 'Flintlock Pistol', 'Belaying Pin', 'Throwing Hatchet', 'Boarding Pike'],
    armor: ['Leather Baldric', 'Padded Sea Coat', 'Studded Leather Vest', 'Ship-Timber Buckler', 'Tricorn Hat', 'Leather Gloves', 'Sea Boots', 'Rum-Barrel Lid Shield'],
    consumables: ['Rum Flask', 'Ship Biscuit', 'Lantern', 'Rope (50ft)', 'Bandages', 'Lime Ration (anti-scurvy)', 'Lamp Oil', 'Water Canteen', 'Chalk', 'Tinderbox'],
    junk: ['Frayed Rope End', 'Barnacle-Covered Coin', 'Broken Compass', 'Torn Sea Chart', 'Waterlogged Page', 'Empty Rum Bottle', 'Bent Hook', 'Dried Seaweed', 'Shark Tooth', 'Rotten Plank', 'Tarnished Gold Tooth', 'Salt-Encrusted Button'],
  },
  'western': {
    weapons: ['Bowie Knife', 'Walking Cane', 'Hunting Rifle', 'Pocket Knife', 'Six-Shooter Revolver', 'Blacksmith\'s Hammer', 'Tomahawk', 'Throwing Knife'],
    armor: ['Leather Vest', 'Padded Waistcoat', 'Reinforced Duster', 'Wooden Plank Shield', 'Wide-Brim Hat', 'Riding Gloves', 'Cowboy Boots', 'Metal Arm Guard'],
    consumables: ['Medicinal Whiskey', 'Beef Jerky', 'Oil Lantern', 'Lasso (50ft)', 'Bandages', 'Snake Bite Kit', 'Lamp Oil', 'Canteen', 'Chalk', 'Matches'],
    junk: ['Spent Bullet Casing', 'Broken Horseshoe', 'Tumbleweed', 'Faded Wanted Poster', 'Bent Nail', 'Torn Playing Card', 'Dried Cactus Spine', 'Rusty Spur', 'Cracked Saddle Buckle', 'Sun-Bleached Bone', 'Empty Tobacco Tin', 'Worn Leather Strap'],
  },
  'japanese': {
    weapons: ['Wakizashi', 'Bō Staff', 'Yumi (Shortbow)', 'Tantō', 'Hand Crossbow', 'Kanabō', 'Ono (Axe)', 'Shuriken'],
    armor: ['Leather Dō-maru', 'Padded Kimono', 'Kusari Chain Shirt', 'Iron Tessen (War Fan)', 'Jingasa (War Hat)', 'Kote (Armored Sleeves)', 'Waraji (Straw Sandals)', 'Small Tate Shield'],
    consumables: ['Medicinal Tea', 'Rice Ball and Dried Fish', 'Paper Lantern', 'Silk Rope (50ft)', 'Cotton Bandages', 'Herbal Antidote', 'Lamp Oil', 'Bamboo Water Container', 'Ink Stick', 'Flint and Steel'],
    junk: ['Broken Chopstick', 'Cracked Ceramic Shard', 'Spent Incense Stick', 'Torn Rice Paper', 'Bent Hairpin', 'Faded Calligraphy Scroll', 'Dead Cherry Blossom', 'Worn Wooden Sandal', 'Crumbling Temple Tile', 'Frayed Silk Thread', 'Empty Sake Cup', 'Chipped Stone Lantern Piece'],
  },
  'cosmic-horror': {
    weapons: ['Ritual Blade', 'Staff of Binding', 'Eldritch-String Bow', 'Void-Touched Dagger', 'Sigil Crossbow', 'Entropy Mace', 'Warded Axe', 'Star-Shard Javelin'],
    armor: ['Rune-Stitched Tunic', 'Warded Leather Vest', 'Sigil-Etched Mail', 'Elder-Sign Shield', 'Thought-Shielding Hood', 'Seal-Wrapped Gauntlets', 'Grounding Boots', 'Aberrant Buckler'],
    consumables: ['Sanity Draught', 'Preserved Rations', 'Amber Glow Torch', 'Warded Rope (50ft)', 'Rune-Inked Bandages', 'Mind-Clearing Tonic', 'Silver Lamp Oil', 'Sealed Waterskin', 'Elder Chalk', 'Star-Steel Flint'],
    junk: ['Cracked Elder Sign', 'Melted Candle Stub', 'Incomprehensible Note', 'Dried Tentacle Fragment', 'Bent Silver Nail', 'Dream-Stained Parchment', 'Fossilized Eye', 'Tarnished Strange Coin', 'Whispering Stone', 'Stained Glass Shard', 'Empty Inkwell', 'Unknowable Symbol Token'],
  },
};

// ── Translation Functions ──────────────────────────────────────────

/**
 * Translate a single equipment item name to its genre equivalent.
 * Handles quantity suffixes like "×2", "×4", "×20".
 */
export function translateItem(itemName: string, genreFamily: GenreFamily): string {
  if (genreFamily === 'medieval-fantasy') return itemName;

  const translations = EQUIPMENT_TRANSLATIONS[genreFamily];
  if (!translations) return itemName;

  // Check for quantity suffix: "Handaxe ×2", "Bolts ×20", etc.
  const quantityMatch = itemName.match(/^(.+?)(\s*×\s*\d+)$/);
  if (quantityMatch) {
    const baseName = quantityMatch[1].trim();
    const quantity = quantityMatch[2];
    const translated = translations[baseName] ?? baseName;
    return `${translated}${quantity}`;
  }

  return translations[itemName] ?? itemName;
}

/**
 * Translate an entire equipment list (e.g. starting equipment).
 */
export function translateEquipmentList(
  items: string[],
  genreFamily: GenreFamily,
): string[] {
  if (genreFamily === 'medieval-fantasy') return items;
  return items.map(item => translateItem(item, genreFamily));
}

/**
 * Get genre-appropriate common items for the item generator.
 */
export function getGenreCommonItems(genreFamily: GenreFamily): GenreCommonItems {
  return GENRE_COMMON_ITEMS[genreFamily] ?? GENRE_COMMON_ITEMS['medieval-fantasy'];
}

/**
 * The genre family label (human-readable) for display.
 */
export function getGenreFamilyLabel(genreFamily: GenreFamily): string {
  const labels: Record<GenreFamily, string> = {
    'medieval-fantasy': 'Medieval Fantasy',
    'dark-fantasy': 'Dark Fantasy',
    'post-apocalypse': 'Post-Apocalypse',
    'steampunk': 'Steampunk',
    'cyberpunk': 'Cyberpunk',
    'sci-fi': 'Science Fiction',
    'contemporary': 'Contemporary',
    'mythological': 'Mythological',
    'pirate': 'Pirate / Age of Sail',
    'western': 'Western / Frontier',
    'japanese': 'Feudal Japan',
    'cosmic-horror': 'Cosmic Horror',
  };
  return labels[genreFamily] ?? 'Fantasy';
}
