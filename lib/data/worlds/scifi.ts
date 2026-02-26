import type { WorldDefinition } from '../world-types';

export const scifiWorlds: WorldDefinition[] = [
  // ─── 7. SPACE OPERA ───
  {
    id: 'space-opera',
    name: 'Space Opera',
    icon: '🚀',
    genre: 'sci-fi',
    description: 'A sprawling galactic civilization with faster-than-light travel, alien species, and interstellar politics. Inspired by Star Wars, Mass Effect, and Dune.',
    flavor: 'The galaxy is vast — and it remembers everything.',
    originLabel: 'Species',
    classLabel: 'Role',
    origins: [
      {
        category: 'Core Species',
        origins: [
          { id: 'human', name: 'Human', description: 'The most widespread species in the galaxy.', bonuses: '+1 to all abilities' },
          { id: 'sylvari', name: 'Sylvari', description: 'Elegant, long-lived aliens with psionic gifts.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'khorath', name: 'Khorath', description: 'Reptilian warriors with natural armor plating.', bonuses: '+2 STR, +1 CON' },
          { id: 'nexari', name: 'Nexari', description: 'Four-armed insectoid engineers, brilliant builders.', bonuses: '+2 INT, +1 DEX' },
        ],
      },
      {
        category: 'Frontier Species',
        origins: [
          { id: 'drell', name: 'Drell', description: 'Amphibian species with perfect memory recall.', bonuses: '+2 DEX, +1 INT' },
          { id: 'gorvath', name: 'Gorvath', description: 'Massive silicon-based lifeforms, slow but immovable.', bonuses: '+2 CON, +1 STR' },
          { id: 'echo', name: 'Echo', description: 'Energy beings who inhabit synthetic shells.', bonuses: '+2 INT, +1 WIS' },
          { id: 'vren', name: 'Vren', description: 'Gas-giant dwellers adapted to extreme pressure.', bonuses: '+2 CON, +1 WIS' },
        ],
      },
      {
        category: 'Synthetic',
        origins: [
          { id: 'android', name: 'Android', description: 'Human-form AI with full rights — or fighting for them.', bonuses: '+2 INT, +1 CON' },
          { id: 'uplifted', name: 'Uplifted', description: 'Genetically enhanced animal species given sapience.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'clone', name: 'Clone', description: 'Mass-produced human variant, seeking identity.', bonuses: '+2 to any one, +1 any' },
        ],
      },
    ],
    classes: [
      { id: 'soldier', name: 'Soldier', icon: '🎖️', description: 'Career military combatant with heavy weapons training.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'pilot', name: 'Pilot', icon: '🛸', description: 'Elite starship and vehicle operator.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Mobility / Scout' },
      { id: 'engineer', name: 'Engineer', icon: '🔧', description: 'Tech specialist who repairs, hacks, and builds.', hitDie: 'd8', primaryStat: 'INT', role: 'Support / Utility' },
      { id: 'operative', name: 'Operative', icon: '🕵️', description: 'Covert agent skilled in infiltration and assassination.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Damage / Stealth' },
      { id: 'medic', name: 'Medic', icon: '💊', description: 'Combat medic and bio-science specialist.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer / Support' },
      { id: 'psion', name: 'Psion', icon: '🧠', description: 'Telekinetic and telepathic mind warrior.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Control / Utility' },
      { id: 'bounty-hunter', name: 'Bounty Hunter', icon: '🎯', description: 'Independent tracker who always gets their mark.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Hunter' },
      { id: 'diplomat', name: 'Diplomat', icon: '🤝', description: 'Silver-tongued negotiator and political operator.', hitDie: 'd6', primaryStat: 'CHA / INT', role: 'Face / Support' },
      { id: 'vanguard', name: 'Vanguard', icon: '🛡️', description: 'Heavy assault specialist with kinetic barriers.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank' },
    ],
  },

  // ─── 8. CYBERPUNK ───
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🌃',
    genre: 'cyberpunk',
    description: 'Neon-soaked megacities ruled by corporations. The streets are chrome, the air is toxic, and everyone has a price. Inspired by Neuromancer, Blade Runner, and Cyberpunk 2077.',
    flavor: 'High tech, low life. The future is here, and it burns.',
    originLabel: 'Origin',
    classLabel: 'Role',
    origins: [
      {
        category: 'Street',
        origins: [
          { id: 'street-kid', name: 'Street Kid', description: 'Born in the gutter, raised on hustle and chrome.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'corpo-defector', name: 'Corpo Defector', description: 'Burned your corporate bridges, kept the implants.', bonuses: '+2 INT, +1 CHA' },
          { id: 'nomad', name: 'Nomad', description: 'Road warrior from the wasteland clans.', bonuses: '+2 CON, +1 STR' },
          { id: 'slum-born', name: 'Slum Born', description: 'Grew up in the megablock stacks, scrapping to survive.', bonuses: '+2 CON, +1 DEX' },
        ],
      },
      {
        category: 'Modified',
        origins: [
          { id: 'full-borg', name: 'Full Borg', description: 'Almost entirely cybernetic, barely human.', bonuses: '+2 STR, +1 CON' },
          { id: 'netborn', name: 'Netborn', description: 'Grew up jacked in, more comfortable in cyberspace.', bonuses: '+2 INT, +1 WIS' },
          { id: 'biomod', name: 'Biomod', description: 'Gene-edited and bio-enhanced, organic perfection.', bonuses: '+2 to any one, +1 DEX' },
        ],
      },
      {
        category: 'Outsider',
        origins: [
          { id: 'off-worlder', name: 'Off-Worlder', description: 'Arrived from an orbital colony or Mars settlement.', bonuses: '+2 INT, +1 CON' },
          { id: 'ai-host', name: 'AI Host', description: 'A rogue AI inhabiting a human body.', bonuses: '+2 INT, +1 WIS' },
          { id: 'purist', name: 'Purist', description: 'Zero cybernetics by choice — relying on pure humanity.', bonuses: '+2 WIS, +1 CHA' },
        ],
      },
    ],
    classes: [
      { id: 'netrunner', name: 'Netrunner', icon: '💻', description: 'Elite hacker who jacks into cyberspace to crack ICE.', hitDie: 'd6', primaryStat: 'INT', role: 'Utility / Control' },
      { id: 'solo', name: 'Solo', icon: '🔫', description: 'Combat specialist, the best gun money can buy.', hitDie: 'd10', primaryStat: 'DEX / STR', role: 'Damage' },
      { id: 'techie', name: 'Techie', icon: '🔧', description: 'Hardware genius, builds and modifies cyberware.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Support / Utility' },
      { id: 'fixer', name: 'Fixer', icon: '📱', description: 'Connected dealmaker, knows everyone and everything.', hitDie: 'd8', primaryStat: 'CHA / INT', role: 'Face / Support' },
      { id: 'rockerboy', name: 'Rockerboy', icon: '🎸', description: 'Charismatic rebel using art as a weapon against the corps.', hitDie: 'd8', primaryStat: 'CHA', role: 'Support / Face' },
      { id: 'medtech', name: 'Medtech', icon: '💉', description: 'Street surgeon and combat medic, keeping you alive.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer' },
      { id: 'exec', name: 'Exec', icon: '💼', description: 'Corporate power player leveraging resources and authority.', hitDie: 'd6', primaryStat: 'CHA / INT', role: 'Face / Control' },
      { id: 'nomad-rider', name: 'Nomad Rider', icon: '🏍️', description: 'Wasteland vehicle expert and highway warrior.', hitDie: 'd10', primaryStat: 'DEX / CON', role: 'Mobility / Damage' },
    ],
  },

  // ─── 9. HARD SCI-FI ───
  {
    id: 'hard-scifi',
    name: 'Hard Sci-Fi',
    icon: '🛰️',
    genre: 'sci-fi',
    description: 'Realistic space exploration with no FTL, no magic, just physics, engineering, and human determination. Inspired by The Expanse, The Martian, and Alien.',
    flavor: 'Space is not your friend. It is trying to kill you.',
    originLabel: 'Origin',
    classLabel: 'Specialization',
    origins: [
      {
        category: 'Inner System',
        origins: [
          { id: 'earther', name: 'Earther', description: 'Born on Earth, strong bones but naive about space.', bonuses: '+2 STR, +1 CHA' },
          { id: 'martian', name: 'Martian', description: 'Born in Mars colonies, tall and thin from low-g.', bonuses: '+2 INT, +1 DEX' },
          { id: 'lunarian', name: 'Lunarian', description: 'Lunar colonist, graceful in low gravity.', bonuses: '+2 DEX, +1 INT' },
        ],
      },
      {
        category: 'Outer System',
        origins: [
          { id: 'belter', name: 'Belter', description: 'Born in the asteroid belt, adapted to microgravity.', bonuses: '+2 DEX, +1 CON' },
          { id: 'titan-colonist', name: 'Titan Colonist', description: 'From Saturn\'s moon, hardy and resourceful.', bonuses: '+2 CON, +1 WIS' },
          { id: 'station-dweller', name: 'Station Dweller', description: 'Born on a space station, never touched a planet.', bonuses: '+2 INT, +1 DEX' },
        ],
      },
      {
        category: 'Edge',
        origins: [
          { id: 'gen-ship-born', name: 'Gen-Ship Born', description: 'Born on a generation ship, never seen the sun.', bonuses: '+2 WIS, +1 CON' },
          { id: 'cryo-revived', name: 'Cryo-Revived', description: 'Woken from centuries of cryosleep, a relic of the past.', bonuses: '+2 CHA, +1 any' },
          { id: 'vat-grown', name: 'Vat-Grown', description: 'Purpose-bred in a growth tank for specific traits.', bonuses: '+2 to any one, +1 any' },
        ],
      },
    ],
    classes: [
      { id: 'pilot', name: 'Pilot', icon: '🚀', description: 'Flight specialist and zero-g navigation expert.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Mobility / Scout' },
      { id: 'engineer', name: 'Engineer', icon: '🔧', description: 'Keeps the ship running and solves impossible problems.', hitDie: 'd8', primaryStat: 'INT', role: 'Utility / Support' },
      { id: 'marine', name: 'Marine', icon: '🎖️', description: 'Zero-g combat specialist, trained for boarding actions.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Damage / Tank' },
      { id: 'scientist', name: 'Scientist', icon: '🔬', description: 'Researcher and analyst, the smartest person on the ship.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Support / Utility' },
      { id: 'medic', name: 'Medic', icon: '💊', description: 'Ship surgeon handling injuries in zero gravity.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer' },
      { id: 'comms-officer', name: 'Comms Officer', icon: '📡', description: 'Communications and electronic warfare specialist.', hitDie: 'd6', primaryStat: 'INT / CHA', role: 'Support / Control' },
      { id: 'salvager', name: 'Salvager', icon: '⚓', description: 'Space-walk expert who strips derelicts for parts.', hitDie: 'd10', primaryStat: 'CON / DEX', role: 'Utility / Scout' },
      { id: 'captain', name: 'Captain', icon: '⭐', description: 'Leader and decision-maker, responsible for the crew.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Face / Support' },
    ],
  },
];
