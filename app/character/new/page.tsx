'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CharacterRace,
  CharacterClass,
  BackgroundType,
  AbilityScoreMethod,
  CharacterCreationInput,
} from '@/lib/types/character';

import RaceSelector from '@/components/character/RaceSelector';
import ClassSelector from '@/components/character/ClassSelector';
import AbilityScoreRoller from '@/components/character/AbilityScoreRoller';
import BackgroundSelector from '@/components/character/BackgroundSelector';
import CharacterPreview from '@/components/character/CharacterPreview';
import WorldGenLoading from '@/components/character/WorldGenLoading';

const STEPS = [
  { label: 'Race', icon: '🧝' },
  { label: 'Class', icon: '⚔️' },
  { label: 'Abilities', icon: '🎲' },
  { label: 'Background', icon: '📜' },
  { label: 'Finalize', icon: '✨' },
];

// Recommended classes per race for the highlight feature
const RACE_CLASS_RECOMMENDATIONS: Partial<Record<string, string[]>> = {
  human: ['warrior', 'rogue', 'paladin'],
  elf: ['mage', 'ranger', 'druid'],
  dwarf: ['warrior', 'cleric', 'artificer'],
  halfling: ['rogue', 'bard', 'ranger'],
  gnome: ['mage', 'artificer', 'bard'],
  'half-elf': ['bard', 'warlock', 'ranger'],
  'half-orc': ['warrior', 'blood-mage', 'ranger'],
  tiefling: ['warlock', 'rogue', 'bard'],
  dragonborn: ['paladin', 'warrior', 'cleric'],
  orc: ['warrior', 'blood-mage', 'druid'],
  goblin: ['rogue', 'artificer', 'ranger'],
  goliath: ['warrior', 'monk', 'druid'],
  firbolg: ['druid', 'cleric', 'ranger'],
  tabaxi: ['rogue', 'monk', 'ranger'],
  kenku: ['rogue', 'bard', 'monk'],
  aasimar: ['paladin', 'cleric', 'warlock'],
  changeling: ['rogue', 'bard', 'warlock'],
  warforged: ['warrior', 'artificer', 'paladin'],
};

export default function NewCharacter() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [race, setRace] = useState<CharacterRace | null>(null);
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);
  const [abilityScores, setAbilityScores] = useState({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  });
  const [abilityMethod, setAbilityMethod] = useState<AbilityScoreMethod>('roll');
  const [background, setBackground] = useState<BackgroundType | null>(null);
  const [personality, setPersonality] = useState({
    traits: [] as string[],
    ideal: '',
    bond: '',
    flaw: '',
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [storyHook, setStoryHook] = useState('');

  // Validation per step
  const isStepValid = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0: return race !== null;
        case 1: return characterClass !== null;
        case 2: {
          const total = Object.values(abilityScores).reduce((a, b) => a + b, 0);
          return total > 48; // Must be higher than all-8s default
        }
        case 3: return background !== null;
        case 4: return name.trim().length >= 2;
        default: return false;
      }
    },
    [race, characterClass, abilityScores, background, name]
  );

  const handleNext = () => {
    if (step < STEPS.length - 1 && isStepValid(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleBeginAdventure = () => {
    if (!isStepValid(4)) return;
    setGenerating(true);
  };

  // Build the CharacterCreationInput for the API
  const buildCreationInput = (): CharacterCreationInput => ({
    name: name.trim(),
    race: race!,
    class: characterClass!,
    background: background!,
    abilityScoreMethod: abilityMethod,
    abilityScores,
    personality: personality.traits.length > 0 || personality.ideal
      ? personality
      : undefined,
    appearance: description || undefined,
    playerSentence: storyHook || undefined,
    creationMode: 'builder',
  });

  // If generating, show the world gen loading screen
  if (generating) {
    return <WorldGenLoading character={buildCreationInput()} storyHook={storyHook} />;
  }

  const recommendedClasses = race
    ? RACE_CLASS_RECOMMENDATIONS[race] || []
    : [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-sky-400">
            Create Your Character
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => {
                  // Allow clicking on completed steps
                  if (i < step) setStep(i);
                }}
                disabled={i > step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  i === step
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : i < step
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-pointer hover:bg-green-500/20'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                <span>{i < step ? '✓' : s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px mx-1 ${i < step ? 'bg-green-500/40' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-10">
          {step === 0 && <RaceSelector selected={race} onSelect={setRace} />}
          {step === 1 && (
            <ClassSelector
              selected={characterClass}
              onSelect={setCharacterClass}
              recommendedClasses={recommendedClasses}
            />
          )}
          {step === 2 && (
            <AbilityScoreRoller
              scores={abilityScores}
              onScoresChange={setAbilityScores}
              method={abilityMethod}
              onMethodChange={setAbilityMethod}
            />
          )}
          {step === 3 && (
            <BackgroundSelector
              selectedBackground={background}
              onBackgroundSelect={setBackground}
              personality={personality}
              onPersonalityChange={setPersonality}
            />
          )}
          {step === 4 && (
            <CharacterPreview
              name={name}
              onNameChange={setName}
              description={description}
              onDescriptionChange={setDescription}
              storyHook={storyHook}
              onStoryHookChange={setStoryHook}
              race={race}
              characterClass={characterClass}
              background={background}
              abilityScores={abilityScores}
              personality={personality}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <button
            onClick={step === 0 ? () => router.push('/') : handleBack}
            className="px-6 py-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            {step === 0 ? '← Home' : '← Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(step)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                isStepValid(step)
                  ? 'bg-sky-600 hover:bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleBeginAdventure}
              disabled={!isStepValid(4)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                isStepValid(4)
                  ? 'bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-400 hover:to-sky-400 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              ✨ Begin Adventure
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
