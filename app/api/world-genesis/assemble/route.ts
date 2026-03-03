// ============================================================
// WORLD GENESIS — ASSEMBLE & SAVE
// POST /api/world-genesis/assemble
//
// Called AFTER all 14 steps are complete on the client.
// Takes the accumulated step data, builds WorldRecord + Character,
// saves both to Supabase, returns IDs + full objects.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character, Skill, SavingThrow, ClassFeature, AbilityName, SkillName, Spellcasting, Spell } from '@/lib/types/character';

export const maxDuration = 30;

interface AssembleRequest {
  character: CharacterCreationInput;
  userId: string;
  accumulated: Record<string, unknown>; // All 14 steps merged
}

function getHitDie(characterClass: string): number {
  const hitDice: Record<string, number> = {
    barbarian: 12,
    fighter: 10, paladin: 10, ranger: 10,
    bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
    sorcerer: 6, wizard: 6,
  };
  return hitDice[characterClass?.toLowerCase()] ?? 8;
}

// ── Skill → Ability mapping ────────────────────────────────────────
const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  acrobatics: 'dex', 'animal-handling': 'wis', arcana: 'int', athletics: 'str',
  deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha',
  investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
  performance: 'cha', persuasion: 'cha', religion: 'int', 'sleight-of-hand': 'dex',
  stealth: 'dex', survival: 'wis',
};

const ALL_SKILLS: SkillName[] = Object.keys(SKILL_ABILITIES) as SkillName[];
const ALL_ABILITIES: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// ── Class data tables ──────────────────────────────────────────────
interface ClassData {
  hitDie: number;
  savingThrows: AbilityName[];
  skillChoices: SkillName[]; // Skills this class CAN choose from
  numSkills: number;         // How many to auto-pick
  armor: string[];
  weapons: string[];
  tools: string[];
  features: { name: string; description: string; source: 'class' | 'race'; isPassive: boolean }[];
  startingEquipment: string[];
  startingGold: number;
  isCaster: boolean;
  castingAbility?: AbilityName;
  cantripsKnown?: number;
  spellsKnown?: number;
  spellSlots?: { level: number; total: number }[];
  startingCantrips?: { name: string; school: string; damage?: string; description: string }[];
  startingSpells?: { name: string; level: number; school: string; description: string; damage?: string; castingTime: string; range: string; duration: string }[];
  speed: number;
}

