// ============================================================
// SPELL TERMINOLOGY UTILITY
// Genre-adaptive naming for spells, abilities, and magic schools.
// A sci-fi world uses "psionic abilities" not "spells", a cyberpunk
// world uses "programs" not "spells", etc.
//
// Used by: SpellCastModal, spells/generate route, dm-system prompt
// ============================================================

import type { Genre } from '@/lib/types/world';

export interface SpellTerminology {
  /** "spell" / "ability" / "program" / "hex" */
  ability: string;
  /** "spells" / "abilities" / "programs" / "hexes" */
  abilities: string;
  /** "cast" / "activate" / "execute" / "invoke" */
  verb: string;
  /** "Schools" / "Disciplines" / "Subroutines" / "Paths" */
  schoolsLabel: string;
  /** "slot" / "charge" / "bandwidth unit" / "psi point" */
  slotLabel: string;
  /** "slots" / "charges" / "bandwidth" / "psi points" */
  slotsLabel: string;
  /** "cantrip" / "at-will ability" / "routine" / "minor trick" */
  cantripLabel: string;
  /** "cantrips" / "at-will abilities" / "routines" */
  cantripsLabel: string;
  /** how tier/level labels are expressed: "1st-level", "Tier 1", "Formula I" */
  tierLabel: (n: number) => string;
  /** "Concentrating" / "Channeling" / "Projecting" / "Sustaining" */
  concentratingVerb: string;
  /** color accent class for the modal chrome (tailwind text color) */
  accentColor: string;
  /** icon emoji for the modal header */
  headerIcon: string;
  /** what "upcasting" is called: "Upcasting" / "Overclocking" / "Amplifying" */
  upcastVerb: string;
}

// ── School renames per genre ──────────────────────────────────
// Maps D&D school names → genre-appropriate equivalents.
// These are injected into the AI generation prompt.

