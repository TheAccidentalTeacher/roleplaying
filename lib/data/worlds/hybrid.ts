import type { WorldDefinition } from '../world-types';

export const hybridWorlds: WorldDefinition[] = [
  // ─── 22. MECH / KAIJU ───
  {
    id: 'mech-kaiju',
    name: 'Mech vs Kaiju',
    icon: '🤖',
    genre: 'sci-fi',
    description: 'Giant monsters attack civilization. Humanity fights back with colossal mechs piloted by linked teams. Inspired by Pacific Rim, Evangelion, and Gundam.',
    flavor: 'When monsters the size of skyscrapers attack, you need a bigger weapon.',
    originLabel: 'Origin',
    classLabel: 'Division',
    origins: [
      {
        category: 'Military',
        origins: [
          { id: 'academy-grad', name: 'Academy Graduate', description: 'Top of your class at the Mech Pilot Academy.', bonuses: '+2 DEX, +1 INT' },
          { id: 'conscript', name: 'Conscript', description: 'Drafted into service, thrown into a cockpit.', bonuses: '+2 CON, +1 STR' },
          { id: 'veteran-pilot', name: 'Veteran Pilot', description: 'Survived multiple kaiju engagements.', bonuses: '+2 WIS, +1 DEX' },
        ],
      },
      {
        category: 'Civilian',
        origins: [
          { id: 'orphan', name: 'War Orphan', description: 'Lost everything to a kaiju attack, fighting for revenge.', bonuses: '+2 STR, +1 WIS' },
          { id: 'engineer-child', name: 'Engineer\'s Child', description: 'Grew up around mech construction, innate understanding.', bonuses: '+2 INT, +1 DEX' },
          { id: 'drift-compatible', name: 'Drift Compatible', description: 'Rare neural compatibility for mech drift-link.', bonuses: '+2 CHA, +1 WIS' },
        ],
      },
      {
        category: 'Enhanced',
        origins: [
          { id: 'kaiju-hybrid', name: 'Kaiju Hybrid', description: 'Exposed to kaiju blood, partially transformed.', bonuses: '+2 CON, +1 STR' },
          { id: 'neural-augment', name: 'Neural Augment', description: 'Brain implants for direct mech interface.', bonuses: '+2 INT, +1 DEX' },
          { id: 'clone-pilot', name: 'Clone Pilot', description: 'Purpose-bred for drift compatibility.', bonuses: '+2 DEX, +1 CON' },
        ],
      },
    ],
    classes: [
      { id: 'striker-pilot', name: 'Striker Pilot', icon: '⚔️', description: 'Melee mech specialist, close-range devastation.', hitDie: 'd10', primaryStat: 'STR / DEX', role: 'Damage' },
      { id: 'gunner-pilot', name: 'Gunner Pilot', icon: '🎯', description: 'Ranged weapons platform, artillery and missiles.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Damage / Range' },
      { id: 'tank-pilot', name: 'Tank Pilot', icon: '🛡️', description: 'Heavy armor mech, drawing fire from the kaiju.', hitDie: 'd12', primaryStat: 'CON / STR', role: 'Tank' },
      { id: 'mech-engineer', name: 'Mech Engineer', icon: '🔧', description: 'Repairs and modifies mechs in the field.', hitDie: 'd8', primaryStat: 'INT', role: 'Support / Utility' },
      { id: 'recon-pilot', name: 'Recon Pilot', icon: '📡', description: 'Fast, light mech — scouting and electronic warfare.', hitDie: 'd6', primaryStat: 'DEX / INT', role: 'Scout / Utility' },
      { id: 'commander', name: 'Commander', icon: '⭐', description: 'Tactical leader coordinating the mech squad.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Support / Face' },
      { id: 'kaiju-researcher', name: 'Kaiju Researcher', icon: '🔬', description: 'Studies kaiju biology for tactical advantages.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Support / Utility' },
      { id: 'drift-ace', name: 'Drift Ace', icon: '🧠', description: 'Unmatched neural link, pushing mechs beyond limits.', hitDie: 'd8', primaryStat: 'WIS / CHA', role: 'Damage / Control' },
    ],
  },

  // ─── 23. DREAM WORLD ───
  {
    id: 'dream-world',
    name: 'Dream World',
    icon: '💭',
    genre: 'mystery',
    description: 'Reality bends to thought. You explore the collective unconscious — a realm of surreal landscapes, living metaphors, and nightmare creatures. Inspired by Inception, Psychonauts, and Sandman.',
    flavor: 'In dreams, you can break any rule — except the ones that break you.',
    originLabel: 'Archetype',
    classLabel: 'Discipline',
    origins: [
      {
        category: 'Dreamer Type',
        origins: [
          { id: 'lucid-dreamer', name: 'Lucid Dreamer', description: 'Full awareness and control in the dream.', bonuses: '+2 WIS, +1 INT' },
          { id: 'sleepwalker', name: 'Sleepwalker', description: 'Body moves in the waking world while mind travels.', bonuses: '+2 DEX, +1 CON' },
          { id: 'daydreamer', name: 'Daydreamer', description: 'Slips between realities without trying.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'nightmare-survivor', name: 'Nightmare Survivor', description: 'Hardened by years of terrible dreams.', bonuses: '+2 CON, +1 STR' },
        ],
      },
      {
        category: 'Dream Entity',
        origins: [
          { id: 'figment', name: 'Figment', description: 'A recurring dream character who became self-aware.', bonuses: '+2 CHA, +1 INT' },
          { id: 'shadow-self', name: 'Shadow Self', description: 'Someone\'s dark reflection, now independent.', bonuses: '+2 STR, +1 DEX' },
          { id: 'memory-echo', name: 'Memory Echo', description: 'A persistent memory given form and will.', bonuses: '+2 WIS, +1 CHA' },
        ],
      },
      {
        category: 'Transcendent',
        origins: [
          { id: 'astral-traveler', name: 'Astral Traveler', description: 'Left their body permanently, existing as thought.', bonuses: '+2 INT, +1 WIS' },
          { id: 'dream-born', name: 'Dream-Born', description: 'Never had a waking body — pure dream essence.', bonuses: '+2 CHA, +1 DEX' },
        ],
      },
    ],
    classes: [
      { id: 'architect', name: 'Architect', icon: '🏗️', description: 'Reshapes the dream landscape at will.', hitDie: 'd6', primaryStat: 'INT', role: 'Control / Utility' },
      { id: 'sentinel', name: 'Sentinel', icon: '🛡️', description: 'Protects dreamers from nightmare intrusions.', hitDie: 'd10', primaryStat: 'CON / WIS', role: 'Tank / Support' },
      { id: 'phantasm', name: 'Phantasm', icon: '👻', description: 'Creates illusions and manipulates perceptions.', hitDie: 'd6', primaryStat: 'CHA', role: 'Control / Face' },
      { id: 'nightmare-knight', name: 'Nightmare Knight', icon: '⚔️', description: 'Weaponizes fear and darkness against dream threats.', hitDie: 'd10', primaryStat: 'STR / WIS', role: 'Damage / Tank' },
      { id: 'oneironaut', name: 'Oneironaut', icon: '🌀', description: 'Explorer of deep dream layers and forgotten memories.', hitDie: 'd8', primaryStat: 'WIS / DEX', role: 'Scout / Utility' },
      { id: 'muse', name: 'Muse', icon: '✨', description: 'Inspires and empowers allies through dream-song.', hitDie: 'd6', primaryStat: 'CHA / WIS', role: 'Support / Healer' },
      { id: 'dream-thief', name: 'Dream Thief', icon: '🗝️', description: 'Steals secrets from sleeping minds.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Stealth / Utility' },
      { id: 'void-diver', name: 'Void Diver', icon: '🕳️', description: 'Descends into the deepest, darkest dream layers.', hitDie: 'd8', primaryStat: 'CON / INT', role: 'Scout / Damage' },
    ],
  },

  // ─── 24. CORPORATE DYSTOPIA ───
  {
    id: 'corporate-dystopia',
    name: 'Corporate Dystopia',
    icon: '🏢',
    genre: 'political-intrigue',
    description: 'Mega-corporations have replaced governments. Everything is commodified — air, water, even emotions. Workers are drones. Rebels are terrorists. Inspired by Severance, Continuum, and Rollerball.',
    flavor: 'Your productivity score determines your right to breathe.',
    originLabel: 'Origin',
    classLabel: 'Role',
    origins: [
      {
        category: 'Corporate',
        origins: [
          { id: 'middle-management', name: 'Middle Management', description: 'Climbed the ladder, now questioning everything.', bonuses: '+2 CHA, +1 INT' },
          { id: 'corpo-security', name: 'Corporate Security', description: 'Enforcer for the company, doubting orders.', bonuses: '+2 STR, +1 DEX' },
          { id: 'lab-tech', name: 'Lab Technician', description: 'Saw what the company was developing. Couldn\'t unsee it.', bonuses: '+2 INT, +1 WIS' },
        ],
      },
      {
        category: 'Underclass',
        origins: [
          { id: 'debt-slave', name: 'Debt Slave', description: 'Trapped in corporate debt, working to survive.', bonuses: '+2 CON, +1 STR' },
          { id: 'gig-worker', name: 'Gig Worker', description: 'Living job to job, no safety net.', bonuses: '+2 DEX, +1 WIS' },
          { id: 'squatter', name: 'Squatter', description: 'Living off-grid in abandoned infrastructure.', bonuses: '+2 CON, +1 DEX' },
        ],
      },
      {
        category: 'Rebel',
        origins: [
          { id: 'hacktivist', name: 'Hacktivist', description: 'Digital revolutionary fighting from the shadows.', bonuses: '+2 INT, +1 DEX' },
          { id: 'union-organizer', name: 'Union Organizer', description: 'Risking everything to give workers a voice.', bonuses: '+2 CHA, +1 WIS' },
          { id: 'whistleblower', name: 'Whistleblower', description: 'Leaked corporate secrets, now hunted.', bonuses: '+2 WIS, +1 CHA' },
        ],
      },
    ],
    classes: [
      { id: 'infiltrator', name: 'Infiltrator', icon: '🕵️', description: 'Slips into corporate facilities under cover.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Stealth / Face' },
      { id: 'hacker', name: 'Hacker', icon: '💻', description: 'Cracks corporate networks and AI systems.', hitDie: 'd6', primaryStat: 'INT', role: 'Utility / Control' },
      { id: 'street-fighter', name: 'Street Fighter', icon: '💪', description: 'Brawler protecting the underclass with fists.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'propagandist', name: 'Propagandist', icon: '📢', description: 'Shapes public opinion against the corps.', hitDie: 'd6', primaryStat: 'CHA / INT', role: 'Face / Support' },
      { id: 'smuggler', name: 'Smuggler', icon: '📦', description: 'Moves contraband goods past corporate checkpoints.', hitDie: 'd8', primaryStat: 'DEX / CHA', role: 'Utility / Stealth' },
      { id: 'medic', name: 'Street Medic', icon: '💊', description: 'Treats the uninsured in underground clinics.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer' },
      { id: 'fixer', name: 'Fixer', icon: '📱', description: 'Makes connections, arranges deals, knows everyone.', hitDie: 'd6', primaryStat: 'CHA / WIS', role: 'Face / Utility' },
      { id: 'saboteur', name: 'Saboteur', icon: '💣', description: 'Destroys corporate infrastructure from within.', hitDie: 'd8', primaryStat: 'INT / DEX', role: 'Damage / Utility' },
    ],
  },

  // ─── 25. WEIRD WEST ───
  {
    id: 'weird-west',
    name: 'Weird West',
    icon: '🌵',
    genre: 'western',
    description: 'The Old West, but wrong. Undead gunslingers, wendigos on the plains, cursed gold, and demonic saloons. Inspired by Deadlands, Bone Tomahawk, and The Dark Tower.',
    flavor: 'The desert whispers with the voices of the damned.',
    originLabel: 'Heritage',
    classLabel: 'Calling',
    origins: [
      {
        category: 'Mortal',
        origins: [
          { id: 'frontier-folk', name: 'Frontier Folk', description: 'Hard-working settler on cursed land.', bonuses: '+2 CON, +1 WIS' },
          { id: 'lawman', name: 'Lawman', description: 'Badge-wearing authority in a lawless land.', bonuses: '+2 CHA, +1 DEX' },
          { id: 'outlaw', name: 'Outlaw', description: 'Running from the law and things worse than the law.', bonuses: '+2 DEX, +1 CHA' },
          { id: 'prospector', name: 'Prospector', description: 'Digging for gold, found something else entirely.', bonuses: '+2 CON, +1 INT' },
        ],
      },
      {
        category: 'Touched',
        origins: [
          { id: 'harrowed', name: 'Harrowed', description: 'Died and came back — a devil rides your soul.', bonuses: '+2 CON, +1 STR' },
          { id: 'skinwalker', name: 'Skinwalker', description: 'Shape-changer from Native American legend.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'ghost-rock-touched', name: 'Ghost Rock Touched', description: 'Exposure to supernatural mineral changed you.', bonuses: '+2 INT, +1 CON' },
        ],
      },
      {
        category: 'Outsider',
        origins: [
          { id: 'medicine-person', name: 'Medicine Person', description: 'Native healer with genuine spirit connections.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'chinese-railroad', name: 'Railroad Worker', description: 'Chinese laborer who discovered ancient martial arts.', bonuses: '+2 DEX, +1 STR' },
        ],
      },
    ],
    classes: [
      { id: 'gunslinger', name: 'Gunslinger', icon: '🔫', description: 'Supernatural quick-draw with cursed bullets.', hitDie: 'd10', primaryStat: 'DEX', role: 'Damage' },
      { id: 'huckster', name: 'Huckster', icon: '🃏', description: 'Gambler-sorcerer dealing with demons for power.', hitDie: 'd6', primaryStat: 'INT / CHA', role: 'Control / Utility' },
      { id: 'blessed', name: 'Blessed', icon: '✝️', description: 'Holy person channeling divine protection.', hitDie: 'd8', primaryStat: 'WIS / CHA', role: 'Healer / Support' },
      { id: 'mad-scientist', name: 'Mad Scientist', icon: '⚡', description: 'Inventor of impossible ghost-rock devices.', hitDie: 'd6', primaryStat: 'INT', role: 'Utility / Damage' },
      { id: 'shaman', name: 'Shaman', icon: '🦅', description: 'Negotiates with nature spirits for power.', hitDie: 'd8', primaryStat: 'WIS', role: 'Control / Healer' },
      { id: 'harrowed-fighter', name: 'Harrowed Fighter', icon: '💀', description: 'Undead gunfighter, unkillable and terrifying.', hitDie: 'd12', primaryStat: 'CON / STR', role: 'Tank / Damage' },
      { id: 'bounty-hunter', name: 'Bounty Hunter', icon: '🎯', description: 'Tracks both living and undead outlaws.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Hunter' },
      { id: 'hexslinger', name: 'Hexslinger', icon: '🔮', description: 'Combines magic and marksmanship in deadly unison.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Damage / Control' },
    ],
  },
];
