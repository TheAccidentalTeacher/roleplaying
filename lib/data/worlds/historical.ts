import type { WorldDefinition } from '../world-types';

export const historicalWorlds: WorldDefinition[] = [
  // ─── 19. PIRATE / AGE OF SAIL ───
  {
    id: 'pirate-age',
    name: 'Age of Sail',
    icon: '🏴‍☠️',
    genre: 'pirate',
    description: 'The golden age of piracy. Treasure fleets, naval combat, cursed islands, and the freedom of the open sea. Inspired by Pirates of the Caribbean, Black Sails, and Treasure Island.',
    flavor: 'Take what you can. Give nothing back.',
    originLabel: 'Origin',
    classLabel: 'Role',
    origins: [
      {
        category: 'Sailor',
        origins: [
          { id: 'merchant-sailor', name: 'Merchant Sailor', description: 'Served on trade vessels, knows the shipping lanes.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'navy-deserter', name: 'Navy Deserter', description: 'Fled the royal navy, trained in military tactics.', bonuses: '+2 STR, +1 INT' },
          { id: 'pressed-man', name: 'Pressed Man', description: 'Forced into service, survived and turned pirate.', bonuses: '+2 CON, +1 STR' },
        ],
      },
      {
        category: 'Land-Born',
        origins: [
          { id: 'noble-exiled', name: 'Exiled Noble', description: 'Lost your title, took to the sea for revenge.', bonuses: '+2 CHA, +1 INT' },
          { id: 'escaped-slave', name: 'Escaped Slave', description: 'Won freedom and vowed never to be chained again.', bonuses: '+2 CON, +1 WIS' },
          { id: 'islander', name: 'Islander', description: 'From a tropical island, born to the water.', bonuses: '+2 DEX, +1 CON' },
          { id: 'street-urchin', name: 'Street Urchin', description: 'Stowed away to escape the slums.', bonuses: '+2 DEX, +1 CHA' },
        ],
      },
      {
        category: 'Cursed',
        origins: [
          { id: 'cursed-sailor', name: 'Cursed Sailor', description: 'Touched cursed treasure, now bound to the sea.', bonuses: '+2 CON, +1 WIS' },
          { id: 'sea-witch-blood', name: 'Sea Witch Blood', description: 'Descended from ocean sorcery, can taste storms.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'drowned-returned', name: 'Drowned & Returned', description: 'Died at sea and came back changed.', bonuses: '+2 CON, +1 STR' },
        ],
      },
    ],
    classes: [
      { id: 'captain', name: 'Captain', icon: '🏴‍☠️', description: 'Leader of the crew, commanding respect and loyalty.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Face / Support' },
      { id: 'swashbuckler', name: 'Swashbuckler', icon: '⚔️', description: 'Dashing swordfighter, acrobatic and fearless.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Damage / Mobility' },
      { id: 'cannoneer', name: 'Cannoneer', icon: '💣', description: 'Artillery expert, devastating at range.', hitDie: 'd10', primaryStat: 'INT / STR', role: 'Damage / Range' },
      { id: 'navigator', name: 'Navigator', icon: '🧭', description: 'Chart-master who always finds the way.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Utility / Scout' },
      { id: 'surgeon', name: 'Ship Surgeon', icon: '💊', description: 'Patches up sword wounds and amputates with rum.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer' },
      { id: 'buccaneer', name: 'Buccaneer', icon: '💪', description: 'Boarding specialist, heavy weapons and brute force.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'smuggler', name: 'Smuggler', icon: '📦', description: 'Gets contraband past any blockade.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Utility / Stealth' },
      { id: 'sea-witch', name: 'Sea Witch', icon: '🌊', description: 'Commands wind, waves, and ocean creatures.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Control / Support' },
    ],
  },

  // ─── 20. WILD WEST ───
  {
    id: 'wild-west',
    name: 'Wild West',
    icon: '🤠',
    genre: 'western',
    description: 'The American frontier: lawless, vast, and unforgiving. Gunslingers, outlaws, and pioneers carve civilization from the wilderness. Inspired by Red Dead Redemption, Deadwood, and The Good, the Bad and the Ugly.',
    flavor: 'This town ain\'t big enough for the both of us.',
    originLabel: 'Origin',
    classLabel: 'Profession',
    origins: [
      {
        category: 'Settler',
        origins: [
          { id: 'homesteader', name: 'Homesteader', description: 'Farming family on the frontier, self-reliant.', bonuses: '+2 CON, +1 WIS' },
          { id: 'townsperson', name: 'Townsperson', description: 'Born in a growing frontier town.', bonuses: '+2 CHA, +1 INT' },
          { id: 'immigrant', name: 'Immigrant', description: 'Came west seeking a new life, bringing old skills.', bonuses: '+2 CON, +1 any' },
        ],
      },
      {
        category: 'Frontier',
        origins: [
          { id: 'native', name: 'Native', description: 'Indigenous person watching their world change.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'mountain-man', name: 'Mountain Man', description: 'Trapper and fur trader who knows the wild.', bonuses: '+2 CON, +1 STR' },
          { id: 'vaquero', name: 'Vaquero', description: 'Mexican horseman, the original cowboy.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'buffalo-soldier', name: 'Buffalo Soldier', description: 'Black cavalryman serving on the frontier.', bonuses: '+2 STR, +1 CON' },
        ],
      },
      {
        category: 'Outlaw',
        origins: [
          { id: 'outlaw', name: 'Outlaw', description: 'Wanted by the law, living on the run.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'ex-confederate', name: 'Ex-Confederate', description: 'Lost soldier from the losing side of the war.', bonuses: '+2 STR, +1 WIS' },
          { id: 'drifter', name: 'Drifter', description: 'No home, no ties, just the horizon.', bonuses: '+2 DEX, +1 WIS' },
        ],
      },
    ],
    classes: [
      { id: 'gunslinger', name: 'Gunslinger', icon: '🔫', description: 'Fastest draw in the territory.', hitDie: 'd10', primaryStat: 'DEX', role: 'Damage' },
      { id: 'lawman', name: 'Lawman', icon: '⭐', description: 'Sheriff, marshal, or ranger — bringing order.', hitDie: 'd10', primaryStat: 'WIS / CHA', role: 'Tank / Face' },
      { id: 'outlaw-rider', name: 'Outlaw', icon: '🏇', description: 'Bandit, robber, and desperado.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Damage / Mobility' },
      { id: 'scout', name: 'Scout', icon: '🏜️', description: 'Tracker and wilderness guide.', hitDie: 'd8', primaryStat: 'WIS / DEX', role: 'Scout / Utility' },
      { id: 'doc', name: 'Doc', icon: '💊', description: 'Frontier doctor with whiskey and a bone saw.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Healer' },
      { id: 'preacher', name: 'Preacher', icon: '✝️', description: 'Man of God with a Bible and a hidden gun.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Support / Face' },
      { id: 'gambler', name: 'Gambler', icon: '🃏', description: 'Card sharp and con artist, living by luck.', hitDie: 'd6', primaryStat: 'CHA / DEX', role: 'Face / Utility' },
      { id: 'bounty-hunter', name: 'Bounty Hunter', icon: '🎯', description: 'Tracks wanted men for the reward, dead or alive.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Hunter' },
    ],
  },

  // ─── 21. FEUDAL JAPAN ───
  {
    id: 'feudal-japan',
    name: 'Feudal Japan',
    icon: '⛩️',
    genre: 'mythological',
    description: 'The Sengoku period with a supernatural twist — samurai, ninja, yokai, and kami shape a land torn by civil war and spirit warfare. Inspired by Sekiro, Ghost of Tsushima, and Nioh.',
    flavor: 'Honor is the blade. Shame is the wound.',
    originLabel: 'Heritage',
    classLabel: 'Path',
    origins: [
      {
        category: 'Noble',
        origins: [
          { id: 'samurai-born', name: 'Samurai Born', description: 'From a warrior family, trained in bushido.', bonuses: '+2 STR, +1 WIS' },
          { id: 'court-noble', name: 'Court Noble', description: 'Aristocrat versed in politics and poetry.', bonuses: '+2 CHA, +1 INT' },
          { id: 'priest-born', name: 'Shrine Heir', description: 'Raised at a Shinto shrine, connected to the kami.', bonuses: '+2 WIS, +1 CHA' },
        ],
      },
      {
        category: 'Common',
        origins: [
          { id: 'ashigaru', name: 'Ashigaru', description: 'Peasant foot-soldier, tough and expendable.', bonuses: '+2 CON, +1 STR' },
          { id: 'merchant', name: 'Merchant', description: 'Trader and craftsman, wealthy but low-status.', bonuses: '+2 INT, +1 CHA' },
          { id: 'farmer', name: 'Farmer', description: 'Rice farmer with hidden martial talent.', bonuses: '+2 CON, +1 WIS' },
          { id: 'ronin-born', name: 'Ronin Born', description: 'Masterless wanderer, free but dishonored.', bonuses: '+2 DEX, +1 STR' },
        ],
      },
      {
        category: 'Supernatural',
        origins: [
          { id: 'oni-blood', name: 'Oni-Blooded', description: 'Demon heritage visible in horns or fangs.', bonuses: '+2 STR, +1 CON' },
          { id: 'kitsune', name: 'Kitsune', description: 'Fox spirit in human form, age-old trickster.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'spirit-touched', name: 'Spirit-Touched', description: 'Blessed by a kami, able to see the spirit world.', bonuses: '+2 WIS, +1 CHA' },
        ],
      },
    ],
    classes: [
      { id: 'samurai', name: 'Samurai', icon: '⚔️', description: 'Swordmaster following the way of bushido.', hitDie: 'd10', primaryStat: 'STR / WIS', role: 'Damage / Tank' },
      { id: 'ninja', name: 'Ninja', icon: '🌙', description: 'Shadow warrior, spy, and assassin.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Damage / Stealth' },
      { id: 'onmyoji', name: 'Onmyoji', icon: '📜', description: 'Spirit-commanding sorcerer of yin and yang.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Control / Support' },
      { id: 'monk-zen', name: 'Zen Monk', icon: '🙏', description: 'Enlightened warrior-monk, fists of iron.', hitDie: 'd8', primaryStat: 'WIS / DEX', role: 'Damage / Healer' },
      { id: 'sohei', name: 'Sohei', icon: '🛡️', description: 'Warrior monk of the mountain temples, naginata master.', hitDie: 'd10', primaryStat: 'STR / WIS', role: 'Tank / Support' },
      { id: 'miko', name: 'Miko', icon: '⛩️', description: 'Shrine maiden channeling divine kami power.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Healer / Control' },
      { id: 'kensei', name: 'Kensei', icon: '🗡️', description: 'Sword saint — peerless duelist seeking perfection.', hitDie: 'd10', primaryStat: 'DEX / STR', role: 'Damage' },
      { id: 'yamabushi', name: 'Yamabushi', icon: '🏔️', description: 'Mountain ascetic with nature magic and endurance.', hitDie: 'd8', primaryStat: 'CON / WIS', role: 'Utility / Support' },
    ],
  },
];
