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
import type { WorldDefinition } from '@/lib/data/world-types';

import WorldSelector from '@/components/character/WorldSelector';
import RaceSelector from '@/components/character/RaceSelector';
import ClassSelector from '@/components/character/ClassSelector';
import AbilityScoreRoller from '@/components/character/AbilityScoreRoller';
import BackgroundSelector from '@/components/character/BackgroundSelector';
import CharacterPreview from '@/components/character/CharacterPreview';
import WorldGenLoading from '@/components/character/WorldGenLoading';

const STEPS = [
  { label: 'World', icon: '🌍' },
  { label: 'Origin', icon: '🧬' },
  { label: 'Class', icon: '⚔️' },
  { label: 'Abilities', icon: '🎲' },
  { label: 'Background', icon: '📜' },
  { label: 'Finalize', icon: '✨' },
];

export default function NewCharacter() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [selectedWorld, setSelectedWorld] = useState<WorldDefinition | null>(null);
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

  // When world changes, reset origin and class (they depend on world)
  const handleWorldSelect = useCallback((world: WorldDefinition) => {
    setSelectedWorld(world);
    setRace(null);
    setCharacterClass(null);
  }, []);

  // Validation per step
  const isStepValid = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0: return selectedWorld !== null;
        case 1: return race !== null;
        case 2: return characterClass !== null;
        case 3: {
          const total = Object.values(abilityScores).reduce((a, b) => a + b, 0);
          return total > 48; // Must be higher than all-8s default
        }
        case 4: return background !== null;
        case 5: return name.trim().length >= 2;
        default: return false;
      }
    },
    [selectedWorld, race, characterClass, abilityScores, background, name]
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
    if (!isStepValid(5)) return;
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
    worldType: selectedWorld?.id,
  });

  // If generating, show the world gen loading screen
  if (generating) {
    return <WorldGenLoading character={buildCreationInput()} storyHook={storyHook} />;
  }

  // Derived world data
  const originLabel = selectedWorld?.originLabel ?? 'Race';
  const classLabel = selectedWorld?.classLabel ?? 'Class';

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
            {selectedWorld && (
              <span className="ml-2 text-amber-400/80">
                — {selectedWorld.icon} {selectedWorld.name}
              </span>
            )}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-10 flex-wrap">
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
          {step === 0 && (
            <WorldSelector selected={selectedWorld} onSelect={handleWorldSelect} />
          )}
          {step === 1 && (
            <RaceSelector
              selected={race}
              onSelect={setRace}
              origins={selectedWorld?.origins}
              originLabel={selectedWorld?.originLabel}
            />
          )}
          {step === 2 && (
            <ClassSelector
              selected={characterClass}
              onSelect={setCharacterClass}
              classes={selectedWorld?.classes}
              classLabel={selectedWorld?.classLabel}
            />
          )}
          {step === 3 && (
            <AbilityScoreRoller
              scores={abilityScores}
              onScoresChange={setAbilityScores}
              method={abilityMethod}
              onMethodChange={setAbilityMethod}
            />
          )}
          {step === 4 && (
            <BackgroundSelector
              selectedBackground={background}
              onBackgroundSelect={setBackground}
              personality={personality}
              onPersonalityChange={setPersonality}
            />
          )}
          {step === 5 && (
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
              worldName={selectedWorld?.name}
              worldIcon={selectedWorld?.icon}
              originLabel={originLabel}
              classLabel={classLabel}
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
              disabled={!isStepValid(5)}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                isStepValid(5)
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
