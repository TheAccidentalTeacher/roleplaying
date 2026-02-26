import type { WorldDefinition } from '../world-types';

export const fantasyExtWorlds: WorldDefinition[] = [
  // ─── 4. STEAMPUNK FANTASY ───
  {
    id: 'steampunk-fantasy',
    name: 'Steampunk Fantasy',
    icon: '⚙️',
    genre: 'steampunk',
    description: 'A world where magic and steam technology intertwine. Airships cruise over clockwork cities, and inventors rival wizards for influence.',
    flavor: 'The gears of progress grind against the old enchantments.',
    originLabel: 'Race',
    classLabel: 'Class',
    origins: [
      {
        category: 'Common',
        origins: [
          { id: 'human', name: 'Human', description: 'Innovators and empire-builders, driving the industrial age.', bonuses: '+1 to all abilities' },
          { id: 'dwarf', name: 'Dwarf', description: 'Master engineers who built the first steam engines.', bonuses: '+2 CON, +1 INT' },
          { id: 'gnome', name: 'Gnome', description: 'Brilliant tinkerers obsessed with miniaturization.', bonuses: '+2 INT, +1 DEX' },
          { id: 'elf', name: 'Elf', description: 'Magic traditionalists resistant to industrialization.', bonuses: '+2 DEX, +1 WIS' },
        ],
      },
      {
        category: 'Constructed',
        origins: [
          { id: 'automaton', name: 'Automaton', description: 'Clockwork being with developing sentience.', bonuses: '+2 CON, +1 INT' },
          { id: 'steam-golem', name: 'Steam Golem', description: 'Heavy industrial construct, immensely strong.', bonuses: '+2 STR, +1 CON' },
          { id: 'aether-sprite', name: 'Aether Sprite', description: 'Magical energy given physical form by a machine.', bonuses: '+2 CHA, +1 DEX' },
        ],
      },
      {
        category: 'Hybrid',
        origins: [
          { id: 'gearling', name: 'Gearling', description: 'Half-organic, half-clockwork — a fusion experiment.', bonuses: '+2 INT, +1 CON' },
          { id: 'smoke-elf', name: 'Smoke Elf', description: 'Elven refugees adapted to industrial smog.', bonuses: '+2 DEX, +1 CON' },
          { id: 'goblin', name: 'Goblin', description: 'Junk scavengers who build genius from scraps.', bonuses: '+2 DEX, +1 INT' },
        ],
      },
    ],
    classes: [
      { id: 'artificer', name: 'Artificer', icon: '⚙️', description: 'Master inventor creating wondrous steam-powered devices.', hitDie: 'd8', primaryStat: 'INT', role: 'Support / Utility' },
      { id: 'gunslinger', name: 'Gunslinger', icon: '🔫', description: 'Sharpshooter wielding custom-built firearms.', hitDie: 'd10', primaryStat: 'DEX', role: 'Damage / Range' },
      { id: 'aeronaut', name: 'Aeronaut', icon: '🎈', description: 'Airship pilot and aerial combatant.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Mobility / Scout' },
      { id: 'arcanist', name: 'Arcanist', icon: '🔮', description: 'Traditional mage studying the old ways.', hitDie: 'd6', primaryStat: 'INT', role: 'Damage / Control' },
      { id: 'ironclad', name: 'Ironclad', icon: '🛡️', description: 'Heavy armor specialist in mechanized battle suits.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank' },
      { id: 'thief-engineer', name: 'Thief-Engineer', icon: '🔧', description: 'Cat burglar with custom gadgets and lockpicks.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Utility / Stealth' },
      { id: 'alchemist', name: 'Alchemist', icon: '⚗️', description: 'Potion brewer and chemical weapons expert.', hitDie: 'd8', primaryStat: 'INT / WIS', role: 'Support / Damage' },
      { id: 'galvanist', name: 'Galvanist', icon: '⚡', description: 'Harnesses electricity and lightning magic.', hitDie: 'd8', primaryStat: 'INT / CON', role: 'Damage / Control' },
    ],
  },

  // ─── 5. MYTHIC AGE ───
  {
    id: 'mythic-age',
    name: 'Mythic Age',
    icon: '🏛️',
    genre: 'mythological',
    description: 'Gods walk the earth, demigods perform labors, and mortals can ascend to legend. Inspired by Greek, Norse, and Egyptian mythology.',
    flavor: 'The gods are watching — will you earn their favor or their wrath?',
    originLabel: 'Lineage',
    classLabel: 'Calling',
    origins: [
      {
        category: 'Mortal',
        origins: [
          { id: 'mortal-human', name: 'Mortal', description: 'Purely human, relying on will and cunning alone.', bonuses: '+1 to all abilities' },
          { id: 'amazon', name: 'Amazon', description: 'Warrior from an all-female warrior society.', bonuses: '+2 STR, +1 DEX' },
          { id: 'spartan', name: 'Spartan', description: 'Raised from birth for war, disciplined beyond measure.', bonuses: '+2 CON, +1 STR' },
        ],
      },
      {
        category: 'Divine Blood',
        origins: [
          { id: 'demigod', name: 'Demigod', description: 'Child of a god and a mortal, destined for greatness.', bonuses: '+2 to highest, +1 CHA' },
          { id: 'nymph-born', name: 'Nymph-Born', description: 'Descended from nature spirits, ethereally beautiful.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'titan-blood', name: 'Titan-Blooded', description: 'Carrying the blood of the primordial titans.', bonuses: '+2 STR, +1 CON' },
          { id: 'muse-touched', name: 'Muse-Touched', description: 'Blessed by a muse with supernatural creativity.', bonuses: '+2 CHA, +1 INT' },
        ],
      },
      {
        category: 'Mythic Kin',
        origins: [
          { id: 'centaur', name: 'Centaur', description: 'Half-horse nomad of the wild grasslands.', bonuses: '+2 STR, +1 WIS' },
          { id: 'satyr', name: 'Satyr', description: 'Goat-legged reveler with magic resistance.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'minotaur', name: 'Minotaur', description: 'Bull-headed labyrinth dweller, immensely strong.', bonuses: '+2 STR, +1 CON' },
          { id: 'harpy-kin', name: 'Harpy-Kin', description: 'Winged and sharp-clawed, dwelling on sea cliffs.', bonuses: '+2 DEX, +1 CHA' },
        ],
      },
    ],
    classes: [
      { id: 'champion', name: 'Champion', icon: '🏛️', description: 'Chosen warrior of a patron god.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Damage / Tank' },
      { id: 'oracle', name: 'Oracle', icon: '👁️', description: 'Seer gifted with prophecy and divine magic.', hitDie: 'd6', primaryStat: 'WIS', role: 'Healer / Control' },
      { id: 'hero', name: 'Hero', icon: '⚔️', description: 'Legendary warrior performing impossible labors.', hitDie: 'd12', primaryStat: 'STR', role: 'Damage / Tank' },
      { id: 'philosopher', name: 'Philosopher', icon: '📜', description: 'Thinker who bends reality through rhetoric and logic.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Support / Control' },
      { id: 'priestess', name: 'Priest/Priestess', icon: '🔥', description: 'Temple servant channeling their deity\'s power.', hitDie: 'd8', primaryStat: 'WIS / CHA', role: 'Healer / Support' },
      { id: 'trickster', name: 'Trickster', icon: '🦊', description: 'Cunning shapeshifter in the mold of Loki or Hermes.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Utility / Face' },
      { id: 'beastmaster', name: 'Beastmaster', icon: '🦁', description: 'Bonds with mythical creatures as battle companions.', hitDie: 'd10', primaryStat: 'WIS / STR', role: 'Summon / Damage' },
      { id: 'fury', name: 'Fury', icon: '💢', description: 'Berserker channeling divine rage in battle.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Damage / Berserker' },
    ],
  },

  // ─── 6. PLANAR / COSMIC FANTASY ───
  {
    id: 'planar-world',
    name: 'Planar Cosmos',
    icon: '🌌',
    genre: 'epic-fantasy',
    description: 'Reality is layered — heavens, hells, fey wilds, shadow realms, and the far realm all bleed into each other. You travel between planes of existence.',
    flavor: 'Step through the veil. Infinite realities await.',
    originLabel: 'Origin',
    classLabel: 'Class',
    origins: [
      {
        category: 'Material',
        origins: [
          { id: 'human', name: 'Human', description: 'From the material plane, remarkably adaptable.', bonuses: '+1 to all abilities' },
          { id: 'elf', name: 'Elf', description: 'Fey-touched, with one foot in the spirit world.', bonuses: '+2 DEX, +1 WIS' },
        ],
      },
      {
        category: 'Planar',
        origins: [
          { id: 'celestial', name: 'Celestial', description: 'Born of the upper planes, radiant and just.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'fiend-spawn', name: 'Fiend-Spawn', description: 'Infernal or abyssal origin, dangerous and cunning.', bonuses: '+2 CHA, +1 INT' },
          { id: 'elemental', name: 'Elemental', description: 'Made of fire, water, earth, or air given form.', bonuses: '+2 CON, +1 STR' },
          { id: 'fey-soul', name: 'Fey Soul', description: 'From the Feywild, whimsical and strange.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'shadow-born', name: 'Shadow-Born', description: 'From the Shadowfell, cold and melancholy.', bonuses: '+2 DEX, +1 WIS' },
        ],
      },
      {
        category: 'Far Realm',
        origins: [
          { id: 'aberrant', name: 'Aberrant', description: 'Touched by the Far Realm, alien and unsettling.', bonuses: '+2 INT, +1 CON' },
          { id: 'void-walker', name: 'Void Walker', description: 'From the space between planes, existing in all and none.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'dream-born', name: 'Dream-Born', description: 'Manifested from the collective unconscious.', bonuses: '+2 CHA, +1 INT' },
        ],
      },
    ],
    classes: [
      { id: 'planeswalker', name: 'Planeswalker', icon: '🌀', description: 'Traveler between realities who bends dimensional barriers.', hitDie: 'd8', primaryStat: 'INT / WIS', role: 'Utility / Control' },
      { id: 'celestial-knight', name: 'Celestial Knight', icon: '👼', description: 'Holy warrior empowered by the upper planes.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Tank / Healer' },
      { id: 'void-mage', name: 'Void Mage', icon: '🕳️', description: 'Draws power from the spaces between realities.', hitDie: 'd6', primaryStat: 'INT', role: 'Damage / Control' },
      { id: 'soul-warden', name: 'Soul Warden', icon: '✨', description: 'Guards and guides souls between planes.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Support' },
      { id: 'chaos-agent', name: 'Chaos Agent', icon: '🎲', description: 'Harnesses raw chaos energy — unpredictable but devastating.', hitDie: 'd8', primaryStat: 'CHA', role: 'Damage / Wild' },
      { id: 'nightmare-hunter', name: 'Nightmare Hunter', icon: '🌙', description: 'Tracks and destroys aberrations across planes.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Scout' },
      { id: 'sigil-scribe', name: 'Sigil Scribe', icon: '📜', description: 'Creates magical wards and portals through rune-craft.', hitDie: 'd6', primaryStat: 'INT / DEX', role: 'Support / Utility' },
      { id: 'elemental-avatar', name: 'Elemental Avatar', icon: '🔥', description: 'Channels the raw power of an elemental plane.', hitDie: 'd10', primaryStat: 'CON / WIS', role: 'Damage / Tank' },
    ],
  },
];
