// ============================================================
// ARCHETYPES — Character playstyle definitions
// Selected at character creation. Seeds the starting kit,
// backstory fragments, and weapon affinity bonuses.
// Reference: BRAINSTORM.md — Archetypes section
// ============================================================

import type { ArchetypeTag, WeaponCategory, WeaponSubtype } from '@/lib/data/weapons/types';
import type { GenreFamily } from '@/lib/data/genre-equipment';

// ── Archetype interface ───────────────────────────────────

export interface ArchetypeStartingKit {
  primaryWeaponIds: string[];     // specific catalog IDs (player picks one)
  secondaryWeaponIds?: string[];  // optional secondary weapon choices
  armorHint: string;              // description of starting armor
  consumables: string[];          // names of consumable items
  gold: number;
}

export interface ArchetypeAbility {
  id: string;
  name: string;
  description: string;
  unlockLevel?: number;  // if undefined, starts with it
}

export interface Archetype {
  id: ArchetypeTag;
  name: string;
  title: string;         // short poetic subtitle
  description: string;  // 2-3 sentences
  flavorText: string;

  // Weapon preferences (for loot generation)
  preferredCategories: WeaponCategory[];
  preferredSubtypes?: WeaponSubtype[];

  // Genre affinity (determines which genre items favor this archetype)
  genreAffinities: GenreFamily[];

  // Starting package
  startingKit: ArchetypeStartingKit;

  // Special rules
  archetypeAbilities: ArchetypeAbility[];

  // Stat recommendations
  primaryStats: ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[];
  keystoneStat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

  // Backstory seeds (AI uses this to generate origin fragments)
  backstorySeeds: string[];

  // Visual identity
  imagePromptHint: string;
}

// ══════════════════════════════════════════════════════════
// ARCHETYPE DEFINITIONS
// ══════════════════════════════════════════════════════════

