import type { WorldDefinition } from '../world-types';

export const horrorWorlds: WorldDefinition[] = [
  // ─── 13. COSMIC HORROR ───
  {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    icon: '🐙',
    genre: 'lovecraftian',
    description: 'Eldritch gods slumber beneath reality. Forbidden knowledge erodes sanity. The universe is vast, uncaring, and full of things that should not exist. Inspired by Lovecraft, Bloodborne, and Call of Cthulhu.',
    flavor: 'The truth is not liberating. It is annihilating.',
    originLabel: 'Origin',
    classLabel: 'Profession',
    origins: [
      {
        category: 'Mundane',
        origins: [
          { id: 'academic', name: 'Academic', description: 'Professor or researcher who went looking for forbidden knowledge.', bonuses: '+2 INT, +1 WIS' },
          { id: 'journalist', name: 'Journalist', description: 'Reporter who followed a story into the abyss.', bonuses: '+2 CHA, +1 INT' },
          { id: 'veteran', name: 'War Veteran', description: 'Hardened by human conflict, now facing worse.', bonuses: '+2 CON, +1 STR' },
          { id: 'drifter', name: 'Drifter', description: 'Rootless wanderer, drawn to strange places.', bonuses: '+2 DEX, +1 WIS' },
        ],
      },
      {
        category: 'Touched',
        origins: [
          { id: 'dreamer', name: 'Dreamer', description: 'Plagued by visions of other dimensions when sleeping.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'cult-escapee', name: 'Cult Escapee', description: 'Fled a cult, carrying fragments of forbidden ritual.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'bloodline', name: 'Tainted Bloodline', description: 'Descended from those who made pacts with the Old Ones.', bonuses: '+2 CON, +1 INT' },
        ],
      },
      {
        category: 'Altered',
        origins: [
          { id: 'deep-one-hybrid', name: 'Deep One Hybrid', description: 'Part human, part something from the ocean depths.', bonuses: '+2 CON, +1 STR', traits: ['Water Breathing'] },
          { id: 'star-touched', name: 'Star-Touched', description: 'Exposed to a meteorite that changed your biology.', bonuses: '+2 INT, +1 CON' },
          { id: 'revenant', name: 'Revenant', description: 'Died and came back wrong. Something followed you.', bonuses: '+2 CON, +1 WIS' },
        ],
      },
    ],
    classes: [
      { id: 'investigator', name: 'Investigator', icon: '🔍', description: 'Follows clues into dangerous truths.', hitDie: 'd6', primaryStat: 'INT / WIS', role: 'Utility / Scout' },
      { id: 'occultist', name: 'Occultist', icon: '📖', description: 'Studies forbidden magic, risking sanity for power.', hitDie: 'd6', primaryStat: 'INT', role: 'Control / Damage' },
      { id: 'alienist', name: 'Alienist', icon: '🧠', description: 'Psychologist trying to understand inhuman minds.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Support / Face' },
      { id: 'enforcer', name: 'Enforcer', icon: '🔫', description: 'Tough muscle who deals with threats physically.', hitDie: 'd10', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'antiquarian', name: 'Antiquarian', icon: '🏺', description: 'Collector of relics and artifacts, adept at appraisal.', hitDie: 'd6', primaryStat: 'INT / DEX', role: 'Utility / Support' },
      { id: 'medium', name: 'Medium', icon: '👻', description: 'Communicates with spirits and otherworldly entities.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Support / Control' },
      { id: 'monster-hunter', name: 'Monster Hunter', icon: '🗡️', description: 'Specializes in tracking and killing eldritch creatures.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Hunter' },
      { id: 'ward-keeper', name: 'Ward Keeper', icon: '🛡️', description: 'Creates protective barriers against otherworldly forces.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Support / Defense' },
    ],
  },

  // ─── 14. GOTHIC HORROR ───
  {
    id: 'gothic-horror',
    name: 'Gothic Horror',
    icon: '🦇',
    genre: 'horror',
    description: 'Fog-shrouded moors, haunted castles, vampire lords, and werewolf packs. Victorian-era dread where every shadow hides something terrible. Inspired by Ravenloft, Dracula, and Castlevania.',
    flavor: 'The night is hungry, and it knows your name.',
    originLabel: 'Heritage',
    classLabel: 'Calling',
    origins: [
      {
        category: 'Mortal',
        origins: [
          { id: 'villager', name: 'Villager', description: 'Simple folk from a cursed village, tougher than they look.', bonuses: '+2 CON, +1 WIS' },
          { id: 'aristocrat', name: 'Aristocrat', description: 'Lesser nobility with dark family secrets.', bonuses: '+2 CHA, +1 INT' },
          { id: 'clergy', name: 'Clergy', description: 'Person of faith, armed with prayer and conviction.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'scholar', name: 'Scholar', description: 'Student of the occult and forbidden sciences.', bonuses: '+2 INT, +1 WIS' },
        ],
      },
      {
        category: 'Cursed',
        origins: [
          { id: 'dhampir', name: 'Dhampir', description: 'Half-vampire, torn between bloodlust and humanity.', bonuses: '+2 CHA, +1 STR' },
          { id: 'lycanthrope', name: 'Lycanthrope', description: 'Afflicted with the beast curse, fighting for control.', bonuses: '+2 STR, +1 CON' },
          { id: 'revenant', name: 'Revenant', description: 'Returned from the grave with unfinished business.', bonuses: '+2 CON, +1 WIS' },
          { id: 'possessed', name: 'Possessed', description: 'Sharing your body with a dark entity.', bonuses: '+2 INT, +1 CHA' },
        ],
      },
      {
        category: 'Other',
        origins: [
          { id: 'romani', name: 'Vistani', description: 'Traveling people with mystical sight and curse immunity.', bonuses: '+2 WIS, +1 DEX' },
          { id: 'constructed', name: 'Constructed', description: 'Stitched together from the dead, seeking purpose.', bonuses: '+2 STR, +1 CON' },
        ],
      },
    ],
    classes: [
      { id: 'vampire-hunter', name: 'Vampire Hunter', icon: '🗡️', description: 'Dedicated slayer of the undead, trained in their weaknesses.', hitDie: 'd10', primaryStat: 'DEX / WIS', role: 'Damage / Hunter' },
      { id: 'witch-hunter', name: 'Witch Hunter', icon: '🔥', description: 'Inquisitor seeking out dark magic and corruption.', hitDie: 'd10', primaryStat: 'WIS / STR', role: 'Tank / Anti-magic' },
      { id: 'spiritualist', name: 'Spiritualist', icon: '👻', description: 'Channels and commands restless spirits.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Control / Support' },
      { id: 'beast-stalker', name: 'Beast Stalker', icon: '🐺', description: 'Tracks and hunts lycanthropes and beasts.', hitDie: 'd10', primaryStat: 'DEX / CON', role: 'Damage / Scout' },
      { id: 'alchemist', name: 'Alchemist', icon: '⚗️', description: 'Brews holy water, silver weapons, and healing draughts.', hitDie: 'd8', primaryStat: 'INT / WIS', role: 'Support / Utility' },
      { id: 'exorcist', name: 'Exorcist', icon: '✝️', description: 'Banishes demons and purifies the possessed.', hitDie: 'd8', primaryStat: 'WIS / CHA', role: 'Healer / Anti-magic' },
      { id: 'grave-robber', name: 'Grave Robber', icon: '⚰️', description: 'Steals from the dead, sneaks through crypts.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Utility / Stealth' },
      { id: 'battle-priest', name: 'Battle Priest', icon: '🛡️', description: 'Holy warrior armored in faith and steel.', hitDie: 'd10', primaryStat: 'STR / WIS', role: 'Tank / Healer' },
    ],
  },

  // ─── 15. ALIEN INVASION ───
  {
    id: 'alien-invasion',
    name: 'Alien Invasion',
    icon: '👽',
    genre: 'survival',
    description: 'They came from the sky and conquered in weeks. Now human resistance cells fight a guerrilla war against technologically superior alien occupiers. Inspired by XCOM, War of the Worlds, and Resistance.',
    flavor: 'They thought we would surrender. They were wrong.',
    originLabel: 'Origin',
    classLabel: 'Role',
    origins: [
      {
        category: 'Resistance',
        origins: [
          { id: 'civilian', name: 'Civilian', description: 'Average person who refused to submit.', bonuses: '+1 to all abilities' },
          { id: 'soldier', name: 'Former Soldier', description: 'Survived the initial invasion, still fighting.', bonuses: '+2 STR, +1 DEX' },
          { id: 'scientist', name: 'Scientist', description: 'Studies alien tech to turn it against them.', bonuses: '+2 INT, +1 WIS' },
          { id: 'pilot', name: 'Former Pilot', description: 'Flew before the invasion, now flies stolen craft.', bonuses: '+2 DEX, +1 INT' },
        ],
      },
      {
        category: 'Enhanced',
        origins: [
          { id: 'augmented', name: 'Augmented', description: 'Implanted with salvaged alien cybernetics.', bonuses: '+2 STR, +1 CON' },
          { id: 'psionic-awakened', name: 'Psi-Awakened', description: 'Alien proximity awakened latent psychic abilities.', bonuses: '+2 WIS, +1 CHA' },
          { id: 'hybrid', name: 'Human-Alien Hybrid', description: 'Experimental crossbreed, mistrusted by both sides.', bonuses: '+2 CON, +1 INT' },
        ],
      },
      {
        category: 'Alien Defector',
        origins: [
          { id: 'grey-defector', name: 'Grey Defector', description: 'Alien who turned against their own command.', bonuses: '+2 INT, +1 DEX' },
          { id: 'drone-freed', name: 'Freed Drone', description: 'Alien bio-drone that broke free of the hive mind.', bonuses: '+2 CON, +1 STR' },
        ],
      },
    ],
    classes: [
      { id: 'guerrilla', name: 'Guerrilla', icon: '🎯', description: 'Hit-and-run specialist, ambush expert.', hitDie: 'd8', primaryStat: 'DEX / WIS', role: 'Damage / Stealth' },
      { id: 'heavy', name: 'Heavy', icon: '💪', description: 'Carries the big guns, takes the heavy hits.', hitDie: 'd12', primaryStat: 'STR / CON', role: 'Tank / Damage' },
      { id: 'tech-specialist', name: 'Tech Specialist', icon: '💻', description: 'Reverse-engineers alien technology.', hitDie: 'd6', primaryStat: 'INT', role: 'Utility / Support' },
      { id: 'psi-operative', name: 'Psi Operative', icon: '🧠', description: 'Wields psychic powers learned from the aliens.', hitDie: 'd6', primaryStat: 'WIS / CHA', role: 'Control / Damage' },
      { id: 'field-medic', name: 'Field Medic', icon: '💊', description: 'Keeps the resistance alive under fire.', hitDie: 'd8', primaryStat: 'WIS / INT', role: 'Healer' },
      { id: 'saboteur', name: 'Saboteur', icon: '💣', description: 'Demolitions and infiltration expert.', hitDie: 'd8', primaryStat: 'DEX / INT', role: 'Damage / Utility' },
      { id: 'sniper', name: 'Sniper', icon: '🔭', description: 'One shot, one kill, from impossible range.', hitDie: 'd8', primaryStat: 'DEX', role: 'Damage / Range' },
      { id: 'commander', name: 'Commander', icon: '⭐', description: 'Tactical genius leading resistance operations.', hitDie: 'd8', primaryStat: 'CHA / WIS', role: 'Face / Support' },
    ],
  },
];