const CLASS_DATA: Record<string, ClassData> = {
  barbarian: {
    hitDie: 12, savingThrows: ['str', 'con'],
    skillChoices: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    numSkills: 2, armor: ['Light armor', 'Medium armor', 'Shields'], weapons: ['Simple weapons', 'Martial weapons'], tools: [],
    features: [
      { name: 'Rage', description: 'Enter a battle fury for bonus damage and resistance. 2 uses per long rest.', source: 'class', isPassive: false },
      { name: 'Unarmored Defense', description: 'While not wearing armor, AC = 10 + DEX modifier + CON modifier.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Greataxe', 'Handaxe ×2', 'Explorer\'s Pack', 'Javelin ×4'],
    startingGold: 10, isCaster: false, speed: 30,
  },
  bard: {
    hitDie: 8, savingThrows: ['dex', 'cha'],
    skillChoices: ALL_SKILLS, numSkills: 3,
    armor: ['Light armor'], weapons: ['Simple weapons', 'Hand crossbow', 'Longsword', 'Rapier', 'Shortsword'],
    tools: ['Lute', 'Two other musical instruments'],
    features: [
      { name: 'Bardic Inspiration', description: 'Grant an ally a d6 bonus die. Uses equal to CHA modifier per long rest.', source: 'class', isPassive: false },
      { name: 'Spellcasting', description: 'Cast spells using Charisma as your spellcasting ability.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Rapier', 'Leather armor', 'Diplomat\'s Pack', 'Lute'],
    startingGold: 15, isCaster: true, castingAbility: 'cha', cantripsKnown: 2, spellsKnown: 4,
    spellSlots: [{ level: 1, total: 2 }],
    startingCantrips: [
      { name: 'Vicious Mockery', school: 'Enchantment', damage: '1d4 psychic', description: 'A string of insults laced with subtle enchantments. Target makes WIS save or takes damage and has disadvantage on next attack.' },
      { name: 'Minor Illusion', school: 'Illusion', description: 'Create a sound or image of an object within range lasting 1 minute.' },
    ],
    startingSpells: [
      { name: 'Healing Word', level: 1, school: 'Evocation', description: 'Heal a creature you can see within 60 feet for 1d4 + CHA modifier HP as a bonus action.', castingTime: 'Bonus action', range: '60 feet', duration: 'Instantaneous' },
      { name: 'Thunderwave', level: 1, school: 'Evocation', damage: '2d8 thunder', description: 'A wave of thunderous force sweeps out. Creatures in 15ft cube make CON save or take damage and are pushed 10 feet.', castingTime: '1 action', range: 'Self (15ft cube)', duration: 'Instantaneous' },
      { name: 'Charm Person', level: 1, school: 'Enchantment', description: 'Charm a humanoid you can see within range. It regards you as a friendly acquaintance.', castingTime: '1 action', range: '30 feet', duration: '1 hour' },
      { name: 'Dissonant Whispers', level: 1, school: 'Enchantment', damage: '3d6 psychic', description: 'Whisper a discordant melody. Target makes WIS save or takes damage and must use reaction to move away.', castingTime: '1 action', range: '60 feet', duration: 'Instantaneous' },
    ],
    speed: 30,
  },
  cleric: {
    hitDie: 8, savingThrows: ['wis', 'cha'],
    skillChoices: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    numSkills: 2, armor: ['Light armor', 'Medium armor', 'Shields'], weapons: ['Simple weapons'], tools: [],
    features: [
      { name: 'Spellcasting', description: 'Cast divine spells using Wisdom as your spellcasting ability. Prepare spells from the full cleric list each day.', source: 'class', isPassive: true },
      { name: 'Divine Domain', description: 'Choose a domain that grants bonus spells and features at 1st level.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Mace', 'Scale mail', 'Shield', 'Priest\'s Pack', 'Holy symbol'],
    startingGold: 15, isCaster: true, castingAbility: 'wis', cantripsKnown: 3, spellsKnown: 4,
    spellSlots: [{ level: 1, total: 2 }],
    startingCantrips: [
      { name: 'Sacred Flame', school: 'Evocation', damage: '1d8 radiant', description: 'Flame-like radiance descends on a creature. DEX save or take damage. No cover bonus.' },
      { name: 'Guidance', school: 'Divination', description: 'Touch a willing creature. Once before the spell ends, they can add 1d4 to one ability check.' },
      { name: 'Light', school: 'Evocation', description: 'Touch an object. It sheds bright light in a 20-foot radius for 1 hour.' },
    ],
    startingSpells: [
      { name: 'Cure Wounds', level: 1, school: 'Evocation', description: 'Touch a creature to restore 1d8 + WIS modifier hit points.', castingTime: '1 action', range: 'Touch', duration: 'Instantaneous' },
      { name: 'Bless', level: 1, school: 'Enchantment', description: 'Up to 3 creatures add 1d4 to attack rolls and saving throws for 1 minute.', castingTime: '1 action', range: '30 feet', duration: '1 minute (concentration)' },
      { name: 'Shield of Faith', level: 1, school: 'Abjuration', description: 'A shimmering field grants +2 AC to a creature within range for 10 minutes.', castingTime: 'Bonus action', range: '60 feet', duration: '10 minutes (concentration)' },
      { name: 'Guiding Bolt', level: 1, school: 'Evocation', damage: '4d6 radiant', description: 'A flash of light streaks toward a creature. On hit, next attack against target has advantage.', castingTime: '1 action', range: '120 feet', duration: '1 round' },
    ],
    speed: 30,
  },
  druid: {
    hitDie: 8, savingThrows: ['int', 'wis'],
    skillChoices: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    numSkills: 2, armor: ['Light armor', 'Medium armor', 'Shields (non-metal)'], weapons: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'], tools: ['Herbalism Kit'],
    features: [
      { name: 'Druidic', description: 'You know Druidic, the secret language of druids. You can leave hidden messages.', source: 'class', isPassive: true },
      { name: 'Spellcasting', description: 'Cast nature spells using Wisdom. Prepare spells from the full druid list each day.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Wooden shield', 'Scimitar', 'Leather armor', 'Explorer\'s Pack', 'Druidic focus'],
    startingGold: 10, isCaster: true, castingAbility: 'wis', cantripsKnown: 2, spellsKnown: 4,
    spellSlots: [{ level: 1, total: 2 }],
    startingCantrips: [
      { name: 'Druidcraft', school: 'Transmutation', description: 'Create a tiny, harmless sensory effect that predicts weather, bloom a flower, or snuff a small flame.' },
      { name: 'Produce Flame', school: 'Conjuration', damage: '1d8 fire', description: 'A flickering flame appears in your hand. You can hurl it as a ranged spell attack.' },
    ],
    startingSpells: [
      { name: 'Healing Word', level: 1, school: 'Evocation', description: 'Heal a creature within 60 feet for 1d4 + WIS modifier as a bonus action.', castingTime: 'Bonus action', range: '60 feet', duration: 'Instantaneous' },
      { name: 'Entangle', level: 1, school: 'Conjuration', description: 'Grasping weeds and vines sprout in a 20-foot square. Creatures must make STR save or be restrained.', castingTime: '1 action', range: '90 feet', duration: '1 minute (concentration)' },
      { name: 'Thunderwave', level: 1, school: 'Evocation', damage: '2d8 thunder', description: 'A wave of thunderous force. Creatures in 15ft cube make CON save or take damage and are pushed.', castingTime: '1 action', range: 'Self (15ft cube)', duration: 'Instantaneous' },
      { name: 'Faerie Fire', level: 1, school: 'Evocation', description: 'Objects and creatures in a 20-foot cube are outlined in blue, green, or violet light. Attacks against them have advantage.', castingTime: '1 action', range: '60 feet', duration: '1 minute (concentration)' },
    ],
    speed: 30,
  },
  fighter: {
    hitDie: 10, savingThrows: ['str', 'con'],
    skillChoices: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    numSkills: 2, armor: ['All armor', 'Shields'], weapons: ['Simple weapons', 'Martial weapons'], tools: [],
    features: [
      { name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty (Defense: +1 AC while wearing armor).', source: 'class', isPassive: true },
      { name: 'Second Wind', description: 'On your turn, use a bonus action to regain 1d10 + fighter level HP. Recharges on short rest.', source: 'class', isPassive: false },
    ],
    startingEquipment: ['Chain mail', 'Longsword', 'Shield', 'Light crossbow', 'Bolts ×20', 'Dungeoneer\'s Pack'],
    startingGold: 15, isCaster: false, speed: 30,
  },
  monk: {
    hitDie: 8, savingThrows: ['str', 'dex'],
    skillChoices: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    numSkills: 2, armor: [], weapons: ['Simple weapons', 'Shortsword'], tools: ["Artisan's tools or musical instrument"],
    features: [
      { name: 'Unarmored Defense', description: 'While not wearing armor, AC = 10 + DEX modifier + WIS modifier.', source: 'class', isPassive: true },
      { name: 'Martial Arts', description: 'Use DEX for unarmed strikes and monk weapons. Unarmed strikes deal 1d4. Bonus action unarmed strike when you attack.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Shortsword', 'Dart ×10', 'Explorer\'s Pack'],
    startingGold: 5, isCaster: false, speed: 30,
  },
  paladin: {
    hitDie: 10, savingThrows: ['wis', 'cha'],
    skillChoices: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    numSkills: 2, armor: ['All armor', 'Shields'], weapons: ['Simple weapons', 'Martial weapons'], tools: [],
    features: [
      { name: 'Divine Sense', description: 'Detect the presence of celestial, fiend, or undead within 60 feet. Uses: 1 + CHA modifier per long rest.', source: 'class', isPassive: false },
      { name: 'Lay on Hands', description: 'Heal by touch from a pool of 5 × paladin level HP. Can cure diseases or neutralize poison (5 HP per use).', source: 'class', isPassive: false },
    ],
    startingEquipment: ['Chain mail', 'Longsword', 'Shield', 'Javelin ×5', 'Priest\'s Pack', 'Holy symbol'],
    startingGold: 15, isCaster: false, speed: 30, // Paladins get spells at level 2
  },
  ranger: {
    hitDie: 10, savingThrows: ['str', 'dex'],
    skillChoices: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    numSkills: 3, armor: ['Light armor', 'Medium armor', 'Shields'], weapons: ['Simple weapons', 'Martial weapons'], tools: [],
    features: [
      { name: 'Favored Enemy', description: 'You have advantage on Survival checks to track your chosen enemies and on Intelligence checks to recall information about them.', source: 'class', isPassive: true },
      { name: 'Natural Explorer', description: 'You are adept at traveling and surviving in your chosen terrain. Double proficiency on INT/WIS checks related to it.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Scale mail', 'Longbow', 'Arrows ×20', 'Shortsword ×2', 'Explorer\'s Pack'],
    startingGold: 10, isCaster: false, speed: 30, // Rangers get spells at level 2
  },
  rogue: {
    hitDie: 8, savingThrows: ['dex', 'int'],
    skillChoices: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
    numSkills: 4, armor: ['Light armor'], weapons: ['Simple weapons', 'Hand crossbow', 'Longsword', 'Rapier', 'Shortsword'], tools: ['Thieves\' tools'],
    features: [
      { name: 'Expertise', description: 'Double your proficiency bonus for two skill proficiencies of your choice.', source: 'class', isPassive: true },
      { name: 'Sneak Attack', description: 'Deal an extra 1d6 damage when you hit with a finesse/ranged weapon and have advantage or an ally within 5 feet of the target.', source: 'class', isPassive: true },
      { name: 'Thieves\' Cant', description: 'You know thieves\' cant, a secret mix of dialect, jargon, and code for hidden messages.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Rapier', 'Shortbow', 'Arrows ×20', 'Leather armor', 'Thieves\' tools', 'Burglar\'s Pack', 'Dagger ×2'],
    startingGold: 10, isCaster: false, speed: 30,
  },
  sorcerer: {
    hitDie: 6, savingThrows: ['con', 'cha'],
    skillChoices: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    numSkills: 2, armor: [], weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'], tools: [],
    features: [
      { name: 'Spellcasting', description: 'Cast arcane spells using Charisma as your spellcasting ability.', source: 'class', isPassive: true },
      { name: 'Sorcerous Origin', description: 'Your innate magic comes from a particular origin that grants you features.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Light crossbow', 'Bolts ×20', 'Arcane focus', 'Dungeoneer\'s Pack', 'Dagger ×2'],
    startingGold: 10, isCaster: true, castingAbility: 'cha', cantripsKnown: 4, spellsKnown: 2,
    spellSlots: [{ level: 1, total: 2 }],
    startingCantrips: [
      { name: 'Fire Bolt', school: 'Evocation', damage: '1d10 fire', description: 'Hurl a mote of fire at a creature or object. Ranged spell attack.' },
      { name: 'Prestidigitation', school: 'Transmutation', description: 'Perform minor magical tricks: light, clean, warm, flavor, mark, or create a small trinket.' },
      { name: 'Mage Hand', school: 'Conjuration', description: 'A spectral floating hand appears. It can manipulate objects, open doors, or retrieve items up to 30 feet away.' },
      { name: 'Ray of Frost', school: 'Evocation', damage: '1d8 cold', description: 'A frigid beam of blue-white light streaks toward a creature. On hit, speed reduced by 10 feet.' },
    ],
    startingSpells: [
      { name: 'Magic Missile', level: 1, school: 'Evocation', damage: '3×1d4+1 force', description: 'Three glowing darts of magical force automatically hit and deal damage.', castingTime: '1 action', range: '120 feet', duration: 'Instantaneous' },
      { name: 'Shield', level: 1, school: 'Abjuration', description: 'Reaction: +5 AC until start of your next turn, including against the triggering attack.', castingTime: 'Reaction', range: 'Self', duration: '1 round' },
    ],
    speed: 30,
  },
  warlock: {
    hitDie: 8, savingThrows: ['wis', 'cha'],
    skillChoices: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    numSkills: 2, armor: ['Light armor'], weapons: ['Simple weapons'], tools: [],
    features: [
      { name: 'Pact Magic', description: 'Cast spells using Charisma. Spell slots recharge on short rest. You know 2 spells and 2 cantrips.', source: 'class', isPassive: true },
      { name: 'Otherworldly Patron', description: 'You have struck a bargain with an otherworldly being that grants you magical powers.', source: 'class', isPassive: true },
    ],
    startingEquipment: ['Light crossbow', 'Bolts ×20', 'Arcane focus', 'Scholar\'s Pack', 'Leather armor', 'Dagger ×2'],
    startingGold: 10, isCaster: true, castingAbility: 'cha', cantripsKnown: 2, spellsKnown: 2,
    spellSlots: [{ level: 1, total: 1 }],
    startingCantrips: [
      { name: 'Eldritch Blast', school: 'Evocation', damage: '1d10 force', description: 'A beam of crackling energy streaks toward a creature. The warlock\'s signature spell.' },
      { name: 'Minor Illusion', school: 'Illusion', description: 'Create a sound or image of an object within range lasting 1 minute.' },
    ],
    startingSpells: [
      { name: 'Hex', level: 1, school: 'Enchantment', damage: '1d6 necrotic (extra)', description: 'Curse a creature. Your attacks deal extra necrotic damage and it has disadvantage on one ability check type.', castingTime: 'Bonus action', range: '90 feet', duration: '1 hour (concentration)' },
      { name: 'Hellish Rebuke', level: 1, school: 'Evocation', damage: '2d10 fire', description: 'Reaction when damaged: the attacker is engulfed in flames. DEX save for half damage.', castingTime: 'Reaction', range: '60 feet', duration: 'Instantaneous' },
    ],
    speed: 30,
  },
  wizard: {
    hitDie: 6, savingThrows: ['int', 'wis'],
    skillChoices: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    numSkills: 2, armor: [], weapons: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'], tools: [],
    features: [
      { name: 'Spellcasting', description: 'Cast arcane spells using Intelligence. You maintain a spellbook with your known spells.', source: 'class', isPassive: true },
      { name: 'Arcane Recovery', description: 'Once per day during a short rest, recover spell slots with a combined level equal to half your wizard level (rounded up).', source: 'class', isPassive: false },
    ],
    startingEquipment: ['Quarterstaff', 'Arcane focus', 'Scholar\'s Pack', 'Spellbook'],
    startingGold: 10, isCaster: true, castingAbility: 'int', cantripsKnown: 3, spellsKnown: 6,
    spellSlots: [{ level: 1, total: 2 }],
    startingCantrips: [
      { name: 'Fire Bolt', school: 'Evocation', damage: '1d10 fire', description: 'Hurl a mote of fire at a creature or object. Ranged spell attack.' },
      { name: 'Mage Hand', school: 'Conjuration', description: 'A spectral floating hand appears that can manipulate objects up to 30 feet away.' },
      { name: 'Prestidigitation', school: 'Transmutation', description: 'Perform minor magical tricks: light, clean, warm, flavor, mark, or trinket.' },
    ],
    startingSpells: [
      { name: 'Magic Missile', level: 1, school: 'Evocation', damage: '3×1d4+1 force', description: 'Three glowing darts of magical force automatically hit.', castingTime: '1 action', range: '120 feet', duration: 'Instantaneous' },
      { name: 'Shield', level: 1, school: 'Abjuration', description: 'Reaction: +5 AC until start of your next turn.', castingTime: 'Reaction', range: 'Self', duration: '1 round' },
      { name: 'Mage Armor', level: 1, school: 'Abjuration', description: 'Touch a willing creature not wearing armor. Its AC becomes 13 + DEX modifier for 8 hours.', castingTime: '1 action', range: 'Touch', duration: '8 hours' },
      { name: 'Detect Magic', level: 1, school: 'Divination', description: 'Sense the presence of magic within 30 feet. You can see a faint aura around any visible magical creature or object.', castingTime: '1 action', range: 'Self (30ft)', duration: '10 minutes (concentration)' },
      { name: 'Sleep', level: 1, school: 'Enchantment', description: 'Roll 5d8; that many HP of creatures within 20 feet of a point fall unconscious, starting with lowest HP.', castingTime: '1 action', range: '90 feet', duration: '1 minute' },
      { name: 'Thunderwave', level: 1, school: 'Evocation', damage: '2d8 thunder', description: 'A wave of thunderous force sweeps out. CON save or take damage and pushed 10 feet.', castingTime: '1 action', range: 'Self (15ft cube)', duration: 'Instantaneous' },
    ],
    speed: 30,
  },
};

// ── Race bonuses ───────────────────────────────────────────────────
const RACE_DATA: Record<string, { abilityBonuses: Partial<Record<AbilityName, number>>; speed: number; languages: string[]; traits: { name: string; description: string }[] }> = {
  human:      { abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, languages: ['Common', 'One extra language'], traits: [] },
  elf:        { abilityBonuses: { dex: 2 }, speed: 30, languages: ['Common', 'Elvish'], traits: [{ name: 'Darkvision', description: 'See in dim light within 60 feet as bright light, and darkness as dim light.' }, { name: 'Fey Ancestry', description: 'Advantage on saving throws against being charmed, and magic can\'t put you to sleep.' }, { name: 'Trance', description: 'You don\'t need to sleep. You meditate for 4 hours to gain the benefit of a long rest.' }] },
  dwarf:      { abilityBonuses: { con: 2 }, speed: 25, languages: ['Common', 'Dwarvish'], traits: [{ name: 'Darkvision', description: 'See in dim light within 60 feet as bright light.' }, { name: 'Dwarven Resilience', description: 'Advantage on saving throws against poison, and resistance against poison damage.' }, { name: 'Stonecunning', description: 'Whenever you make a History check related to stonework, add double your proficiency bonus.' }] },
  halfling:   { abilityBonuses: { dex: 2 }, speed: 25, languages: ['Common', 'Halfling'], traits: [{ name: 'Lucky', description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll and must use the new roll.' }, { name: 'Brave', description: 'You have advantage on saving throws against being frightened.' }, { name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is larger than you.' }] },
  gnome:      { abilityBonuses: { int: 2 }, speed: 25, languages: ['Common', 'Gnomish'], traits: [{ name: 'Darkvision', description: 'See in dim light within 60 feet as bright light.' }, { name: 'Gnome Cunning', description: 'Advantage on INT, WIS, and CHA saving throws against magic.' }] },
  'half-elf': { abilityBonuses: { cha: 2, dex: 1, con: 1 }, speed: 30, languages: ['Common', 'Elvish', 'One extra language'], traits: [{ name: 'Darkvision', description: 'See in dim light within 60 feet as bright light.' }, { name: 'Fey Ancestry', description: 'Advantage on saves against being charmed, and magic can\'t put you to sleep.' }] },
  'half-orc':  { abilityBonuses: { str: 2, con: 1 }, speed: 30, languages: ['Common', 'Orc'], traits: [{ name: 'Darkvision', description: 'See in dim light within 60 feet as bright light.' }, { name: 'Relentless Endurance', description: 'When reduced to 0 HP but not killed, you drop to 1 HP instead. Once per long rest.' }, { name: 'Savage Attacks', description: 'When you score a critical hit with a melee weapon, roll one additional weapon damage die.' }] },
  dragonborn: { abilityBonuses: { str: 2, cha: 1 }, speed: 30, languages: ['Common', 'Draconic'], traits: [{ name: 'Breath Weapon', description: 'Exhale destructive energy in a 15ft cone or 30ft line. 2d6 damage (type based on ancestry). CON save for half. Recharges on short rest.' }, { name: 'Damage Resistance', description: 'You have resistance to the damage type associated with your draconic ancestry.' }] },
  tiefling:   { abilityBonuses: { int: 1, cha: 2 }, speed: 30, languages: ['Common', 'Infernal'], traits: [{ name: 'Darkvision', description: 'See in dim light within 60 feet as bright light.' }, { name: 'Hellish Resistance', description: 'You have resistance to fire damage.' }, { name: 'Infernal Legacy', description: 'You know the Thaumaturgy cantrip. At 3rd level, cast Hellish Rebuke once per long rest.' }] },
};

function buildCharacterFromInput(input: CharacterCreationInput, worldId: string): Character {
  const classKey = input.class?.toLowerCase() ?? 'fighter';
  const raceKey = input.race?.toLowerCase() ?? 'human';
  const classData = CLASS_DATA[classKey] ?? CLASS_DATA.fighter;
  const raceData = RACE_DATA[raceKey] ?? RACE_DATA.human;

  // Base scores from input (or defaults)
  const baseScores = input.abilityScores ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  // Apply racial bonuses
  const makeScore = (ability: AbilityName) => {
    const base = baseScores[ability];
    const racialBonus = raceData.abilityBonuses[ability] ?? 0;
    const score = base + racialBonus;
    return {
      base,
      racialBonus,
      itemBonus: 0,
      score,
      modifier: Math.floor((score - 10) / 2),
    };
  };

  const abilityScores = {
    str: makeScore('str'), dex: makeScore('dex'), con: makeScore('con'),
    int: makeScore('int'), wis: makeScore('wis'), cha: makeScore('cha'),
  };

  const getMod = (a: AbilityName) => abilityScores[a].modifier;
  const profBonus = 2;

  // ── Skills ─────────────────────────────────────────────────────
  const proficientSkills = new Set<SkillName>();
  // Auto-pick skills from class choices
  const choices = [...classData.skillChoices];
  for (let i = 0; i < classData.numSkills && choices.length > 0; i++) {
    const idx = Math.floor(Math.random() * choices.length);
    proficientSkills.add(choices[idx]);
    choices.splice(idx, 1);
  }
  // Perception is always useful — ensure at least one awareness skill
  if (!proficientSkills.has('perception') && !proficientSkills.has('insight') && proficientSkills.size < classData.numSkills + 1) {
    proficientSkills.add('perception');
  }

  const skills: Skill[] = ALL_SKILLS.map((name) => {
    const ability = SKILL_ABILITIES[name];
    const proficient = proficientSkills.has(name);
    return {
      name,
      ability,
      proficient,
      expertise: false,
      bonus: getMod(ability) + (proficient ? profBonus : 0),
    };
  });

  // Rogue expertise: mark first two proficient skills
  if (classKey === 'rogue') {
    let expertiseCount = 0;
    for (const skill of skills) {
      if (skill.proficient && expertiseCount < 2) {
        skill.expertise = true;
        skill.bonus += profBonus; // Double proficiency
        expertiseCount++;
      }
    }
  }

  // ── Saving Throws ──────────────────────────────────────────────
  const savingThrows: SavingThrow[] = ALL_ABILITIES.map((ability) => {
    const proficient = classData.savingThrows.includes(ability);
    return {
      ability,
      proficient,
      bonus: getMod(ability) + (proficient ? profBonus : 0),
    };
  });

  // ── Features ───────────────────────────────────────────────────
  const features: ClassFeature[] = [];

  // Class features
  classData.features.forEach((f, i) => {
    features.push({
      id: `class-${classKey}-${i}`,
      name: f.name,
      source: f.source,
      level: 1,
      description: f.description,
      isPassive: f.isPassive,
      ...(f.isPassive ? {} : { uses: { max: 2, remaining: 2, rechargeOn: 'long-rest' as const } }),
    });
  });

  // Racial traits
  raceData.traits.forEach((t, i) => {
    features.push({
      id: `race-${raceKey}-${i}`,
      name: t.name,
      source: 'race',
      level: 1,
      description: t.description,
      isPassive: true,
    });
  });

  // ── Proficiencies ──────────────────────────────────────────────
  const languages = [...raceData.languages];
  if (!languages.includes('Common')) languages.unshift('Common');

  // ── HP ─────────────────────────────────────────────────────────
  const conMod = getMod('con');
  const maxHP = classData.hitDie + conMod;

  // ── AC ─────────────────────────────────────────────────────────
  let armorClass = 10 + getMod('dex');
  if (classKey === 'barbarian') armorClass = 10 + getMod('dex') + getMod('con');
  else if (classKey === 'monk') armorClass = 10 + getMod('dex') + getMod('wis');
  else if (['fighter', 'paladin', 'cleric'].includes(classKey)) armorClass = 16; // Chain mail
  else if (['ranger', 'druid'].includes(classKey)) armorClass = 14 + Math.min(2, getMod('dex')); // Scale mail
  else if (['rogue', 'bard', 'warlock'].includes(classKey)) armorClass = 11 + getMod('dex'); // Leather

  // ── Speed ──────────────────────────────────────────────────────
  const speed = raceData.speed;

  // ── Spellcasting ───────────────────────────────────────────────
  let spellcasting: Spellcasting | undefined;
  if (classData.isCaster && classData.castingAbility) {
    const castMod = getMod(classData.castingAbility);
    const cantrips: Spell[] = (classData.startingCantrips ?? []).map((c, i) => ({
      id: `cantrip-${i}`,
      name: c.name,
      level: 0,
      school: c.school,
      castingTime: '1 action',
      range: '60 feet',
      components: 'V, S',
      duration: 'Instantaneous',
      description: c.description,
      damage: c.damage,
      isPrepared: true,
      isRitual: false,
    }));
    const knownSpells: Spell[] = (classData.startingSpells ?? []).map((s, i) => ({
      id: `spell-${i}`,
      name: s.name,
      level: s.level,
      school: s.school,
      castingTime: s.castingTime,
      range: s.range,
      components: 'V, S',
      duration: s.duration,
      description: s.description,
      damage: s.damage,
      isPrepared: true,
      isRitual: false,
    }));
    spellcasting = {
      ability: classData.castingAbility,
      spellSaveDC: 8 + profBonus + castMod,
      spellAttackBonus: profBonus + castMod,
      spellSlots: (classData.spellSlots ?? []).map(s => ({ ...s, remaining: s.total })),
      knownSpells,
      preparedSpells: knownSpells.map(s => s.id),
      cantrips,
    };
  }

  // ── Mana (for casters) ─────────────────────────────────────────
  const mana = classData.isCaster ? { current: 4, max: 4 } : undefined;

  return {
    id: crypto.randomUUID(),
    worldId,
    userId: '',
    name: input.name,
    race: input.race,
    class: input.class,
    subclass: undefined,
    level: 1,
    xp: 0,
    xpToNextLevel: 300,
    abilityScores,
    hitPoints: {
      current: maxHP,
      max: maxHP,
      temporary: 0,
      hitDice: { total: 1, remaining: 1, dieType: classData.hitDie },
    },
    mana,
    armorClass,
    initiative: getMod('dex'),
    speed,
    proficiencyBonus: profBonus,
    skills,
    savingThrows,
    passivePerception: 10 + getMod('wis') + (proficientSkills.has('perception') ? profBonus : 0),
    spellcasting,
    features,
    proficiencies: {
      armor: classData.armor,
      weapons: classData.weapons,
      tools: classData.tools,
      languages,
    },
    equipment: {},
    inventory: classData.startingEquipment,
    gold: classData.startingGold,
    carryWeight: 0,
    carryCapacity: abilityScores.str.score * 15,
    encumbrance: 'light',
    conditions: [],
    exhaustionLevel: 0,
    deathSaves: { successes: 0, failures: 0 },
    isAlive: true,
    isRetired: false,
    personality: input.personality ?? { traits: [], ideal: '', bond: '', flaw: '' },
    background: input.background ?? 'adventurer',
    alignment: 'true-neutral',
    appearance: input.appearance ?? '',
    creationMode: input.creationMode ?? 'questionnaire',
    companionIds: [],
    currentLocation: 'Unknown',
    playTimeMinutes: 0,
    sessionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  let body: AssembleRequest;
  try {
    body = (await request.json()) as AssembleRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { character: charInput, userId, accumulated } = body;

  if (!charInput?.name || !charInput?.race || !charInput?.class) {
    return NextResponse.json(
      { error: 'Character must have name, race, and class' },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (!accumulated || Object.keys(accumulated).length === 0) {
    return NextResponse.json({ error: 'No accumulated world data provided' }, { status: 400 });
  }

  try {
    console.log('[WorldGenesis:Assemble] Building world record...');

    const worldRecord = {
      ...accumulated,
      id: crypto.randomUUID(),
      characterId: 'pending',
      createdAt: new Date().toISOString(),
    } as WorldRecord;

    // Save World to Supabase
    let worldRow;
    try {
      worldRow = await createWorld(userId, worldRecord);
    } catch (dbError) {
      console.warn('[WorldGenesis:Assemble] Supabase world save failed, continuing local-only:', dbError);
      worldRow = { id: worldRecord.id };
    }

    // Build Character record
    const character = buildCharacterFromInput(charInput, worldRow.id);
    character.userId = userId;
    worldRecord.characterId = character.id;

    let characterRow;
    try {
      characterRow = await createCharacter(userId, worldRow.id, character);
    } catch (dbError) {
      console.warn('[WorldGenesis:Assemble] Character save failed, continuing local-only:', dbError);
      characterRow = { id: character.id };
    }

    console.log('[WorldGenesis:Assemble] Complete! World:', worldRecord.worldName);

    return NextResponse.json({
      worldId: worldRow.id,
      characterId: characterRow.id,
      world: worldRecord,
      character,
      worldSummary: {
        name: worldRecord.worldName,
        type: worldRecord.worldType,
        genre: worldRecord.primaryGenre,
        tone: worldRecord.narrativeTone,
        threat: worldRecord.mainThreat?.name,
        villain: worldRecord.villainCore?.name,
      },
    });
  } catch (error) {
    console.error('[WorldGenesis:Assemble] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assemble world' },
      { status: 500 }
    );
  }
}