export const GENRE_SCHOOL_RENAMES: Record<string, Record<string, string>> = {
  // ── Sci-Fi family ──────────────────────────────────────────
  'sci-fi': {
    Evocation:    'Kinetics',
    Conjuration:  'Teleportation',
    Enchantment:  'Neural Override',
    Abjuration:   'Force Barrier',
    Illusion:     'Holographic Projection',
    Necromancy:   'Biogenesis',
    Divination:   'Deep Scan',
    Transmutation:'Molecular Shift',
  },
  'hard-scifi': {
    Evocation:    'Kinetic Projection',
    Conjuration:  'Spatial Displacement',
    Enchantment:  'Cognitive Override',
    Abjuration:   'EM Shielding',
    Illusion:     'Active Camouflage',
    Necromancy:   'Bioregeneration',
    Divination:   'Sensor Array',
    Transmutation:'Structural Reconstitution',
  },
  'deep-space-opera': {
    Evocation:    'Stellar Force',
    Conjuration:  'Warp Summoning',
    Enchantment:  'Empathic Link',
    Abjuration:   'Void Shielding',
    Illusion:     'Phantom Signal',
    Necromancy:   'Zero-Point Resurgence',
    Divination:   'Precognition',
    Transmutation:'Stellar Alchemy',
  },
  'post-singularity': {
    Evocation:    'Datastream Burst',
    Conjuration:  'Substrate Summon',
    Enchantment:  'Emotional Overwrite',
    Abjuration:   'Recursive Shield',
    Illusion:     'Reality Render',
    Necromancy:   'Process Revival',
    Divination:   'Temporal Prediction',
    Transmutation:'Self-Modification',
  },
  'generation-ship': {
    Evocation:    'Reactor Discharge',
    Conjuration:  'Drone Assembly',
    Enchantment:  'Behavioral Modding',
    Abjuration:   'Hull Reinforcement',
    Illusion:     'Sensor Ghost',
    Necromancy:   'Medical Resurrection',
    Divination:   'Life-Sign Scan',
    Transmutation:'Nanite Reconstruction',
  },
  'colony-world': {
    Evocation:    'Atmospheric Charge',
    Conjuration:  'Resource Fabrication',
    Enchantment:  'Social Engineering',
    Abjuration:   'Perimeter Defense',
    Illusion:     'Terrain Masking',
    Necromancy:   'Bio-Revival',
    Divination:   'Survey Protocol',
    Transmutation:'Terraforming Touch',
  },
  'post-contact': {
    Evocation:    'Xenokinetics',
    Conjuration:  'Xenosummoning',
    Enchantment:  'Alien Empathy',
    Abjuration:   'Quantum Shielding',
    Illusion:     'Mimicry Field',
    Necromancy:   'Xenobiology',
    Divination:   'First-Contact Sense',
    Transmutation:'Xenomorphic Shift',
  },
  'uploaded-world': {
    Evocation:    'Packet Blast',
    Conjuration:  'Process Spawn',
    Enchantment:  'Memory Write',
    Abjuration:   'Encryption Ward',
    Illusion:     'Deepfake Projection',
    Necromancy:   'Restoration Backup',
    Divination:   'Data Sweep',
    Transmutation:'Recompile',
  },
  // ── Cyberpunk family ──────────────────────────────────────
  'cyberpunk': {
    Evocation:    'Surge',
    Conjuration:  'Spawn',
    Enchantment:  'Neural Hack',
    Abjuration:   'Firewall',
    Illusion:     'Spoof',
    Necromancy:   'Deadware Revival',
    Divination:   'Deep Recon',
    Transmutation:'Biohack',
  },
  // ── Post-Apocalypse ───────────────────────────────────────
  'post-apocalypse': {
    Evocation:    'Combustion',
    Conjuration:  'Salvage Swarm',
    Enchantment:  'Coercion',
    Abjuration:   'Scrap Fortification',
    Illusion:     'Diversion',
    Necromancy:   'Mortification',
    Divination:   'Scav Sense',
    Transmutation:'Mutation',
  },
  // ── Steampunk ─────────────────────────────────────────────
  'steampunk': {
    Evocation:    'Voltaic Discharge',
    Conjuration:  'Alchemical Manufacture',
    Enchantment:  'Mesmerism',
    Abjuration:   'Pneumatic Ward',
    Illusion:     'Optical Illusion',
    Necromancy:   'Galvanic Reanimation',
    Divination:   'Aetheric Reading',
    Transmutation:'Alchemical Tincture',
  },
  // ── Lovecraftian / Cosmic Horror ──────────────────────────
  'lovecraftian': {
    Evocation:    'Void Emanation',
    Conjuration:  'Beyond-Calling',
    Enchantment:  'The Dreaming',
    Abjuration:   'Elder Warding',
    Illusion:     'The Veil',
    Necromancy:   'Deep-Time Unlife',
    Divination:   'The Black Gaze',
    Transmutation:'Flesh Reshaping',
  },
  'cosmic-horror': {
    Evocation:    'Void Burst',
    Conjuration:  'Outer Calling',
    Enchantment:  'The Whisper',
    Abjuration:   'Hermetic Seal',
    Illusion:     'False-Reality',
    Necromancy:   'Un-Death',
    Divination:   'Peering',
    Transmutation:'Body Horror',
  },
  // ── Western / Frontier ────────────────────────────────────
  'western': {
    Evocation:    'Brimstone',
    Conjuration:  'Dust Devil Calling',
    Enchantment:  'Hexwork',
    Abjuration:   'Iron Will',
    Illusion:     'Mirage',
    Necromancy:   'Death\'s Hand',
    Divination:   'Trail Signs',
    Transmutation:'Frontier Craft',
  },
  // ── Horror family ─────────────────────────────────────────
  'horror': {
    Evocation:    'Dark Force',
    Conjuration:  'Summoning',
    Enchantment:  'Compulsion',
    Abjuration:   'Warding',
    Illusion:     'Terror',
    Necromancy:   'Undeath',
    Divination:   'Second Sight',
    Transmutation:'Corruption',
  },
  // ── Superhero ─────────────────────────────────────────────
  'superhero': {
    Evocation:    'Energy Blast',
    Conjuration:  'Summoning',
    Enchantment:  'Psychic Influence',
    Abjuration:   'Force Field',
    Illusion:     'Illusion',
    Necromancy:   'Regeneration',
    Divination:   'Precognition',
    Transmutation:'Transformation',
  },
  // ── Pirate / Age of Sail ──────────────────────────────────
  'pirate': {
    Evocation:    'Tidal Force',
    Conjuration:  'Sea Calling',
    Enchantment:  'Sailor\'s Charm',
    Abjuration:   'Dead Calm Ward',
    Illusion:     'Sea Mist',
    Necromancy:   'Drowned Rising',
    Divination:   'Navigator\'s Eye',
    Transmutation:'Seachange',
  },
  // ── Mythological / Ancient ────────────────────────────────
  'mythological': {
    Evocation:    'Divine Strike',
    Conjuration:  'Sacred Summoning',
    Enchantment:  'Divine Favor',
    Abjuration:   'Sacred Ward',
    Illusion:     'Holy Veil',
    Necromancy:   'Soul Rite',
    Divination:   'Oracle Vision',
    Transmutation:'Divine Transformation',
  },
  'norse-twilight': {
    Evocation:    'Rune Blast',
    Conjuration:  'Einherjar Summoning',
    Enchantment:  'Seiðr Binding',
    Abjuration:   'Aegis Rune',
    Illusion:     'Shape-Memory',
    Necromancy:   'Draugr Rite',
    Divination:   'Völva\'s Sight',
    Transmutation:'Hamingja Shift',
  },
  'greek-heroic-age': {
    Evocation:    'Olympian Thunderbolt',
    Conjuration:  'Khthonic Summoning',
    Enchantment:  'Aphrodite\'s Charm',
    Abjuration:   'Athena\'s Aegis',
    Illusion:     'Hermes\' Veil',
    Necromancy:   'Underworld Rite',
    Divination:   'Oracle\'s Eye',
    Transmutation:'Protean Change',
  },
  'feudal-japan-supernatural': {
    Evocation:    'Jutsu',
    Conjuration:  'Summoning Seal',
    Enchantment:  'Binding',
    Abjuration:   'Ward Seal',
    Illusion:     'Illusion',
    Necromancy:   'Death Seal',
    Divination:   'Kenbun',
    Transmutation:'Henge',
  },
  // ── Contemporary / Modern ─────────────────────────────────
  'modern-magic-revealed': {
    Evocation:    'Evocation',     // fantasy schools still apply here
    Conjuration:  'Conjuration',
    Enchantment:  'Enchantment',
    Abjuration:   'Abjuration',
    Illusion:     'Illusion',
    Necromancy:   'Necromancy',
    Divination:   'Divination',
    Transmutation:'Transmutation',
  },
  'corporate-dystopia': {
    Evocation:    'Weaponized Signal',
    Conjuration:  'Asset Deployment',
    Enchantment:  'Behavioral Targeting',
    Abjuration:   'Compliance Protocol',
    Illusion:     'PR Veil',
    Necromancy:   'Reactivation',
    Divination:   'Market Intelligence',
    Transmutation:'Corporate Optimization',
  },
  'superhuman-emergence': {
    Evocation:    'Energy Surge',
    Conjuration:  'Matter Generation',
    Enchantment:  'Psychic Influence',
    Abjuration:   'Force Barrier',
    Illusion:     'Camouflage',
    Necromancy:   'Accelerated Healing',
    Divination:   'Prescience',
    Transmutation:'Physical Augmentation',
  },
};