export const ARCHETYPES: Archetype[] = [

  // ─────────────────────────────────────────────────────
  // STEALTH ARCHER
  // The Skyrim fantasy: unseen, from range, never involved
  // ─────────────────────────────────────────────────────
  {
    id: 'stealth-archer',
    name: 'Woodland Shadow',
    title: 'The Arrow They Never Saw',
    description: 'A hunter of the shadow and the distance. You prefer opponents who never know you were there. The bow is your primary voice; the knife is your backup plan. Enemies discover you through their last sensation.',
    flavorText: '"The ideal engagement is one where the enemy never fires back. Everything else is improvisation."',

    preferredCategories: ['bow', 'knife'],
    preferredSubtypes: ['longbow', 'recurve-bow', 'shortbow', 'dagger', 'stiletto'],
    genreAffinities: ['medieval-fantasy', 'dark-fantasy', 'japanese'],

    startingKit: {
      primaryWeaponIds: [
        'bow-recurve-hunters',    // Recurve Hunter's Bow — mobile and accurate
        'bow-shortbow-shadow',    // Shadow Hunter Shortbow — stealth specialist
        'bow-elven-longbow',      // Elven Longbow — if the setting offers it
      ],
      secondaryWeaponIds: [
        'knife-hunting-blade',    // Hunting Knife
        'knife-woodland-long',    // Legolas-adjacent
        'knife-stiletto-bone',    // Bone Stiletto (primitive settings)
      ],
      armorHint: 'Light leather armor or padded cloth — nothing that impedes movement. Dark colors preferred.',
      consumables: [
        '20x Standard Arrows',
        '5x Broadhead Arrows',
        'Rope (50ft)',
        'Camouflage Paint',
        'Caltrops (10)',
        'Healing Potion',
      ],
      gold: 45,
    },

    archetypeAbilities: [
      {
        id: 'stealth-archer-sneak-shot',
        name: 'Sneak Shot',
        description: 'When attacking from stealth with a ranged weapon, add +2d6 to damage. The attack does not automatically break stealth if made from concealment.',
      },
      {
        id: 'stealth-archer-ghost-step',
        name: 'Ghost Step',
        description: 'Moving silently is your default. Stealth checks made while moving at half speed are never at disadvantage.',
      },
      {
        id: 'stealth-archer-shadow-melt',
        name: 'Shadow Melt',
        description: 'Once per encounter, after firing a ranged attack, you may use a bonus action to immediately re-enter hiding if there is sufficient cover or concealment nearby.',
        unlockLevel: 5,
      },
      {
        id: 'stealth-archer-precise-eye',
        name: 'Precise Eye',
        description: 'Ignore half cover and three-quarters cover with ranged weapon attacks.',
        unlockLevel: 3,
      },
    ],

    primaryStats: ['dex', 'wis'],
    keystoneStat: 'dex',

    backstorySeeds: [
      'Trained by a ranger guild that no longer exists',
      'Self-taught in the forest after the village fell',
      'Former royal guard scout reassigned to wilderness',
      'Heir to a tradition of hunters stretching back generations',
      'Learned under an elven archer who accepted no other student',
    ],

    imagePromptHint: 'stealth archer in dark forest, longbow drawn, shadow and foliage concealment, light leather armor, one with the trees, Skyrim aesthetic, no visible face',
  },

  // ─────────────────────────────────────────────────────
  // BEASTMASTER
  // Dar-style: bond with animals, mid-range bow, short blade
  // ─────────────────────────────────────────────────────
  {
    id: 'beastmaster',
    name: 'Beastmaster',
    title: 'Two Hearts, One Hunt',
    description: 'You do not fight alone. Your animal companion is your partner, not your pet. The bow keeps enemies at range while your companion engages. You are the mind of the pair; they are the instinct.',
    flavorText: '"The eagle sees what I cannot. The wolf reaches what I will not send an arrow into. We are more complete together."',

    preferredCategories: ['bow', 'knife'],
    preferredSubtypes: ['shortbow', 'recurve-bow', 'composite-bow', 'hunting-knife', 'dagger'],
    genreAffinities: ['mythological', 'medieval-fantasy', 'dark-fantasy'],

    startingKit: {
      primaryWeaponIds: [
        'bow-recurve-composite',     // Composite Recurve
        'bow-shortbow-basic',        // Basic Shortbow — fast, mobile
      ],
      secondaryWeaponIds: [
        'knife-legolas-hunting',     // Woodland Long-Knife (Dar variant)
        'exotic-throwing-star-beastmaster',  // Dar's Throwing Star
        'knife-hunting-blade',       // Standard hunting knife
      ],
      armorHint: 'Light leather, practical and worn. Usually showing animal-claw marks, dirt, and repairs. Something that moves.',
      consumables: [
        '20x Standard Arrows',
        'Animal Treat (3) — Companion loyalty items',
        'Rope (30ft)',
        'Healing Potion',
        'Antitoxin',
        'Survival Rations (3 days)',
      ],
      gold: 25,
    },

    archetypeAbilities: [
      {
        id: 'beastmaster-companion-bond',
        name: 'Companion Bond',
        description: 'You have bonded with an animal companion. The companion acts on your initiative and follows mental commands within 60ft. The companion shares your proficiency bonus. Choose: wolf, eagle, panther, bear cub, or serpent.',
      },
      {
        id: 'beastmaster-pack-tactics',
        name: 'Pack Tactics',
        description: 'When you and your companion both target the same creature in the same round, both of you have advantage on that round\'s attack rolls.',
      },
      {
        id: 'beastmaster-beast-call',
        name: 'Beast Call',
        description: 'Once per day, call your companion from any distance up to 1 mile. They arrive within 1d4 rounds.',
        unlockLevel: 3,
      },
      {
        id: 'beastmaster-shared-sensing',
        name: 'Shared Sensing',
        description: 'You can perceive through your companion\'s senses for up to 1 minute. Your own senses are dulled while doing this.',
        unlockLevel: 5,
      },
    ],

    primaryStats: ['dex', 'wis'],
    keystoneStat: 'wis',

    backstorySeeds: [
      'Found the companion as a wounded youngling and nursed them back',
      'Inherited the bond from a predecessor beastmaster',
      'The animal chose you — you did not choose it',
      'You and the animal were both hunted, survived together',
      'Spent three years alone in wilderness with only the animal for company',
    ],

    imagePromptHint: 'beastmaster warrior with eagle on arm or wolf at heel, mid-range bow, short blade at hip, light practical armor, deep forest setting, Dar the Beastmaster aesthetic',
  },

  // ─────────────────────────────────────────────────────
  // WASTELAND SURVIVOR
  // Post-apoc improvisation — everything is craftable
  // ─────────────────────────────────────────────────────
  {
    id: 'wasteland-survivor',
    name: 'The Survivor',
    title: 'What the World Left Behind',
    description: 'You came up in the wasteland. You know how to build weapons from whatever the ruin left behind. You don\'t have access to the good stuff — you make the good stuff from junk. In the right hands, junk has opinions.',
    flavorText: '"Pre-war, you needed a factory. Post-war, you need patience and the right kind of desperate."',

    preferredCategories: ['firearm', 'bow', 'knife', 'blunt'],
    preferredSubtypes: ['pistol', 'revolver', 'recurve-bow', 'combat-knife', 'pipe', 'club'],
    genreAffinities: ['post-apocalypse'],

    startingKit: {
      primaryWeaponIds: [
        'firearm-pipe-pistol',      // Scrap pipe pistol (craftingOnly)
        'bow-scrap-lash-recurve',   // Scrap recurve (craftingOnly)
      ],
      secondaryWeaponIds: [
        'knife-scrap-shiv',         // Scrap shiv (craftingOnly)
        'blunt-pipe',               // Lead pipe (improvised)
        'knife-combat-wasteland',   // Combat knife
      ],
      armorHint: 'Improvised patchwork — tire rubber, car door sheet metal, layered canvas. Never pretty, usually functional.',
      consumables: [
        '10x Scrap Bullets (crude ammo)',
        'Bandages (5)',
        'Scrap Metal x3',
        'Duct Tape x2',
        'Healing Potion (improvised stimpak)',
        'Water Purification Tablets',
      ],
      gold: 5,
    },

    archetypeAbilities: [
      {
        id: 'survivor-field-craft',
        name: 'Field Craft',
        description: 'You can craft any weapon in the post-apocalypse catalog with appropriate materials, without a crafting station. Takes half the standard time.',
      },
      {
        id: 'survivor-improvised-proficiency',
        name: 'Improvised Proficiency',
        description: 'You are proficient with all improvised weapons. When using an improvised weapon, add your proficiency bonus to attack rolls.',
      },
      {
        id: 'survivor-scavenger',
        name: 'Scavenger',
        description: 'When looting a location, you find 50% more crafting materials than other characters would.',
      },
      {
        id: 'survivor-jury-rig',
        name: 'Jury-Rig',
        description: 'Once per encounter, as a bonus action, perform emergency field repairs on a damaged weapon — restore 1 condition level.',
        unlockLevel: 3,
      },
      {
        id: 'survivor-wasteland-wisdom',
        name: 'Wasteland Wisdom',
        description: 'You know the wasteland. Advantage on Survival checks, can estimate rarity and value of pre-war items on sight.',
        unlockLevel: 5,
      },
    ],

    primaryStats: ['dex', 'con', 'int'],
    keystoneStat: 'con',

    backstorySeeds: [
      'Born in a bunker, never left until the food ran out',
      'Last survivor of a raider attack — crawled away with nothing',
      'Former settlement scavenger who lost the settlement',
      'Wanderer who learned from the wasteland one painful lesson at a time',
      'Child soldier who grew up and put the war down, mostly',
    ],

    imagePromptHint: 'post-apocalyptic survivor, improvised patchwork armor, pipe pistol or scrap bow, wasteland dust and wreckage aesthetic, weathered, tired but present',
  },

  // ─────────────────────────────────────────────────────
  // SAMURAI
  // Honor, katana, the way of the sword
  // ─────────────────────────────────────────────────────
  {
    id: 'samurai',
    name: 'Samurai',
    title: 'The Way Requires the Doing',
    description: 'The katana is not just a weapon — it is a philosophy made steel. You follow the warrior\'s way with the precision of practice and the patience of someone who has found their answer. The shortbow is for distance. The katana is for everything else.',
    flavorText: '"They asked if I was afraid. I told them I had already decided the outcome. The fear was theirs."',

    preferredCategories: ['sword', 'bow'],
    preferredSubtypes: ['katana', 'wakizashi', 'nodachi', 'shortbow', 'yumi'],
    genreAffinities: ['japanese', 'mythological', 'dark-fantasy'],

    startingKit: {
      primaryWeaponIds: [
        'sword-katana-traditional',
        'sword-katana-blue-steel',
        'sword-iaijutsu-draw',
      ],
      secondaryWeaponIds: [
        'bow-yumi-traditional',
        'bow-shortbow-basic',
      ],
      armorHint: 'Lamellar armor (laminar-style Japanese equivalent) or light chainmail. Lacquered, maintained, visually precise.',
      consumables: [
        '10x Standard Arrows',
        'Katana Maintenance Kit',
        'Healing Potion',
        'Smelling Salts',
        'Rations (2 days)',
      ],
      gold: 100,
    },

    archetypeAbilities: [
      {
        id: 'samurai-iaijutsu',
        name: 'Iaijutsu Draw',
        description: 'At the start of combat, before anyone acts, make one free katana attack as a free action. Add your proficiency bonus as bonus damage.',
      },
      {
        id: 'samurai-bushido',
        name: 'Bushido',
        description: 'Once per long rest, when reduced to 0 HP, make a DC 12 Constitution save. On success, remain at 1 HP. You may still act on your current turn.',
      },
      {
        id: 'samurai-precise-cut',
        name: 'Precise Cut',
        description: 'With a katana, criticals always deal maximum rolled damage on the weapon dice.',
      },
      {
        id: 'samurai-honor-duel',
        name: 'Honor Duel',
        description: 'Challenge one creature to single combat. While both you and the target are alive and focusing only on each other, you both deal +2 damage per hit. If either attacks another creature, the effect ends.',
        unlockLevel: 5,
      },
    ],

    primaryStats: ['str', 'dex', 'wis'],
    keystoneStat: 'dex',

    backstorySeeds: [
      'Student of a dojo that was dissolved, trained under a now-masterless style',
      'Former castle guard who chose wandering over servitude',
      'Carried the sword through the war and emerged changed',
      'One-time student of a famous swordmaster, now carrying their legacy',
      'Self-imposed exile after a choice that honor did not permit',
    ],

    imagePromptHint: 'samurai in traditional lamellar armor, katana at hip in saya, composed and still, Japanese feudal aesthetic, cherry blossoms or battlefield dust',
  },

  // ─────────────────────────────────────────────────────
  // ASSASSIN / SHINOBI
  // ─────────────────────────────────────────────────────
  {
    id: 'assassin',
    name: 'Shadow Knife',
    title: 'The Problem Was Solved Before You Knew It Existed',
    description: 'You specialize in singular, decisive engagements. Not battles — conclusions. The dagger is your primary statement; concealment is your primary asset. You prefer to leave questions, not witnesses.',
    flavorText: '"The most dangerous person in the room is the one no one is watching."',

    preferredCategories: ['knife', 'exotic'],
    preferredSubtypes: ['dagger', 'stiletto', 'kukri', 'kunai', 'shuriken', 'rope-dart'],
    genreAffinities: ['japanese', 'dark-fantasy', 'medieval-fantasy', 'cyberpunk'],

    startingKit: {
      primaryWeaponIds: [
        'knife-stiletto-void',
        'knife-poison-stiletto',
        'knife-hunting-blade',
      ],
      secondaryWeaponIds: [
        'knife-kunai-set',
        'exotic-chain-sickle',
        'knife-ceramic-blade',
      ],
      armorHint: 'Shadow-grade leather — no metal, no jingle, no shine. Thin, supple, dark. Moves with the body.',
      consumables: [
        '5x Throwing Knives',
        'Poison (3 doses — contact)',
        'Smoke Bomb (2)',
        'Climbing Kit',
        'Healing Potion',
        'Forgery Tools',
      ],
      gold: 75,
    },

    archetypeAbilities: [
      {
        id: 'assassin-sneak-attack',
        name: 'Sneak Attack',
        description: 'When attacking with a finesse or concealed weapon while hidden or with advantage, add 3d6 to damage. Scales by +1d6 per 2 levels.',
      },
      {
        id: 'assassin-vanish',
        name: 'Vanish',
        description: 'Once per short rest, as a bonus action, take the Hide action even in plain sight.',
      },
      {
        id: 'assassin-death-strike',
        name: 'Death Strike',
        description: 'When you surprise a target in the first round of combat, if your attack hits, they must make a Constitution save (DC 8 + damage dealt) or immediately drop to 0 HP.',
        unlockLevel: 5,
      },
    ],

    primaryStats: ['dex', 'int'],
    keystoneStat: 'dex',

    backstorySeeds: [
      'Raised in an assassin\'s guild, left when the work became distasteful',
      'Learned the trade to avenge a family — the family is avenged, the trade remains',
      'Former spy for a dissolved intelligence organization',
      'Self-taught out of circumstances that required self-teaching',
    ],

    imagePromptHint: 'assassin in shadow, multiple daggers visible, dark leather, no armor shine, rooftop or alley setting, face partially concealed',
  },

  // ─────────────────────────────────────────────────────
  // PIRATE / BUCCANEER
  // Flintlock + cutlass, nautical
  // ─────────────────────────────────────────────────────
  {
    id: 'pirate',
    name: 'Buccaneer',
    title: 'The Sea Owes Me Several Favors',
    description: 'Firearm in one hand, cutlass in the other. You fight dirty because clean fights have losers, and you refuse to be one. The maritime life has taught you that rules are guidelines for those who haven\'t stood at the edge of the water.',
    flavorText: '"The code is more like... guidelines, anyway."',

    preferredCategories: ['firearm', 'sword', 'knife'],
    preferredSubtypes: ['flintlock-pistol', 'cutlass', 'scimitar', 'dagger'],
    genreAffinities: ['pirate', 'medieval-fantasy'],

    startingKit: {
      primaryWeaponIds: [
        'firearm-flintlock-pistol',
        'sword-cutlass-naval',
      ],
      secondaryWeaponIds: [
        'knife-naval-dirk',
        'knife-boarding-knife',
      ],
      armorHint: 'No armor or leather coat — you swim when you need to swim. A bandolier of powder charges. Rings.',
      consumables: [
        '6x Lead Ball + Powder Charge',
        '1x Bottle of Grog (healing potion variant — heals 1d4+1 but impairs)',
        'Rope (50ft)',
        'Grappling Hook',
        'Smoke Grenade (improvised)',
      ],
      gold: 30,
    },

    archetypeAbilities: [
      {
        id: 'pirate-dirty-fighter',
        name: 'Dirty Fighter',
        description: 'You\'ve mastered improvised tactics. When attacking with an improvised weapon or performing dirty tricks (sand in eyes, groin kick, headbutt), add +1d6 to damage.',
      },
      {
        id: 'pirate-sea-legs',
        name: 'Sea Legs',
        description: 'Never lose footing on unstable surfaces. Advantage on Acrobatics checks on ships, in storms, and in difficult terrain.',
      },
      {
        id: 'pirate-brace-for-it',
        name: 'Brace For It',
        description: 'Once per day, take half damage from a single attack that would reduce you to 0 HP instead.',
        unlockLevel: 3,
      },
    ],

    primaryStats: ['dex', 'str', 'cha'],
    keystoneStat: 'cha',

    backstorySeeds: [
      'Was press-ganged at 14, never looked back',
      'Former navy officer who chose the other side',
      'Merchant sailor who chose better profit margins',
      'Chasing a ship that sank your family vessel',
    ],

    imagePromptHint: 'pirate buccaneer, flintlock in hand, cutlass at hip, worn sailcloth, gold rings, ship deck or port town, roguish grin',
  },

  // ─────────────────────────────────────────────────────
  // BATTLE MAGE
  // Magic + blade hybrid
  // ─────────────────────────────────────────────────────
  {
    id: 'battle-mage',
    name: 'Battle Mage',
    title: 'The Magic Ends Where the Blade Begins — Nowhere',
    description: 'You refuse the division between magic and melee. The staff is both weapon and focus. The blade carries enchantment. You are not a mage who fights; you are a fighter who magics. The distinction matters to those who face you.',
    flavorText: '"They expected spellcasting at range. They got a longsword with opinions."',

    preferredCategories: ['sword', 'polearm', 'energy'],
    preferredSubtypes: ['longsword', 'bastard-sword', 'quarterstaff', 'force-staff', 'energy-sword'],
    genreAffinities: ['medieval-fantasy', 'dark-fantasy', 'sci-fi'],

    startingKit: {
      primaryWeaponIds: [
        'sword-runed-longsword',
        'blunt-quarterstaff',
        'sword-bastard',
      ],
      secondaryWeaponIds: [],
      armorHint: 'Medium armor — battle mages accept the magic penalty for staying alive. Runed bracers. Staff or focus in hand.',
      consumables: [
        'Spell Focus (5 charges)',
        'Arcane Catalyst (3)',
        'Healing Potion',
        'Mana Potion (optional by system)',
      ],
      gold: 85,
    },

    archetypeAbilities: [
      {
        id: 'battle-mage-spellblade',
        name: 'Spellblade',
        description: 'Once per turn, when you hit with a melee weapon, you can cast a cantrip or expend a spell slot for bonus damage.',
      },
      {
        id: 'battle-mage-arcane-ward',
        name: 'Arcane Ward',
        description: 'Maintain a magical defense as a bonus action. +2 AC when active; cannot move more than half speed.',
      },
      {
        id: 'battle-mage-force-step',
        name: 'Force Step',
        description: 'Teleport 10ft as a bonus action, landing adjacent to an enemy.',
        unlockLevel: 5,
      },
    ],

    primaryStats: ['int', 'str', 'dex'],
    keystoneStat: 'int',

    backstorySeeds: [
      'Failed the arcane academy entrance — went to war anyway and learned',
      'Former mage who found the laboratory too quiet',
      'Warrior who discovered a natural magical affinity mid-battle',
      'Trained in a tradition that never separated combat from magic',
    ],

    imagePromptHint: 'battle mage in runed armor, longsword in right hand, magical energy visible in left, both simultaneously active, fantasy warrior-wizard hybrid',
  },

  // ─────────────────────────────────────────────────────
  // TECHNO-ASSASSIN
  // Energy pistol + vibro-knife, scanner bypass
  // ─────────────────────────────────────────────────────
  {
    id: 'techno-assassin',
    name: 'Techno-Assassin',
    title: 'Firmware Updated. Target Eliminated.',
    description: 'You operate at the intersection of technology and violence. The energy pistol handles range; the vibro-knife handles what got close anyway. You bypass scanners, hack security, and move through systems the way other assassins move through shadows.',
    flavorText: '"The contract specified elimination. The contract did not specify what kind."',

    preferredCategories: ['energy', 'knife'],
    preferredSubtypes: ['laser-pistol', 'blaster', 'vibro-knife', 'ceramic-blade', 'molecular-knife'],
    genreAffinities: ['cyberpunk', 'sci-fi'],

    startingKit: {
      primaryWeaponIds: [
        'energy-laser-pistol-compact',
        'energy-laser-pistol',
      ],
      secondaryWeaponIds: [
        'knife-ceramic-blade',
        'knife-molecular-edge',
        'knife-vibro-knife',
      ],
      armorHint: 'Smart-fabric nano-armor — visually indistinguishable from street clothes. Anti-scanner coating. Hidden pockets.',
      consumables: [
        '2x Energy Cells (pistol)',
        'Hacking Module (3 uses)',
        'Smoke Emitter (2)',
        'Stimpak (2)',
        'Scanner-Proof Case',
      ],
      gold: 200,
    },

    archetypeAbilities: [
      {
        id: 'tech-assassin-bypass',
        name: 'Scanner Bypass',
        description: 'Your equipment is undetectable by standard scanners and metal detectors.',
      },
      {
        id: 'tech-assassin-silent-shot',
        name: 'Silent Shot',
        description: 'Your energy weapon fire is suppressed — targets farther than 30ft do not hear the discharge.',
      },
      {
        id: 'tech-assassin-neural-hack',
        name: 'Neural Hack',
        description: 'Once per encounter, make a Technology check against a cybernetically-enhanced target to disable one of their abilities for 1 round.',
        unlockLevel: 3,
      },
    ],

    primaryStats: ['dex', 'int'],
    keystoneStat: 'int',

    backstorySeeds: [
      'Former corporate security specialist who read the contract terms',
      'Freelance contractor who only asks the right questions',
      'Created as a weapon, now operating independently of original purpose',
      'Former resistance fighter who found the corporate rate more sustainable',
    ],

    imagePromptHint: 'techno-assassin in smart-fabric urban clothing, energy pistol drawn, vibroblade secondary, cyberpunk city setting, neon reflections, scanning a target',
  },
];

// ── Lookup helpers ────────────────────────────────────────

export function getArchetype(id: ArchetypeTag): Archetype | undefined {
  return ARCHETYPES.find(a => a.id === id);
}

export function getArchetypesByGenre(genre: GenreFamily): Archetype[] {
  return ARCHETYPES.filter(a => a.genreAffinities.includes(genre));
}

export function getArchetypesByWeaponCategory(category: WeaponCategory): Archetype[] {
  return ARCHETYPES.filter(a => a.preferredCategories.includes(category));
}

export const ARCHETYPE_IDS = ARCHETYPES.map(a => a.id);
