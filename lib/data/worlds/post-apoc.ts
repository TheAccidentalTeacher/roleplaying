import type { WorldDefinition } from '../world-types';

export const postApocWorlds: WorldDefinition[] = [
  // ─── 10. ZOMBIE APOCALYPSE ───
  {
    id: 'zombie-apocalypse',
    name: 'Zombie Apocalypse',
    icon: '🧟',
    genre: 'survival',
    description: 'The dead walk. Civilization collapsed. Small bands of survivors fight the horde and each other for dwindling resources. Inspired by The Walking Dead, 28 Days Later, and World War Z.',
    flavor: 'The living are more dangerous than the dead.',
    originLabel: 'Origin',
    classLabel: 'Role',
    origins: [
      {
        category: 'Background',
        origins: [
          { id: 'suburban', name: 'Suburbanite', description: 'Regular person thrust into hell. Adaptable.', bonuses: '+1 to all abilities' },
          { id: 'military-vet', name: 'Military Veteran', description: 'Served before the fall, knows combat and discipline.', bonuses: '+2 STR, +1 CON' },
          { id: 'first-responder', name: 'First Responder', description: 'Former EMT, firefighter, or paramedic.', bonuses: '+2 WIS, +1 CON' },
          { id: 'rural-survivor', name: 'Rural Survivor', description: 'Farm kid who grew up hunting and fixing things.', bonuses: '+2 CON, +1 WIS' },
        ],
      },
      {
        category: 'Specialist',
        origins: [
          { id: 'doctor', name: 'Doctor', description: 'Medical professional — invaluable and knows it.', bonuses: '+2 INT, +1 WIS' },
          { id: 'mechanic', name: 'Mechanic', description: 'Can fix anything with enough duct tape and will.', bonuses: '+2 INT, +1 DEX' },
          { id: 'cop', name: 'Former Cop', description: 'Law enforcement survivor, skilled with firearms.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'prepper', name: 'Prepper', description: 'Was ready for the end. Has supplies and paranoia.', bonuses: '+2 WIS, +1 INT' },
        ],
      },
      {
        category: 'Hardened',
        origins: [
          { id: 'convict', name: 'Convict', description: 'Was in prison when it happened. Survived the riot.', bonuses: '+2 STR, +1 DEX' },
          { id: 'feral-child', name: 'Feral Child', description: 'Grew up after the fall, never knew the old world.', bonuses: '+2 DEX, +1 CON' },
          { id: 'cult-survivor', name: 'Cult Survivor', description: 'Escaped a post-collapse religious commune.', bonuses: '+2 CHA, +1 WIS' },
        ],
      },
    ],
    classes: [
      { id: 'scavenger', name: 'Scavenger', icon: '🎒', description: 'Expert at finding supplies in the ruins.', hitDie: 'd8', primaryStat: 'DEX / WIS', role: 'Utility / Scout' },
      { id: 'protector', name: 'Protector', icon: '🛡️', description: 'Frontline defender keeping the group safe.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank' },
      { id: 'marksman', name: 'Marksman', icon: '🎯', description: 'Sharpshooter — every bullet counts.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Range' },
      { id: 'leader', name: 'Leader', icon: '📢', description: 'The one who holds the group together.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Support / Face' },
      { id: 'medic', name: 'Medic', icon: '🩹', description: 'Keeps everyone alive with limited supplies.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer' },
      { id: 'builder', name: 'Builder', icon: '🔨', description: 'Fortifies camps, builds traps, repairs vehicles.', hitDie: 'd10', primaryStat: 'INT / STR', role: 'Utility / Defense' },
      { id: 'runner', name: 'Runner', icon: '🏃', description: 'Fast and quiet, slips through zombie hordes.', hitDie: 'd8', primaryStat: 'DEX / CON', role: 'Scout / Mobility' },
      { id: 'enforcer', name: 'Enforcer', icon: '💪', description: 'Melee powerhouse who clears paths with brute strength.', hitDie: 'd12', primaryStat: 'STR', role: 'Damage / Tank' },
    ],
  },

  // ─── 11. NUCLEAR POST-APOCALYPSE ───
  {
    id: 'nuclear-post-apoc',
    name: 'Nuclear Wasteland',
    icon: '☢️',
    genre: 'post-apocalypse',
    description: 'The bombs fell decades ago. Now, irradiated wastelands stretch between fortified settlements, mutant creatures roam, and factions war over pre-war tech.',
    flavor: 'War never changes, but the survivors sure do.',
    originLabel: 'Stock',
    classLabel: 'Path',
    origins: [
      {
        category: 'Vault / Bunker',
        origins: [
          { id: 'vault-dweller', name: 'Vault Dweller', description: 'Raised in an underground bunker, educated but sheltered.', bonuses: '+2 INT, +1 CHA' },
          { id: 'vault-reject', name: 'Vault Reject', description: 'Cast out of the bunker, hardened by betrayal.', bonuses: '+2 CON, +1 WIS' },
        ],
      },
      {
        category: 'Wastelander',
        origins: [
          { id: 'wastelander', name: 'Wastelander', description: 'Born in the irradiated wilds, tough as nails.', bonuses: '+2 CON, +1 STR' },
          { id: 'tribal', name: 'Tribal', description: 'From a primitive post-war tribe with oral traditions.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'caravan-born', name: 'Caravan Born', description: 'Grew up on the trade routes between settlements.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'raider-turned', name: 'Reformed Raider', description: 'Left the raider life, but the instincts remain.', bonuses: '+2 STR, +1 DEX' },
        ],
      },
      {
        category: 'Mutant',
        origins: [
          { id: 'ghoul', name: 'Ghoul', description: 'Irradiated human with rotting flesh but near-immortality.', bonuses: '+2 CON, +1 WIS', traits: ['Radiation Immune'] },
          { id: 'super-mutant', name: 'Super Mutant', description: 'FEV-altered giant, immensely strong but ostracized.', bonuses: '+3 STR, +1 CON', traits: ['Radiation Resist'] },
          { id: 'psionic-mutant', name: 'Psionic Mutant', description: 'Radiation awakened dormant psychic abilities.', bonuses: '+2 WIS, +1 INT', traits: ['Telepathy'] },
        ],
      },
    ],
    classes: [
      { id: 'wanderer', name: 'Wanderer', icon: '🗺️', description: 'Jack-of-all-trades who roams the wastes alone.', hitDie: 'd8', primaryStat: 'WIS / DEX', role: 'Utility / Scout' },
      { id: 'gunslinger', name: 'Gunslinger', icon: '🔫', description: 'Quick draw and dead aim with any firearm.', hitDie: 'd10', primaryStat: 'DEX', role: 'Damage / Range' },
      { id: 'scrapper', name: 'Scrapper', icon: '🔧', description: 'Salvages pre-war tech and builds improvised weapons.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Utility / Craft' },
      { id: 'mutant-brawler', name: 'Mutant Brawler', icon: '💪', description: 'Radiation-enhanced fighter who thrives in melee.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'wasteland-doc', name: 'Wasteland Doc', icon: '💊', description: 'Healer using scavenged medical supplies and rad-away.', hitDie: 'd8', primaryStat: 'INT / WIS', role: 'Healer' },
      { id: 'ranger', name: 'Ranger', icon: '⭐', description: 'Elite peacekeeper patrolling the wastes.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Scout' },
      { id: 'merchant-prince', name: 'Merchant Prince', icon: '💰', description: 'Trade baron who deals in caps and influence.', hitDie: 'd6', primaryStat: 'CHA / INT', role: 'Face / Support' },
      { id: 'raider-warlord', name: 'Raider Warlord', icon: '💀', description: 'Rules through fear, charisma, and ultra-violence.', hitDie: 'd10', primaryStat: 'STR / CHA', role: 'Damage / Face' },
    ],
  },

  // ─── 12. CLIMATE COLLAPSE ───
  {
    id: 'climate-collapse',
    name: 'Drowned World',
    icon: '🌊',
    genre: 'post-apocalypse',
    description: 'Sea levels rose, superstorms rage, and what remains of civilization clings to highlands and floating cities. Resource wars, eco-pirates, and drowned ruins define the age.',
    flavor: 'The ocean took everything. What rises from the deep is worse.',
    originLabel: 'Origin',
    classLabel: 'Role',
    origins: [
      {
        category: 'Highland',
        origins: [
          { id: 'hilltop-settler', name: 'Hilltop Settler', description: 'Lives in mountain communities above the flood line.', bonuses: '+2 CON, +1 WIS' },
          { id: 'bunker-born', name: 'Bunker Born', description: 'From a sealed government survival facility.', bonuses: '+2 INT, +1 CHA' },
          { id: 'nomad', name: 'Nomad', description: 'Wanders between highland camps, trading and scavenging.', bonuses: '+2 DEX, +1 CON' },
        ],
      },
      {
        category: 'Coastal / Sea',
        origins: [
          { id: 'raft-dweller', name: 'Raft Dweller', description: 'Born on a floating junk-city, expert swimmer.', bonuses: '+2 DEX, +1 STR' },
          { id: 'diver', name: 'Diver', description: 'Salvages sunken cities for pre-flood tech.', bonuses: '+2 CON, +1 DEX' },
          { id: 'pirate', name: 'Sea Pirate', description: 'Raids supply ships and coastal settlements.', bonuses: '+2 STR, +1 CHA' },
        ],
      },
      {
        category: 'Evolved',
        origins: [
          { id: 'storm-child', name: 'Storm Child', description: 'Born during a superstorm, seemingly weather-touched.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'aqua-adapted', name: 'Aqua-Adapted', description: 'Gene-modded for underwater survival.', bonuses: '+2 CON, +1 STR', traits: ['Water Breathing'] },
          { id: 'fungal-farmer', name: 'Fungal Farmer', description: 'Grows bio-luminescent crops in flooded tunnels.', bonuses: '+2 WIS, +1 INT' },
        ],
      },
    ],
    classes: [
      { id: 'salvage-diver', name: 'Salvage Diver', icon: '🤿', description: 'Plunges into drowned ruins to recover lost technology.', hitDie: 'd10', primaryStat: 'CON / DEX', role: 'Utility / Scout' },
      { id: 'storm-sailor', name: 'Storm Sailor', icon: '⛵', description: 'Navigates lethal superstorms in jury-rigged boats.', hitDie: 'd8', primaryStat: 'DEX / WIS', role: 'Mobility / Scout' },
      { id: 'eco-warrior', name: 'Eco-Warrior', icon: '🌿', description: 'Fights to protect remaining ecosystems and water sources.', hitDie: 'd10', primaryStat: 'STR / WIS', role: 'Tank / Support' },
      { id: 'water-chemist', name: 'Water Chemist', icon: '⚗️', description: 'Purifies water, brews medicines, creates fuel.', hitDie: 'd6', primaryStat: 'INT', role: 'Support / Utility' },
      { id: 'enforcer', name: 'Enforcer', icon: '🔫', description: 'Armed guard protecting settlements from raiders.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'tide-reader', name: 'Tide Reader', icon: '🌙', description: 'Predicts weather, tides, and seasonal changes.', hitDie: 'd6', primaryStat: 'WIS / INT', role: 'Support / Scout' },
      { id: 'raft-mechanic', name: 'Raft Mechanic', icon: '🔧', description: 'Keeps floating cities from sinking, repairs everything.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Utility' },
      { id: 'corsair', name: 'Corsair', icon: '🏴‍☠️', description: 'Sea raider and naval combatant.', hitDie: 'd10', primaryStat: 'DEX / STR', role: 'Damage / Mobility' },
    ],
  },
];