// ── Terminology map by genre ──────────────────────────────────
const romanNumerals = ['I','II','III','IV','V','VI','VII','VIII','IX'];
const ordinalSuffix = (n: number) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

const GENRE_TERMINOLOGY: Record<string, SpellTerminology> = {
  // ── Fantasy family ────────────────────────────────────────
  'epic-fantasy': {
    ability: 'spell', abilities: 'spells', verb: 'cast',
    schoolsLabel: 'Schools', slotLabel: 'slot', slotsLabel: 'slots',
    cantripLabel: 'cantrip', cantripsLabel: 'cantrips',
    tierLabel: n => `${ordinalSuffix(n)}-level`,
    concentratingVerb: 'Concentrating', accentColor: 'text-purple-300',
    headerIcon: '✨', upcastVerb: 'Upcasting',
  },
  'dark-fantasy': {
    ability: 'hex', abilities: 'hexes', verb: 'invoke',
    schoolsLabel: 'Dark Rites', slotLabel: 'curse slot', slotsLabel: 'curse slots',
    cantripLabel: 'curse-trick', cantripsLabel: 'curse-tricks',
    tierLabel: n => `${ordinalSuffix(n)} Curse`,
    concentratingVerb: 'Binding', accentColor: 'text-red-400',
    headerIcon: '🩸', upcastVerb: 'Deepening',
  },
  'dying-world': {
    ability: 'dying art', abilities: 'dying arts', verb: 'wield',
    schoolsLabel: 'Lost Schools', slotLabel: 'remnant', slotsLabel: 'remnants',
    cantripLabel: 'echo', cantripsLabel: 'echoes',
    tierLabel: n => `${ordinalSuffix(n)} Remnant`,
    concentratingVerb: 'Channeling', accentColor: 'text-amber-500',
    headerIcon: '🕯️', upcastVerb: 'Intensifying',
  },
  'clockwork-fantasy': {
    ability: 'formula', abilities: 'formulae', verb: 'apply',
    schoolsLabel: 'Sciences', slotLabel: 'application', slotsLabel: 'applications',
    cantripLabel: 'basic procedure', cantripsLabel: 'basic procedures',
    tierLabel: n => `Formula ${romanNumerals[n - 1] ?? n}`,
    concentratingVerb: 'Sustaining', accentColor: 'text-amber-300',
    headerIcon: '⚙️', upcastVerb: 'Amplifying',
  },
  'hidden-magic': {
    ability: 'working', abilities: 'workings', verb: 'perform',
    schoolsLabel: 'Secret Arts', slotLabel: 'focus', slotsLabel: 'focus',
    cantripLabel: 'trick', cantripsLabel: 'tricks',
    tierLabel: n => `${ordinalSuffix(n)}-level`,
    concentratingVerb: 'Maintaining', accentColor: 'text-teal-400',
    headerIcon: '🤫', upcastVerb: 'Expanding',
  },
  'planar-world': {
    ability: 'planar art', abilities: 'planar arts', verb: 'channel',
    schoolsLabel: 'Planes', slotLabel: 'planar charge', slotsLabel: 'planar charges',
    cantripLabel: 'cantrip', cantripsLabel: 'cantrips',
    tierLabel: n => `Plane-${n}`,
    concentratingVerb: 'Attuning', accentColor: 'text-indigo-400',
    headerIcon: '🌌', upcastVerb: 'Ascending',
  },
  // ── Horror ────────────────────────────────────────────────
  'horror': {
    ability: 'rite', abilities: 'rites', verb: 'perform',
    schoolsLabel: 'Dark Paths', slotLabel: 'dark focus', slotsLabel: 'dark focus',
    cantripLabel: 'minor rite', cantripsLabel: 'minor rites',
    tierLabel: n => `${ordinalSuffix(n)} Rite`,
    concentratingVerb: 'Maintaining', accentColor: 'text-red-500',
    headerIcon: '🕯️', upcastVerb: 'Deepening',
  },
  'lovecraftian': {
    ability: 'ritual', abilities: 'rituals', verb: 'invoke',
    schoolsLabel: 'Eldritch Paths', slotLabel: 'sanity fragment', slotsLabel: 'sanity',
    cantripLabel: 'minor working', cantripsLabel: 'minor workings',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Ritual`,
    concentratingVerb: 'Maintaining Sanity for', accentColor: 'text-green-400',
    headerIcon: '🐙', upcastVerb: 'Deepening the Void',
  },
  'cosmic-horror': {
    ability: 'ritual', abilities: 'rituals', verb: 'invoke',
    schoolsLabel: 'Outer Paths', slotLabel: 'mind shard', slotsLabel: 'mind shards',
    cantripLabel: 'minor working', cantripsLabel: 'minor workings',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Void`,
    concentratingVerb: 'Enduring', accentColor: 'text-green-500',
    headerIcon: '🌀', upcastVerb: 'Widening the Breach',
  },
  // ── Sci-Fi family ─────────────────────────────────────────
  'sci-fi': {
    ability: 'psionic ability', abilities: 'psionic abilities', verb: 'activate',
    schoolsLabel: 'Disciplines', slotLabel: 'psi point', slotsLabel: 'psi points',
    cantripLabel: 'at-will ability', cantripsLabel: 'at-will abilities',
    tierLabel: n => `Tier ${n}`,
    concentratingVerb: 'Projecting', accentColor: 'text-cyan-400',
    headerIcon: '🧠', upcastVerb: 'Amplifying',
  },
  'hard-scifi': {
    ability: 'cognitive technique', abilities: 'cognitive techniques', verb: 'initiate',
    schoolsLabel: 'Disciplines', slotLabel: 'cognitive unit', slotsLabel: 'cognitive units',
    cantripLabel: 'passive ability', cantripsLabel: 'passive abilities',
    tierLabel: n => `Tier-${n} Protocol`,
    concentratingVerb: 'Sustaining', accentColor: 'text-cyan-300',
    headerIcon: '🔬', upcastVerb: 'Intensifying',
  },
  'deep-space-opera': {
    ability: 'stellar ability', abilities: 'stellar abilities', verb: 'activate',
    schoolsLabel: 'Force Disciplines', slotLabel: 'force point', slotsLabel: 'force points',
    cantripLabel: 'at-will power', cantripsLabel: 'at-will powers',
    tierLabel: n => `Tier ${n}`,
    concentratingVerb: 'Channeling', accentColor: 'text-blue-400',
    headerIcon: '⭐', upcastVerb: 'Surging',
  },
  'post-singularity': {
    ability: 'process', abilities: 'processes', verb: 'execute',
    schoolsLabel: 'Domains', slotLabel: 'process thread', slotsLabel: 'threads',
    cantripLabel: 'passive process', cantripsLabel: 'passive processes',
    tierLabel: n => `Process-${n}`,
    concentratingVerb: 'Running', accentColor: 'text-emerald-400',
    headerIcon: '🤖', upcastVerb: 'Overclocking',
  },
  'generation-ship': {
    ability: 'ship system', abilities: 'ship systems', verb: 'activate',
    schoolsLabel: 'System Categories', slotLabel: 'power unit', slotsLabel: 'power units',
    cantripLabel: 'standard system', cantripsLabel: 'standard systems',
    tierLabel: n => `Class-${n} System`,
    concentratingVerb: 'Routing power to', accentColor: 'text-slate-300',
    headerIcon: '🚀', upcastVerb: 'Overcharging',
  },
  'colony-world': {
    ability: 'field technique', abilities: 'field techniques', verb: 'deploy',
    schoolsLabel: 'Specializations', slotLabel: 'deployment', slotsLabel: 'deployments',
    cantripLabel: 'basic technique', cantripsLabel: 'basic techniques',
    tierLabel: n => `Tier ${n}`,
    concentratingVerb: 'Sustaining', accentColor: 'text-green-400',
    headerIcon: '🌍', upcastVerb: 'Scaling Up',
  },
  'post-contact': {
    ability: 'xenotech ability', abilities: 'xenotech abilities', verb: 'interface',
    schoolsLabel: 'Xenodisciplines', slotLabel: 'interface charge', slotsLabel: 'interface charges',
    cantripLabel: 'passive interface', cantripsLabel: 'passive interfaces',
    tierLabel: n => `Tier-${n} Xenotech`,
    concentratingVerb: 'Interfacing', accentColor: 'text-teal-400',
    headerIcon: '👽', upcastVerb: 'Deep Interfacing',
  },
  'uploaded-world': {
    ability: 'subroutine', abilities: 'subroutines', verb: 'run',
    schoolsLabel: 'Code Classes', slotLabel: 'process slot', slotsLabel: 'process slots',
    cantripLabel: 'passive script', cantripsLabel: 'passive scripts',
    tierLabel: n => `v${n}.0 Subroutine`,
    concentratingVerb: 'Running', accentColor: 'text-lime-400',
    headerIcon: '💻', upcastVerb: 'Overclocking',
  },
  'time-war': {
    ability: 'temporal ability', abilities: 'temporal abilities', verb: 'wield',
    schoolsLabel: 'Temporal Schools', slotLabel: 'chrono-charge', slotsLabel: 'chrono-charges',
    cantripLabel: 'at-will ability', cantripsLabel: 'at-will abilities',
    tierLabel: n => `T${n} Temporal`,
    concentratingVerb: 'Stabilizing', accentColor: 'text-yellow-400',
    headerIcon: '⏳', upcastVerb: 'Cascading',
  },
  // ── Cyberpunk ─────────────────────────────────────────────
  'cyberpunk': {
    ability: 'program', abilities: 'programs', verb: 'execute',
    schoolsLabel: 'Subroutines', slotLabel: 'bandwidth unit', slotsLabel: 'bandwidth',
    cantripLabel: 'passive script', cantripsLabel: 'passive scripts',
    tierLabel: n => `Tier-${n}.exe`,
    concentratingVerb: 'Running', accentColor: 'text-cyan-300',
    headerIcon: '💾', upcastVerb: 'Overclocking',
  },
  // ── Post-Apocalypse ───────────────────────────────────────
  'post-apocalypse': {
    ability: 'mutant power', abilities: 'mutant powers', verb: 'trigger',
    schoolsLabel: 'Channels', slotLabel: 'fuel', slotsLabel: 'fuel',
    cantripLabel: 'passive mutation', cantripsLabel: 'passive mutations',
    tierLabel: n => `Rank-${n} Power`,
    concentratingVerb: 'Straining', accentColor: 'text-orange-400',
    headerIcon: '☢️', upcastVerb: 'Pushing the Limit',
  },
  // ── Steampunk ─────────────────────────────────────────────
  'steampunk': {
    ability: 'formula', abilities: 'formulae', verb: 'apply',
    schoolsLabel: 'Sciences', slotLabel: 'application', slotsLabel: 'applications',
    cantripLabel: 'basic procedure', cantripsLabel: 'basic procedures',
    tierLabel: n => `Formula ${romanNumerals[n - 1] ?? n}`,
    concentratingVerb: 'Sustaining', accentColor: 'text-amber-400',
    headerIcon: '⚗️', upcastVerb: 'Amplifying',
  },
  // ── Mythological family ───────────────────────────────────
  'mythological': {
    ability: 'invocation', abilities: 'invocations', verb: 'invoke',
    schoolsLabel: 'Divine Domains', slotLabel: 'divine favor', slotsLabel: 'divine favor',
    cantripLabel: 'prayer', cantripsLabel: 'prayers',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Invocation`,
    concentratingVerb: 'Blessed by', accentColor: 'text-yellow-300',
    headerIcon: '⚡', upcastVerb: 'Ascending',
  },
  'norse-twilight': {
    ability: 'rune', abilities: 'runes', verb: 'carve',
    schoolsLabel: 'Runic Arts', slotLabel: 'rune charge', slotsLabel: 'rune charges',
    cantripLabel: 'minor rune', cantripsLabel: 'minor runes',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Rune`,
    concentratingVerb: 'Channeling', accentColor: 'text-blue-300',
    headerIcon: '᚛', upcastVerb: 'Deepening the Rune',
  },
  'greek-heroic-age': {
    ability: 'invocation', abilities: 'invocations', verb: 'invoke',
    schoolsLabel: 'Divine Aspects', slotLabel: 'divine charge', slotsLabel: 'divine charges',
    cantripLabel: 'minor blessing', cantripsLabel: 'minor blessings',
    tierLabel: n => `${ordinalSuffix(n)}-Degree`,
    concentratingVerb: 'Favored by', accentColor: 'text-yellow-400',
    headerIcon: '🏺', upcastVerb: 'Ascending',
  },
  'egyptian-eternal': {
    ability: 'divine rite', abilities: 'divine rites', verb: 'perform',
    schoolsLabel: 'Sacred Domains', slotLabel: 'ka fragment', slotsLabel: 'ka fragments',
    cantripLabel: 'minor rite', cantripsLabel: 'minor rites',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Rite`,
    concentratingVerb: 'Channeling Ka for', accentColor: 'text-gold-400',
    headerIcon: '𓂀', upcastVerb: 'Consecrating',
  },
  'arthurian-twilight': {
    ability: 'chivalric art', abilities: 'chivalric arts', verb: 'invoke',
    schoolsLabel: 'Virtues', slotLabel: 'virtue', slotsLabel: 'virtue',
    cantripLabel: 'oath-trick', cantripsLabel: 'oath-tricks',
    tierLabel: n => `${ordinalSuffix(n)}-Degree Art`,
    concentratingVerb: 'Bound by Oath to', accentColor: 'text-slate-200',
    headerIcon: '⚔️', upcastVerb: 'Exerting',
  },
  'feudal-japan-supernatural': {
    ability: 'jutsu', abilities: 'jutsu', verb: 'unleash',
    schoolsLabel: 'Jutsu Types', slotLabel: 'chakra', slotsLabel: 'chakra',
    cantripLabel: 'basic jutsu', cantripsLabel: 'basic jutsu',
    tierLabel: n => `Rank-${n} Jutsu`,
    concentratingVerb: 'Sustaining', accentColor: 'text-red-300',
    headerIcon: '🥷', upcastVerb: 'Releasing All Chakra',
  },
  'age-of-sail-mythology': {
    ability: 'sea-art', abilities: 'sea-arts', verb: 'weave',
    schoolsLabel: 'Tidal Arts', slotLabel: 'tide', slotsLabel: 'tides',
    cantripLabel: 'sailor\'s trick', cantripsLabel: 'sailor\'s tricks',
    tierLabel: n => `${ordinalSuffix(n)}-Wave`,
    concentratingVerb: 'Riding', accentColor: 'text-blue-400',
    headerIcon: '🌊', upcastVerb: 'Riding the Storm',
  },
  'celtic-spiritworld': {
    ability: 'druidic art', abilities: 'druidic arts', verb: 'channel',
    schoolsLabel: 'Spirit Paths', slotLabel: 'spirit charge', slotsLabel: 'spirit charges',
    cantripLabel: 'cantrip', cantripsLabel: 'cantrips',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Art`,
    concentratingVerb: 'Channeling', accentColor: 'text-green-300',
    headerIcon: '🌿', upcastVerb: 'Deepening',
  },
  'aztec-sun-keeping': {
    ability: 'solar rite', abilities: 'solar rites', verb: 'perform',
    schoolsLabel: 'Solar Aspects', slotLabel: 'sun-blood', slotsLabel: 'sun-blood',
    cantripLabel: 'minor offering', cantripsLabel: 'minor offerings',
    tierLabel: n => `${ordinalSuffix(n)}-Sun Rite`,
    concentratingVerb: 'Sustaining the Sun for', accentColor: 'text-orange-400',
    headerIcon: '☀️', upcastVerb: 'Bleeding the Sun',
  },
  'mesopotamian-dawn': {
    ability: 'incantation', abilities: 'incantations', verb: 'recite',
    schoolsLabel: 'Divine Domains', slotLabel: 'divine word', slotsLabel: 'divine words',
    cantripLabel: 'minor incantation', cantripsLabel: 'minor incantations',
    tierLabel: n => `${ordinalSuffix(n)}-Tier Word`,
    concentratingVerb: 'Reciting', accentColor: 'text-amber-300',
    headerIcon: '📜', upcastVerb: 'Intensifying',
  },
  // ── Western ───────────────────────────────────────────────
  'western': {
    ability: 'brand', abilities: 'brands', verb: 'brand',
    schoolsLabel: 'Signs', slotLabel: 'charge', slotsLabel: 'charges',
    cantripLabel: 'minor sign', cantripsLabel: 'minor signs',
    tierLabel: n => `${ordinalSuffix(n)}-Brand`,
    concentratingVerb: 'Holding', accentColor: 'text-amber-500',
    headerIcon: '🤠', upcastVerb: 'Burning Deeper',
  },
  // ── Pirate ────────────────────────────────────────────────
  'pirate': {
    ability: 'sea-curse', abilities: 'sea-curses', verb: 'weave',
    schoolsLabel: 'Tidal Arts', slotLabel: 'tide', slotsLabel: 'tides',
    cantripLabel: 'shanty', cantripsLabel: 'shanties',
    tierLabel: n => `${ordinalSuffix(n)}-Wave`,
    concentratingVerb: 'Sustaining', accentColor: 'text-blue-400',
    headerIcon: '🏴‍☠️', upcastVerb: 'Riding the Storm',
  },
  // ── Superhero ─────────────────────────────────────────────
  'superhero': {
    ability: 'power', abilities: 'powers', verb: 'use',
    schoolsLabel: 'Power Types', slotLabel: 'charge', slotsLabel: 'charges',
    cantripLabel: 'passive power', cantripsLabel: 'passive powers',
    tierLabel: n => `Tier-${n} Power`,
    concentratingVerb: 'Sustaining', accentColor: 'text-yellow-300',
    headerIcon: '⚡', upcastVerb: 'Going Plus Ultra',
  },
  // ── Contemporary ──────────────────────────────────────────
  'modern-magic-revealed': {
    ability: 'spell', abilities: 'spells', verb: 'cast',
    schoolsLabel: 'Schools', slotLabel: 'slot', slotsLabel: 'slots',
    cantripLabel: 'cantrip', cantripsLabel: 'cantrips',
    tierLabel: n => `${ordinalSuffix(n)}-level`,
    concentratingVerb: 'Concentrating', accentColor: 'text-purple-300',
    headerIcon: '✨', upcastVerb: 'Upcasting',
  },
  'zombie-apocalypse': {
    ability: 'survivor skill', abilities: 'survivor skills', verb: 'use',
    schoolsLabel: 'Specializations', slotLabel: 'stamina', slotsLabel: 'stamina',
    cantripLabel: 'basic instinct', cantripsLabel: 'basic instincts',
    tierLabel: n => `Rank-${n}`,
    concentratingVerb: 'Pushing through', accentColor: 'text-green-400',
    headerIcon: '🧟', upcastVerb: 'Going All-In',
  },
  'alien-occupation': {
    ability: 'resistance technique', abilities: 'resistance techniques', verb: 'employ',
    schoolsLabel: 'Methods', slotLabel: 'resource', slotsLabel: 'resources',
    cantripLabel: 'basic tactic', cantripsLabel: 'basic tactics',
    tierLabel: n => `Tier-${n}`,
    concentratingVerb: 'Sustaining', accentColor: 'text-green-500',
    headerIcon: '👽', upcastVerb: 'Going Deeper',
  },
  'corporate-dystopia': {
    ability: 'protocol', abilities: 'protocols', verb: 'execute',
    schoolsLabel: 'Departments', slotLabel: 'authorization', slotsLabel: 'authorizations',
    cantripLabel: 'standard op', cantripsLabel: 'standard ops',
    tierLabel: n => `Protocol ${romanNumerals[n - 1] ?? n}`,
    concentratingVerb: 'Running', accentColor: 'text-slate-300',
    headerIcon: '🏢', upcastVerb: 'Escalating',
  },
  'superhuman-emergence': {
    ability: 'power', abilities: 'powers', verb: 'unleash',
    schoolsLabel: 'Power Origins', slotLabel: 'power charge', slotsLabel: 'power charges',
    cantripLabel: 'passive power', cantripsLabel: 'passive powers',
    tierLabel: n => `Level-${n} Power`,
    concentratingVerb: 'Outputting', accentColor: 'text-yellow-400',
    headerIcon: '💥', upcastVerb: 'Going Plus Ultra',
  },
  'secret-government': {
    ability: 'classified technique', abilities: 'classified techniques', verb: 'deploy',
    schoolsLabel: 'Program Types', slotLabel: 'clearance', slotsLabel: 'clearances',
    cantripLabel: 'standard procedure', cantripsLabel: 'standard procedures',
    tierLabel: n => `Level-${n} Clearance`,
    concentratingVerb: 'Maintaining', accentColor: 'text-slate-300',
    headerIcon: '🔐', upcastVerb: 'Going Black',
  },
  // ── Hybrid / Strange ──────────────────────────────────────
  'dream-world': {
    ability: 'dream-art', abilities: 'dream-arts', verb: 'dream',
    schoolsLabel: 'Dream Aspects', slotLabel: 'lucidity', slotsLabel: 'lucidity',
    cantripLabel: 'dream-touch', cantripsLabel: 'dream-touches',
    tierLabel: n => `${ordinalSuffix(n)}-Layer Dream`,
    concentratingVerb: 'Dreaming', accentColor: 'text-violet-400',
    headerIcon: '💭', upcastVerb: 'Dreaming Deeper',
  },
  'the-afterlife-itself': {
    ability: 'soul art', abilities: 'soul arts', verb: 'intone',
    schoolsLabel: 'Soul Aspects', slotLabel: 'soul fragment', slotsLabel: 'soul fragments',
    cantripLabel: 'minor resonance', cantripsLabel: 'minor resonances',
    tierLabel: n => `${ordinalSuffix(n)}-Veil`,
    concentratingVerb: 'Anchoring', accentColor: 'text-white',
    headerIcon: '👻', upcastVerb: 'Unraveling',
  },
  'inside-a-god': {
    ability: 'divine fragment', abilities: 'divine fragments', verb: 'manifest',
    schoolsLabel: 'Divine Aspects', slotLabel: 'divinity shard', slotsLabel: 'divinity shards',
    cantripLabel: 'minor manifestation', cantripsLabel: 'minor manifestations',
    tierLabel: n => `${ordinalSuffix(n)}-Aspect`,
    concentratingVerb: 'Embodying', accentColor: 'text-yellow-300',
    headerIcon: '🌞', upcastVerb: 'Ascending',
  },
  'monsters-world': {
    ability: 'monster ability', abilities: 'monster abilities', verb: 'unleash',
    schoolsLabel: 'Monster Traits', slotLabel: 'ferocity', slotsLabel: 'ferocity',
    cantripLabel: 'instinct', cantripsLabel: 'instincts',
    tierLabel: n => `Rank-${n}`,
    concentratingVerb: 'Maintaining', accentColor: 'text-red-400',
    headerIcon: '👹', upcastVerb: 'Going Feral',
  },
  'noir': {
    ability: 'trick', abilities: 'tricks', verb: 'pull',
    schoolsLabel: 'Methods', slotLabel: 'favor', slotsLabel: 'favors',
    cantripLabel: 'basic move', cantripsLabel: 'basic moves',
    tierLabel: n => `${ordinalSuffix(n)}-Degree`,
    concentratingVerb: 'Working', accentColor: 'text-slate-300',
    headerIcon: '🕵️', upcastVerb: 'Going All In',
  },
  'survival': {
    ability: 'technique', abilities: 'techniques', verb: 'use',
    schoolsLabel: 'Specializations', slotLabel: 'stamina', slotsLabel: 'stamina',
    cantripLabel: 'basic skill', cantripsLabel: 'basic skills',
    tierLabel: n => `Rank-${n}`,
    concentratingVerb: 'Sustaining', accentColor: 'text-green-400',
    headerIcon: '🏕️', upcastVerb: 'Pushing Limits',
  },
  'military': {
    ability: 'tactic', abilities: 'tactics', verb: 'deploy',
    schoolsLabel: 'Disciplines', slotLabel: 'operation', slotsLabel: 'operations',
    cantripLabel: 'standard tactic', cantripsLabel: 'standard tactics',
    tierLabel: n => `Op-${n}`,
    concentratingVerb: 'Coordinating', accentColor: 'text-slate-300',
    headerIcon: '🎖️', upcastVerb: 'Escalating',
  },
};

