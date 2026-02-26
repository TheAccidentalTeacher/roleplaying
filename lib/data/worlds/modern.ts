import type { WorldDefinition } from '../world-types';

export const modernWorlds: WorldDefinition[] = [
  // ─── 16. URBAN FANTASY ───
  {
    id: 'urban-fantasy',
    name: 'Urban Fantasy',
    icon: '🌆',
    genre: 'mystery',
    description: 'Magic is real, hiding in plain sight within modern cities. Vampires run nightclubs, werewolves work construction, and fae make deals in coffee shops. Inspired by Dresden Files, True Blood, and World of Darkness.',
    flavor: 'The city sleeps. Its monsters do not.',
    originLabel: 'Heritage',
    classLabel: 'Profession',
    origins: [
      {
        category: 'Mortal',
        origins: [
          { id: 'mundane', name: 'Mundane', description: 'Ordinary human drawn into the supernatural world.', bonuses: '+1 to all abilities' },
          { id: 'sensitive', name: 'Sensitive', description: 'Always could see things others could not.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'legacy', name: 'Legacy', description: 'From a family that has always known the truth.', bonuses: '+2 INT, +1 WIS' },
        ],
      },
      {
        category: 'Supernatural',
        origins: [
          { id: 'half-fae', name: 'Half-Fae', description: 'One parent was fae — you inherited their charm and tricks.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'werewolf', name: 'Werewolf', description: 'Shape-shifting predator, part of a pack hierarchy.', bonuses: '+2 STR, +1 CON' },
          { id: 'vampire', name: 'Vampire', description: 'Undead predator hiding among the living.', bonuses: '+2 CHA, +1 STR' },
          { id: 'nephilim', name: 'Nephilim', description: 'Angel-blooded, carrying divine heritage.', bonuses: '+2 CHA, +1 WIS' },
        ],
      },
      {
        category: 'Awakened',
        origins: [
          { id: 'practitioner', name: 'Practitioner', description: 'Born with innate magical talent, self-taught.', bonuses: '+2 INT, +1 CHA' },
          { id: 'possessed', name: 'Possessed', description: 'Sharing your body with a spirit — willingly or not.', bonuses: '+2 CON, +1 WIS' },
          { id: 'reborn', name: 'Reborn', description: 'Died and came back, remembering the other side.', bonuses: '+2 WIS, +1 CON' },
        ],
      },
    ],
    classes: [
      { id: 'detective', name: 'Occult Detective', icon: '🔍', description: 'Investigates supernatural crimes and mysteries.', hitDie: 'd8', primaryStat: 'INT / WIS', role: 'Utility / Scout' },
      { id: 'enforcer', name: 'Enforcer', icon: '💪', description: 'Muscle for the supernatural underworld.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'wizard', name: 'Street Wizard', icon: '🔮', description: 'Practitioner of modern-adapted traditional magic.', hitDie: 'd6', primaryStat: 'INT', role: 'Damage / Control' },
      { id: 'hunter', name: 'Monster Hunter', icon: '🗡️', description: 'Professional exterminator of hostile supernaturals.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Hunter' },
      { id: 'negotiator', name: 'Negotiator', icon: '🤝', description: 'Broker between supernatural factions.', hitDie: 'd6', primaryStat: 'CHA / INT', role: 'Face / Support' },
      { id: 'medium', name: 'Medium', icon: '👁️', description: 'Channels spirits and reads the echoes of the dead.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Support / Control' },
      { id: 'tech-mage', name: 'Techno-Mage', icon: '💻', description: 'Fuses modern technology with arcane power.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Utility / Damage' },
      { id: 'guardian', name: 'Guardian', icon: '🛡️', description: 'Protector of the boundary between worlds.', hitDie: 'd10', primaryStat: 'WIS / STR', role: 'Tank / Support' },
    ],
  },

  // ─── 17. SUPERHERO ───
  {
    id: 'superhero',
    name: 'Superhero',
    icon: '🦸',
    genre: 'superhero',
    description: 'Superpowered individuals protect (or threaten) a world struggling to adapt. Secret identities, supervillains, and world-ending threats are daily life. Inspired by Marvel, DC, and The Boys.',
    flavor: 'With great power comes catastrophic collateral damage.',
    originLabel: 'Origin',
    classLabel: 'Archetype',
    origins: [
      {
        category: 'Natural',
        origins: [
          { id: 'baseline-human', name: 'Baseline Human', description: 'No powers, just peak training and gadgets.', bonuses: '+1 to all abilities' },
          { id: 'mutant', name: 'Mutant', description: 'Born with the X-gene or equivalent — powers manifested at puberty.', bonuses: '+2 to any one, +1 any' },
          { id: 'alien', name: 'Alien', description: 'Extraterrestrial refugee on Earth.', bonuses: '+2 STR, +1 CON' },
        ],
      },
      {
        category: 'Enhanced',
        origins: [
          { id: 'super-soldier', name: 'Super Soldier', description: 'Government experiment that actually worked.', bonuses: '+2 STR, +1 CON' },
          { id: 'accident', name: 'Accident', description: 'Gained powers from a lab accident, radiation, or cosmic event.', bonuses: '+2 CON, +1 any' },
          { id: 'tech-genius', name: 'Tech Genius', description: 'No powers — just unfathomable intellect and resources.', bonuses: '+2 INT, +1 CHA' },
          { id: 'mystic', name: 'Mystic', description: 'Trained in ancient magical traditions.', bonuses: '+2 WIS, +1 INT' },
        ],
      },
      {
        category: 'Other',
        origins: [
          { id: 'android', name: 'Android', description: 'Artificial being with developing humanity.', bonuses: '+2 INT, +1 CON' },
          { id: 'divine', name: 'Divine', description: 'Literally a god or demigod walking among mortals.', bonuses: '+2 CHA, +1 STR' },
          { id: 'symbiote-host', name: 'Symbiote Host', description: 'Bonded with an alien organism granting powers.', bonuses: '+2 STR, +1 DEX' },
        ],
      },
    ],
    classes: [
      { id: 'brick', name: 'Brick', icon: '💪', description: 'Super-strong, super-tough, the heavy hitter.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'speedster', name: 'Speedster', icon: '⚡', description: 'Moves at superhuman speeds, vibrates through walls.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Mobility' },
      { id: 'blaster', name: 'Blaster', icon: '🔥', description: 'Projects energy — fire, ice, lightning, cosmic.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Damage / Range' },
      { id: 'controller', name: 'Controller', icon: '🧠', description: 'Telekinesis, telepathy, or reality manipulation.', hitDie: 'd6', primaryStat: 'WIS / INT', role: 'Control / Utility' },
      { id: 'gadgeteer', name: 'Gadgeteer', icon: '⚙️', description: 'Tech-based hero with a suit, gadgets, and vehicles.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Utility / Damage' },
      { id: 'shapeshifter', name: 'Shapeshifter', icon: '🦎', description: 'Changes form — animals, people, or pure energy.', hitDie: 'd8', primaryStat: 'CON / CHA', role: 'Utility / Stealth' },
      { id: 'mystic-hero', name: 'Mystic', icon: '✨', description: 'Wields magical or cosmic powers.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Control / Support' },
      { id: 'martial-artist', name: 'Martial Artist', icon: '🥋', description: 'Peak physical conditioning and fighting skill.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Tank' },
    ],
  },

  // ─── 18. SPY / ESPIONAGE ───
  {
    id: 'espionage',
    name: 'Espionage',
    icon: '🕵️',
    genre: 'political-intrigue',
    description: 'A world of shadow wars, double agents, and geopolitical intrigue. Trust no one. Inspired by James Bond, John le Carré, and Mission Impossible.',
    flavor: 'Everyone has a handler. Even you.',
    originLabel: 'Origin',
    classLabel: 'Specialization',
    origins: [
      {
        category: 'Western',
        origins: [
          { id: 'agency-recruit', name: 'Agency Recruit', description: 'Recruited fresh from university, trained in tradecraft.', bonuses: '+2 INT, +1 CHA' },
          { id: 'military-intel', name: 'Military Intelligence', description: 'Transferred from special forces to covert ops.', bonuses: '+2 STR, +1 DEX' },
          { id: 'tech-division', name: 'Tech Division', description: 'Engineering background, recruited for gadget design.', bonuses: '+2 INT, +1 DEX' },
        ],
      },
      {
        category: 'Eastern',
        origins: [
          { id: 'sleeper', name: 'Sleeper Agent', description: 'Deep cover operative, living a double life for years.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'defector', name: 'Defector', description: 'Switched sides, bringing valuable secrets and paranoia.', bonuses: '+2 WIS, +1 INT' },
        ],
      },
      {
        category: 'Independent',
        origins: [
          { id: 'freelancer', name: 'Freelancer', description: 'Works for the highest bidder, loyal to none.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'burned', name: 'Burned Agent', description: 'Disavowed by your agency, surviving on your own.', bonuses: '+2 CON, +1 WIS' },
          { id: 'criminal-asset', name: 'Criminal Asset', description: 'From organized crime, recruited for your connections.', bonuses: '+2 CHA, +1 STR' },
          { id: 'journalist', name: 'Journalist Cover', description: 'Reporter identity concealing intelligence work.', bonuses: '+2 CHA, +1 INT' },
        ],
      },
    ],
    classes: [
      { id: 'field-agent', name: 'Field Agent', icon: '🕵️', description: 'All-rounder operative, skilled in most situations.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Utility / Face' },
      { id: 'assassin', name: 'Assassin', icon: '🎯', description: 'Eliminates targets with surgical precision.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Damage / Stealth' },
      { id: 'handler', name: 'Handler', icon: '📱', description: 'Manages agents, coordinates operations from HQ.', hitDie: 'd6', primaryStat: 'INT / CHA', role: 'Support / Face' },
      { id: 'tech-ops', name: 'Tech Ops', icon: '💻', description: 'Hacking, surveillance, and gadget specialist.', hitDie: 'd6', primaryStat: 'INT', role: 'Utility / Support' },
      { id: 'honey-trap', name: 'Honey Trap', icon: '💋', description: 'Uses seduction and social engineering as weapons.', hitDie: 'd6', primaryStat: 'CHA / DEX', role: 'Face / Utility' },
      { id: 'demolitions', name: 'Demolitions', icon: '💣', description: 'Explosives and heavy weapons expert.', hitDie: 'd10', primaryStat: 'INT / CON', role: 'Damage / Utility' },
      { id: 'interrogator', name: 'Interrogator', icon: '🔦', description: 'Extracts information through any means necessary.', hitDie: 'd8', primaryStat: 'WIS / CHA', role: 'Face / Control' },
      { id: 'wheelman', name: 'Wheelman', icon: '🏎️', description: 'Expert driver and pursuit specialist.', hitDie: 'd8', primaryStat: 'DEX / CON', role: 'Mobility / Utility' },
    ],
  },
];
