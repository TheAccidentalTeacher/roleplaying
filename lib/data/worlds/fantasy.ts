import type { WorldDefinition } from '../world-types';

export const fantasyWorlds: WorldDefinition[] = [
  // ─── 1. CLASSIC HIGH FANTASY ───
  {
    id: 'classic-high-fantasy',
    name: 'Classic High Fantasy',
    icon: '🏰',
    genre: 'epic-fantasy',
    description: 'A traditional world of elves, dwarves, dragons, and ancient magic. Kingdoms rise and fall, prophecies unfold, and heroes are forged in the fires of destiny.',
    flavor: 'The age of legends is not over — it has been waiting for you.',
    originLabel: 'Race',
    classLabel: 'Class',
    origins: [
      {
        category: 'Common',
        origins: [
          { id: 'human', name: 'Human', description: 'Versatile and ambitious, found everywhere.', bonuses: '+1 to all abilities' },
          { id: 'elf', name: 'Elf', description: 'Graceful and long-lived, attuned to magic.', bonuses: '+2 DEX' },
          { id: 'dwarf', name: 'Dwarf', description: 'Sturdy and resilient, master crafters.', bonuses: '+2 CON' },
          { id: 'halfling', name: 'Halfling', description: 'Small but brave, lucky by nature.', bonuses: '+2 DEX' },
          { id: 'gnome', name: 'Gnome', description: 'Curious and inventive, naturally magical.', bonuses: '+2 INT' },
          { id: 'half-elf', name: 'Half-Elf', description: 'Charismatic diplomats of two worlds.', bonuses: '+2 CHA, +1 to two' },
          { id: 'half-orc', name: 'Half-Orc', description: 'Powerful warriors with indomitable will.', bonuses: '+2 STR, +1 CON' },
        ],
      },
      {
        category: 'Uncommon',
        origins: [
          { id: 'tiefling', name: 'Tiefling', description: 'Infernal heritage, feared and misunderstood.', bonuses: '+2 CHA, +1 INT' },
          { id: 'dragonborn', name: 'Dragonborn', description: 'Draconic warriors with elemental breath.', bonuses: '+2 STR, +1 CHA' },
          { id: 'orc', name: 'Orc', description: 'Fierce and proud, strength above all.', bonuses: '+2 STR, +1 CON' },
          { id: 'goliath', name: 'Goliath', description: 'Mountain-born giants, endurance personified.', bonuses: '+2 STR, +1 CON' },
          { id: 'firbolg', name: 'Firbolg', description: 'Gentle forest guardians with natural magic.', bonuses: '+2 WIS, +1 STR' },
          { id: 'aasimar', name: 'Aasimar', description: 'Celestial-touched, radiant protectors.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'genasi', name: 'Genasi', description: 'Elemental-blooded, embodying nature\'s forces.', bonuses: '+2 CON' },
        ],
      },
      {
        category: 'Exotic',
        origins: [
          { id: 'changeling', name: 'Changeling', description: 'Shapeshifters who can become anyone.', bonuses: '+2 CHA, +1 any' },
          { id: 'warforged', name: 'Warforged', description: 'Living constructs, built for war.', bonuses: '+2 CON, +1 any' },
          { id: 'tabaxi', name: 'Tabaxi', description: 'Feline wanderers driven by curiosity.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'kenku', name: 'Kenku', description: 'Cursed corvids who speak only in mimicry.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'lizardfolk', name: 'Lizardfolk', description: 'Cold-blooded survivalists, alien minds.', bonuses: '+2 CON, +1 WIS' },
          { id: 'satyr', name: 'Satyr', description: 'Fey revelers with magic resistance.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'fairy', name: 'Fairy', description: 'Tiny fey beings with innate flight.', bonuses: '+2 DEX, +1 CHA' },
        ],
      },
    ],
    classes: [
      { id: 'warrior', name: 'Warrior', icon: '⚔️', description: 'Master of weapons and armor, the front line of every battle.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'mage', name: 'Mage', icon: '🔮', description: 'Scholar of the arcane, wielding reality-bending spells.', hitDie: 'd6', primaryStat: 'INT', role: 'Damage / Control' },
      { id: 'rogue', name: 'Rogue', icon: '🗡️', description: 'Shadow specialist — stealth, precision, and cunning.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Utility' },
      { id: 'cleric', name: 'Cleric', icon: '✝️', description: 'Divine servant channeling healing and holy wrath.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Support' },
      { id: 'ranger', name: 'Ranger', icon: '🏹', description: 'Wilderness expert, tracker, and beast companion.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Scout' },
      { id: 'bard', name: 'Bard', icon: '🎵', description: 'Charismatic entertainer whose magic flows through music.', hitDie: 'd8', primaryStat: 'CHA', role: 'Support / Face' },
      { id: 'paladin', name: 'Paladin', icon: '🛡️', description: 'Holy warrior sworn to an oath, armored in faith.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Tank / Healer' },
      { id: 'druid', name: 'Druid', icon: '🌿', description: 'Nature\'s champion who can shift into beast forms.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Control' },
      { id: 'warlock', name: 'Warlock', icon: '👁️', description: 'Pact-bound channeler of eldritch power from beyond.', hitDie: 'd8', primaryStat: 'CHA', role: 'Damage / Utility' },
      { id: 'monk', name: 'Monk', icon: '👊', description: 'Martial artist whose body is the ultimate weapon.', hitDie: 'd8', primaryStat: 'DEX / WIS', role: 'Damage / Mobility' },
      { id: 'artificer', name: 'Artificer', icon: '⚙️', description: 'Inventor who infuses objects with magical power.', hitDie: 'd8', primaryStat: 'INT', role: 'Support / Utility' },
      { id: 'blood-mage', name: 'Blood Mage', icon: '🩸', description: 'Forbidden caster who pays for power with life force.', hitDie: 'd6', primaryStat: 'CON / INT', role: 'Damage / Risk' },
    ],
  },

  // ─── 2. DARK FANTASY ───
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy',
    icon: '🌑',
    genre: 'dark-fantasy',
    description: 'A grimdark world where hope is scarce, monsters are terrifying, and the line between hero and villain blurs. Inspired by The Witcher, Dark Souls, and Berserk.',
    flavor: 'In this world, the greatest monster might be the one you become.',
    originLabel: 'Lineage',
    classLabel: 'Class',
    origins: [
      {
        category: 'Mortal',
        origins: [
          { id: 'human', name: 'Human', description: 'Fragile but resourceful, clinging to survival.', bonuses: '+1 to all abilities' },
          { id: 'revenant', name: 'Revenant', description: 'Returned from death with a burning purpose.', bonuses: '+2 CON, +1 WIS' },
          { id: 'duskborn', name: 'Duskborn', description: 'Born under a cursed eclipse, touched by shadow.', bonuses: '+2 DEX, +1 INT' },
          { id: 'branded', name: 'Branded', description: 'Marked by a demon, carrying infernal stigmata.', bonuses: '+2 CHA, +1 CON' },
        ],
      },
      {
        category: 'Tainted',
        origins: [
          { id: 'dhampir', name: 'Dhampir', description: 'Half-vampire, torn between hunger and humanity.', bonuses: '+2 CHA, +1 STR' },
          { id: 'lycanthrope', name: 'Lycanthrope', description: 'Cursed with the beast within, fighting for control.', bonuses: '+2 STR, +1 CON' },
          { id: 'hollow', name: 'Hollow', description: 'An undying husk, slowly losing their memories.', bonuses: '+2 CON, +1 DEX' },
          { id: 'cambion', name: 'Cambion', description: 'Fiend-blooded, with hellfire in their veins.', bonuses: '+2 INT, +1 CHA' },
        ],
      },
      {
        category: 'Forsaken',
        origins: [
          { id: 'ghoul', name: 'Ghoul', description: 'Corpse-eater, shunned but devastatingly strong.', bonuses: '+2 STR, +1 CON' },
          { id: 'shade', name: 'Shade', description: 'A living shadow, phasing between worlds.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'fungal-host', name: 'Fungal Host', description: 'Symbiotic with parasitic spores, eerily calm.', bonuses: '+2 WIS, +1 CON' },
        ],
      },
    ],
    classes: [
      { id: 'witcher', name: 'Witcher', icon: '🐺', description: 'Mutated monster hunter, alchemist and swordsman.', hitDie: 'd10', primaryStat: 'DEX / CON', role: 'Damage / Hunter' },
      { id: 'grave-knight', name: 'Grave Knight', icon: '💀', description: 'Undying warrior bound to endless battle.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'hexblade', name: 'Hexblade', icon: '🗡️', description: 'Cursed swordsman whose blade feeds on souls.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Damage / Drain' },
      { id: 'plague-doctor', name: 'Plague Doctor', icon: '🎭', description: 'Healer who weaponizes disease and poison.', hitDie: 'd8', primaryStat: 'INT / WIS', role: 'Healer / Debuff' },
      { id: 'inquisitor', name: 'Inquisitor', icon: '🔥', description: 'Holy executioner who purges corruption.', hitDie: 'd10', primaryStat: 'WIS / STR', role: 'Tank / Anti-magic' },
      { id: 'blood-sorcerer', name: 'Blood Sorcerer', icon: '🩸', description: 'Casts spells fueled by pain and sacrifice.', hitDie: 'd6', primaryStat: 'CON / INT', role: 'Damage / Risk' },
      { id: 'stalker', name: 'Stalker', icon: '🌙', description: 'Shadow assassin, killing from the darkness.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Stealth' },
      { id: 'flagellant', name: 'Flagellant', icon: '⛓️', description: 'Religious zealot who grows stronger through pain.', hitDie: 'd12', primaryStat: 'CON / WIS', role: 'Tank / Berserker' },
      { id: 'occultist', name: 'Occultist', icon: '👁️', description: 'Scholar of forbidden lore, risking sanity for power.', hitDie: 'd6', primaryStat: 'INT', role: 'Control / Utility' },
      { id: 'beast-tamer', name: 'Beast Tamer', icon: '🐍', description: 'Bonds with monstrous creatures others would flee.', hitDie: 'd8', primaryStat: 'WIS / CHA', role: 'Summon / Scout' },
    ],
  },

  // ─── 3. SWORD & SORCERY ───
  {
    id: 'sword-and-sorcery',
    name: 'Sword & Sorcery',
    icon: '⚔️',
    genre: 'epic-fantasy',
    description: 'A raw, primal world of barbarian kings, scheming sorcerers, and ancient ruins dripping with treasure. Inspired by Conan, Fafhrd, and Elric.',
    flavor: 'Civilizations are a thin veneer over savage wilderness.',
    originLabel: 'Heritage',
    classLabel: 'Class',
    origins: [
      {
        category: 'Civilized',
        origins: [
          { id: 'city-dweller', name: 'City Dweller', description: 'Born in the great cities, educated and cunning.', bonuses: '+2 INT, +1 CHA' },
          { id: 'merchant-blood', name: 'Merchant Blood', description: 'From a trading dynasty, comfortable with coin.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'noble-born', name: 'Noble Born', description: 'Raised in court, trained in politics and war.', bonuses: '+2 CHA, +1 STR' },
        ],
      },
      {
        category: 'Frontier',
        origins: [
          { id: 'barbarian-tribe', name: 'Barbarian Tribe', description: 'From the wild north, hardened by ice and war.', bonuses: '+2 STR, +1 CON' },
          { id: 'desert-nomad', name: 'Desert Nomad', description: 'Sand-born wanderer, resourceful and tough.', bonuses: '+2 CON, +1 WIS' },
          { id: 'jungle-born', name: 'Jungle Born', description: 'Raised in steaming jungles among ruins.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'steppe-rider', name: 'Steppe Rider', description: 'Horse lord of the endless grasslands.', bonuses: '+2 DEX, +1 CON' },
        ],
      },
      {
        category: 'Outsider',
        origins: [
          { id: 'serpent-blood', name: 'Serpent Blood', description: 'Descendant of an ancient scaled empire.', bonuses: '+2 INT, +1 DEX' },
          { id: 'sea-raider', name: 'Sea Raider', description: 'Viking-like plunderer of coastal kingdoms.', bonuses: '+2 STR, +1 DEX' },
          { id: 'slave-freed', name: 'Freed Slave', description: 'Escaped bondage, forged in suffering.', bonuses: '+2 CON, +1 STR' },
        ],
      },
    ],
    classes: [
      { id: 'barbarian', name: 'Barbarian', icon: '🪓', description: 'Raging warrior of the wilds, unstoppable force.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Damage / Tank' },
      { id: 'sorcerer', name: 'Sorcerer', icon: '🔮', description: 'Wielder of dark, corrupting magic — power at a price.', hitDie: 'd6', primaryStat: 'INT', role: 'Damage / Control' },
      { id: 'thief', name: 'Thief', icon: '🗡️', description: 'Nimble burglar and acrobat, living by wit.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Utility' },
      { id: 'gladiator', name: 'Gladiator', icon: '🏛️', description: 'Arena-forged fighter, master of spectacle.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Damage / Tank' },
      { id: 'shaman', name: 'Shaman', icon: '🦴', description: 'Spirit-caller and healer of the tribal lands.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Support' },
      { id: 'corsair', name: 'Corsair', icon: '🏴‍☠️', description: 'Pirate captain, duellist, and swashbuckler.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Damage / Face' },
      { id: 'berserker', name: 'Berserker', icon: '🐻', description: 'Enters a blood fury, feeling no pain until the battle ends.', hitDie: 'd12', primaryStat: 'STR', role: 'Damage / Risk' },
      { id: 'assassin', name: 'Assassin', icon: '🌙', description: 'Silent killer, master of poisons and disguise.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Damage / Stealth' },
    ],
  },
];