// ── Default fallback ──────────────────────────────────────────
const DEFAULT_TERMINOLOGY: SpellTerminology = GENRE_TERMINOLOGY['epic-fantasy'];

/**
 * Returns genre-appropriate spell terminology.
 * Checks `magicSystem.abilityTerminology` first (if the world record has
 * overrides), then falls back to the genre map, then to fantasy defaults.
 */
export function getSpellTerminology(
  genre?: string,
  magicSystem?: { abilityTerminology?: Partial<SpellTerminology> }
): SpellTerminology {
  const base: SpellTerminology = (genre ? GENRE_TERMINOLOGY[genre] : undefined) ?? DEFAULT_TERMINOLOGY;
  if (!magicSystem?.abilityTerminology) return base;
  const ov = magicSystem.abilityTerminology;
  // Merge only defined overrides so undefined values never shadow the base
  const merged: SpellTerminology = { ...base };
  if (ov.ability        !== undefined) merged.ability        = ov.ability;
  if (ov.abilities      !== undefined) merged.abilities      = ov.abilities;
  if (ov.verb           !== undefined) merged.verb           = ov.verb;
  if (ov.schoolsLabel   !== undefined) merged.schoolsLabel   = ov.schoolsLabel;
  if (ov.slotLabel      !== undefined) merged.slotLabel      = ov.slotLabel;
  if (ov.slotsLabel     !== undefined) merged.slotsLabel     = ov.slotsLabel;
  if (ov.cantripLabel   !== undefined) merged.cantripLabel   = ov.cantripLabel;
  if (ov.cantripsLabel  !== undefined) merged.cantripsLabel  = ov.cantripsLabel;
  if (ov.concentratingVerb !== undefined) merged.concentratingVerb = ov.concentratingVerb;
  if (ov.upcastVerb     !== undefined) merged.upcastVerb     = ov.upcastVerb;
  return merged;
}

/**
 * Returns the genre-appropriate name for a D&D magic school.
 * Falls back to the school name itself if no rename is defined.
 */
export function renameSchool(school: string, genre?: string): string {
  if (!genre) return school;
  return GENRE_SCHOOL_RENAMES[genre]?.[school] ?? school;
}

/**
 * Returns the full school-rename map for a genre (for injection into AI prompts).
 */
export function getSchoolRenameMap(genre?: string): Record<string, string> {
  return (genre ? GENRE_SCHOOL_RENAMES[genre] : undefined) ?? {};
}
