import type { WorldDefinition } from '../world-types';

export const exoticWorlds: WorldDefinition[] = [
  // ─── 26. WUXIA / MARTIAL ARTS ───
  {
    id: 'wuxia',
    name: 'Wuxia — Rivers & Lakes',
    icon: '🥋',
    genre: 'eastern',
    description: 'A world of flying swordsmen, hidden sects, and chi mastery. Honor, revenge, and forbidden techniques shape the Jianghu — the world beneath the world. Inspired by Crouching Tiger, Jade Empire, and Legend of the Condor Heroes.',
    flavor: 'In the rivers and lakes, your kung fu speaks louder than your name.',
    originLabel: 'Lineage',
    classLabel: 'Style',
    origins: [
      {
        category: 'Righteous Sects',
        origins: [
          { id: 'shaolin-disciple', name: 'Shaolin Disciple', description: 'Trained in the legendary monastery on Mount Song.', bonuses: '+2 STR, +1 WIS' },
          { id: 'wudang-adept', name: 'Wudang Adept', description: 'Internal arts and Taoist philosophy.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'emei-sister', name: 'Emei Initiate', description: 'Graceful and lethal, from the all-female sect.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'beggar-sect', name: 'Beggar Sect Member', description: 'Wanderer with hidden strength, vast network.', bonuses: '+2 CON, +1 CHA' },
        ],
      },
      {
        category: 'Unorthodox Sects',
        origins: [
          { id: 'demon-cult', name: 'Demon Cult Defector', description: 'Fled a dark sect, carrying forbidden techniques.', bonuses: '+2 STR, +1 INT' },
          { id: 'poison-clan', name: 'Poison Clan Scion', description: 'Master of venoms and toxic chi arts.', bonuses: '+2 INT, +1 DEX' },
          { id: 'blood-saber', name: 'Blood Saber Renegade', description: 'Violent sect outcast, haunted by past.', bonuses: '+2 STR, +1 CON' },
        ],
      },
      {
        category: 'Independent',
        origins: [
          { id: 'wandering-swordsman', name: 'Wandering Swordsman', description: 'Masterless hero roaming the Jianghu.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'scholar-warrior', name: 'Scholar-Warrior', description: 'Imperial exam dropout who chose the sword.', bonuses: '+2 INT, +1 CHA' },
          { id: 'peasant-prodigy', name: 'Peasant Prodigy', description: 'Self-taught genius with raw martial talent.', bonuses: '+2 CON, +1 STR' },
        ],
      },
    ],
    classes: [
      { id: 'sword-saint', name: 'Sword Saint', icon: '⚔️', description: 'Blade master who fights with transcendent speed.', hitDie: 'd10', primaryStat: 'DEX', role: 'Damage' },
      { id: 'iron-fist', name: 'Iron Fist', icon: '👊', description: 'Unarmed combat master, breaks stone with bare hands.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'chi-healer', name: 'Chi Healer', icon: '💚', description: 'Channels internal energy to mend wounds.', hitDie: 'd8', primaryStat: 'WIS', role: 'Healer / Support' },
      { id: 'shadow-step', name: 'Shadow Step', icon: '🌑', description: 'Stealth assassin using qinggong (lightness skill).', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Stealth / Damage' },
      { id: 'internal-master', name: 'Internal Master', icon: '☯️', description: 'Taoist who weaponizes chi into devastating waves.', hitDie: 'd6', primaryStat: 'WIS / INT', role: 'Control / Damage' },
      { id: 'weapon-master', name: 'Weapon Master', icon: '🔱', description: 'Expert in exotic weapons — whips, meteor hammers, guandao.', hitDie: 'd10', primaryStat: 'STR / DEX', role: 'Damage / Versatile' },
      { id: 'drunken-immortal', name: 'Drunken Immortal', icon: '🍶', description: 'Chaotic fighting style fueled by wine and madness.', hitDie: 'd10', primaryStat: 'CON / DEX', role: 'Tank / Damage' },
      { id: 'musician-warrior', name: 'Musician-Warrior', icon: '🎵', description: 'Kills with sound waves from zither, flute, or erhu.', hitDie: 'd6', primaryStat: 'CHA / DEX', role: 'Control / Support' },
    ],
  },

  // ─── 27. VIKING / NORSE ───
  {
    id: 'viking-norse',
    name: 'Viking Saga',
    icon: '⚓',
    genre: 'mythology',
    description: 'An age of longships, blood-oaths, and gods who walk among mortals. Ragnarök approaches — fight to earn your seat in Valhalla or prevent the end. Inspired by God of War, Vinland Saga, and Norse Eddas.',
    flavor: 'The All-Father watches. Die well.',
    originLabel: 'Bloodline',
    classLabel: 'Path',
    origins: [
      {
        category: 'Mortal',
        origins: [
          { id: 'karl', name: 'Karl (Freeman)', description: 'Free-born Norse warrior-farmer.', bonuses: '+2 STR, +1 CON' },
          { id: 'jarl-born', name: 'Jarl-Born', description: 'Nobility — leadership and wealth.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'thrall-freed', name: 'Freed Thrall', description: 'Once a slave, now burning for glory.', bonuses: '+2 CON, +1 DEX' },
          { id: 'shield-maiden', name: 'Shield-Maiden', description: 'Woman warrior who chooses battle over hearth.', bonuses: '+2 DEX, +1 STR' },
        ],
      },
      {
        category: 'Outsider',
        origins: [
          { id: 'saxon-convert', name: 'Saxon Convert', description: 'Christian outsider adopted into Norse culture.', bonuses: '+2 INT, +1 CHA' },
          { id: 'sami-seer', name: 'Sami Seer', description: 'Northern mystic with ancient spirit bonds.', bonuses: '+2 WIS, +1 INT' },
          { id: 'rus-trader', name: 'Rus Trader', description: 'Eastward traveler who sailed the river routes.', bonuses: '+2 CHA, +1 DEX' },
        ],
      },
      {
        category: 'Touched by Gods',
        origins: [
          { id: 'odin-marked', name: 'Odin-Marked', description: 'Sacrificed an eye or limb for wisdom.', bonuses: '+2 WIS, +1 INT' },
          { id: 'jotun-blood', name: 'Jötun Blood', description: 'Giant ancestry in your veins — immense and fierce.', bonuses: '+2 STR, +1 CON' },
          { id: 'alfar-touched', name: 'Álfar-Touched', description: 'Elf-kissed — ethereal beauty and fey cunning.', bonuses: '+2 DEX, +1 CHA' },
        ],
      },
    ],
    classes: [
      { id: 'berserker', name: 'Berserker', icon: '🐻', description: 'Bear-shirted rage warrior, unstoppable in fury.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Damage / Tank' },
      { id: 'skald', name: 'Skald', icon: '🎶', description: 'Battle-poet whose words inspire and curse.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Support / Face' },
      { id: 'volva', name: 'Völva', icon: '🔮', description: 'Seeress practicing seiðr magic and prophecy.', hitDie: 'd6', primaryStat: 'WIS / INT', role: 'Control / Healer' },
      { id: 'raider', name: 'Raider', icon: '⚔️', description: 'Viking warrior — axe, shield, and glory.', hitDie: 'd10', primaryStat: 'STR / DEX', role: 'Damage' },
      { id: 'rune-carver', name: 'Rune Carver', icon: 'ᚱ', description: 'Inscribes magical runes for protection and power.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Utility / Control' },
      { id: 'huskarl', name: 'Huskarl', icon: '🛡️', description: 'Elite bodyguard, sworn shield of the jarl.', hitDie: 'd12', primaryStat: 'CON / STR', role: 'Tank' },
      { id: 'navigator', name: 'Navigator', icon: '🧭', description: 'Reads stars and seas, guides the longship fleet.', hitDie: 'd8', primaryStat: 'WIS / DEX', role: 'Scout / Utility' },
      { id: 'ulfhednar', name: 'Úlfhéðnar', icon: '🐺', description: 'Wolf-warrior who channels animal spirits in battle.', hitDie: 'd10', primaryStat: 'DEX / CON', role: 'Damage / Scout' },
    ],
  },
];
