'use client';

import { useState } from 'react';
import type { BackgroundType } from '@/lib/types/character';

interface PersonalityTraitsInput {
  traits: string[];
  ideal: string;
  bond: string;
  flaw: string;
}

interface BackgroundSelectorProps {
  selectedBackground: BackgroundType | null;
  onBackgroundSelect: (bg: BackgroundType) => void;
  personality: PersonalityTraitsInput;
  onPersonalityChange: (p: PersonalityTraitsInput) => void;
}

interface BackgroundDef {
  id: BackgroundType;
  name: string;
  icon: string;
  description: string;
  skillProficiencies: string;
  feature: string;
  suggestedTraits: string[];
  suggestedIdeals: string[];
  suggestedBonds: string[];
  suggestedFlaws: string[];
}

const BACKGROUNDS: BackgroundDef[] = [
  {
    id: 'soldier',
    name: 'Soldier',
    icon: '⚔️',
    description: 'You served in an army and know the discipline of military life.',
    skillProficiencies: 'Athletics, Intimidation',
    feature: 'Military Rank',
    suggestedTraits: [
      'I\'m always polite and respectful.',
      'I\'ve lost too many friends and am slow to make new ones.',
      'I can stare down a hell hound without flinching.',
      'I face problems head-on. A simple, direct solution is the best.',
    ],
    suggestedIdeals: ['Greater Good', 'Responsibility', 'Independence', 'Honor'],
    suggestedBonds: [
      'I fight for those who cannot fight for themselves.',
      'I\'ll never forget the fallen.',
      'Someone saved my life on the battlefield — I owe them.',
    ],
    suggestedFlaws: [
      'I obey the law, even if it causes misery.',
      'I\'d rather eat my armor than admit when I\'m wrong.',
      'My hatred of my enemies is blind and unreasoning.',
    ],
  },
  {
    id: 'criminal',
    name: 'Criminal',
    icon: '🗡️',
    description: 'You have a history of breaking the law and contacts in the underworld.',
    skillProficiencies: 'Deception, Stealth',
    feature: 'Criminal Contact',
    suggestedTraits: [
      'I always have a plan for what to do when things go wrong.',
      'I am always calm, no matter the situation.',
      'I would rather make a new friend than a new enemy.',
      'I blow up at the slightest insult.',
    ],
    suggestedIdeals: ['Honor among thieves', 'Freedom', 'Charity', 'Greed'],
    suggestedBonds: [
      'I\'m trying to pay off an old debt I owe.',
      'Someone I loved died because of a mistake I made.',
      'I\'m guilty of a terrible crime and seek redemption.',
    ],
    suggestedFlaws: [
      'When I see something valuable, I can\'t think about anything but how to steal it.',
      'I turn tail and run when things look bad.',
      'I have a "tell" that reveals when I\'m lying.',
    ],
  },
  {
    id: 'sage',
    name: 'Sage',
    icon: '📚',
    description: 'You spent years studying lore in a library, monastery, or academy.',
    skillProficiencies: 'Arcana, History',
    feature: 'Researcher',
    suggestedTraits: [
      'I use polysyllabic words that convey the impression of great erudition.',
      'I\'m used to helping out those who aren\'t as smart as I am.',
      'There\'s nothing I like more than a good mystery.',
      'I\'m convinced that people are always trying to steal my secrets.',
    ],
    suggestedIdeals: ['Knowledge', 'Beauty', 'Logic', 'Self-Improvement'],
    suggestedBonds: [
      'I have an ancient text that holds terrible secrets that must not fall into the wrong hands.',
      'I work to preserve a library, university, or the collected knowledge of an age.',
    ],
    suggestedFlaws: [
      'I am easily distracted by the promise of information.',
      'I overlook obvious solutions in favor of complicated ones.',
      'I speak without really thinking through my words, invariably insulting others.',
    ],
  },
  {
    id: 'noble',
    name: 'Noble',
    icon: '👑',
    description: 'You were born into wealth and privilege, with authority and connections.',
    skillProficiencies: 'History, Persuasion',
    feature: 'Position of Privilege',
    suggestedTraits: [
      'My eloquent flattery makes everyone I talk to feel important.',
      'Despite my noble birth, I do not place myself above other folk.',
      'If you do me an injury, I will crush you beneath my heel.',
    ],
    suggestedIdeals: ['Respect', 'Responsibility', 'Noble Obligation', 'Power'],
    suggestedBonds: [
      'I will face any challenge to win the approval of my family.',
      'My house\'s alliance with another noble family must be sustained at all costs.',
    ],
    suggestedFlaws: [
      'I secretly believe that everyone is beneath me.',
      'I hide a truly scandalous secret that could ruin my family forever.',
      'I too often hear veiled insults and threats in every word addressed to me.',
    ],
  },
  {
    id: 'outlander',
    name: 'Outlander',
    icon: '🏔️',
    description: 'You grew up in the wilds, far from civilization and its comforts.',
    skillProficiencies: 'Athletics, Survival',
    feature: 'Wanderer',
    suggestedTraits: [
      'I watch over my friends as if they were a litter of newborn pups.',
      'I feel far more comfortable around animals than people.',
      'I was, in fact, raised by wolves.',
    ],
    suggestedIdeals: ['Change', 'Honor', 'Nature', 'Glory'],
    suggestedBonds: [
      'My family, clan, or tribe is the most important thing in my life.',
      'An injury to the unspoiled wilderness of my home is an injury to me.',
    ],
    suggestedFlaws: [
      'I am slow to trust members of other races, tribes, and societies.',
      'Violence is my answer to almost every challenge.',
      'Don\'t expect me to save those who can\'t save themselves.',
    ],
  },
  {
    id: 'acolyte',
    name: 'Acolyte',
    icon: '🙏',
    description: 'You spent your life in service to a temple or religious order.',
    skillProficiencies: 'Insight, Religion',
    feature: 'Shelter of the Faithful',
    suggestedTraits: [
      'I see omens in every event and action.',
      'Nothing can shake my optimistic attitude.',
      'I quote sacred texts in almost every situation.',
    ],
    suggestedIdeals: ['Tradition', 'Charity', 'Change', 'Faith'],
    suggestedBonds: [
      'I would die to recover an ancient relic of my faith.',
      'I owe my life to the priest who took me in when my parents died.',
    ],
    suggestedFlaws: [
      'I judge others harshly, and myself even more severely.',
      'I put too much trust in those who wield power within my temple.',
      'My piety sometimes leads me to blindly trust those that profess my faith.',
    ],
  },
  {
    id: 'folk-hero',
    name: 'Folk Hero',
    icon: '🌾',
    description: 'You came from a humble background but are destined for so much more.',
    skillProficiencies: 'Animal Handling, Survival',
    feature: 'Rustic Hospitality',
    suggestedTraits: [
      'I judge people by their actions, not their words.',
      'When I set my mind to something, I follow through no matter what.',
      'I have a strong sense of fair play.',
    ],
    suggestedIdeals: ['Respect', 'Fairness', 'Freedom', 'Destiny'],
    suggestedBonds: [
      'I protect those who cannot protect themselves.',
      'I wish my childhood sweetheart had come with me to pursue my destiny.',
    ],
    suggestedFlaws: [
      'I\'m convinced of the significance of my destiny, and blind to shortcomings.',
      'The tyrant who rules my land will stop at nothing to see me killed.',
    ],
  },
  {
    id: 'hermit',
    name: 'Hermit',
    icon: '🏕️',
    description: 'You lived in seclusion for a formative part of your life.',
    skillProficiencies: 'Medicine, Religion',
    feature: 'Discovery',
    suggestedTraits: [
      'I\'ve been isolated for so long that I rarely speak, preferring gestures.',
      'I connect everything that happens to me to a grand cosmic plan.',
      'I feel tremendous empathy for all who suffer.',
    ],
    suggestedIdeals: ['Free Thinking', 'Knowledge', 'Self-Knowledge', 'Solitude'],
    suggestedBonds: [
      'My isolation gave me great insight into a great evil that only I can destroy.',
      'I entered seclusion because I loved someone I could not have.',
    ],
    suggestedFlaws: [
      'Now that I\'ve returned to the world, I enjoy its delights a little too much.',
      'I harbor dark, bloodthirsty thoughts that my isolation failed to quell.',
    ],
  },
  {
    id: 'merchant',
    name: 'Merchant',
    icon: '💰',
    description: 'You\'ve traveled trade routes, dealt in goods, and know the value of everything.',
    skillProficiencies: 'Insight, Persuasion',
    feature: 'Trade Network',
    suggestedTraits: [
      'I always know the price of everything within eyeshot.',
      'I treat every interaction as a potential deal.',
      'I\'m generous to a fault — good will is the best investment.',
    ],
    suggestedIdeals: ['Fairness', 'Prosperity', 'Community', 'Greed'],
    suggestedBonds: [
      'I\'m building a merchant empire that will outlast me.',
      'A rival merchant destroyed my business. I\'ll have my revenge.',
    ],
    suggestedFlaws: [
      'I can\'t resist a good deal — even when it\'s obviously a trap.',
      'I measure everything\'s worth in gold, including people.',
    ],
  },
  {
    id: 'sailor',
    name: 'Sailor',
    icon: '⚓',
    description: 'You\'ve spent years aboard ships, learning the ropes and the tides.',
    skillProficiencies: 'Athletics, Perception',
    feature: 'Ship\'s Passage',
    suggestedTraits: [
      'My friends know they can rely on me, no matter what.',
      'I work hard so that I can play hard when the work is done.',
      'I stretch the truth for the sake of a good story.',
    ],
    suggestedIdeals: ['Freedom', 'Mastery', 'People', 'Aspiration'],
    suggestedBonds: [
      'I\'ll always remember my first ship.',
      'I was cheated out of my fair share of the profits, and I want to get my due.',
    ],
    suggestedFlaws: [
      'I follow orders, even if I think they\'re wrong.',
      'Once I start drinking, it\'s hard for me to stop.',
    ],
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    icon: '🎭',
    description: 'You thrive in front of an audience, whether through song, story, or acrobatics.',
    skillProficiencies: 'Acrobatics, Performance',
    feature: 'By Popular Demand',
    suggestedTraits: [
      'I know a story relevant to almost every situation.',
      'I love a good insult, even one directed at me.',
      'I change my mood or my mind as quickly as I change key in a song.',
    ],
    suggestedIdeals: ['Beauty', 'Tradition', 'Creativity', 'Honesty'],
    suggestedBonds: [
      'I want to be famous, whatever it takes.',
      'Someone stole my prized instrument, and someday I\'ll get it back.',
    ],
    suggestedFlaws: [
      'I\'ll do anything to win fame and renown.',
      'A scandal prevents me from ever going home again.',
    ],
  },
  {
    id: 'artisan',
    name: 'Artisan',
    icon: '🔨',
    description: 'You\'re a skilled craftsperson, a member of a guild with trade expertise.',
    skillProficiencies: 'Insight, Persuasion',
    feature: 'Guild Membership',
    suggestedTraits: [
      'I believe that anything worth doing is worth doing right.',
      'I\'m full of witty aphorisms and have a proverb for every occasion.',
      'I\'m rude to people who lack my commitment to hard work.',
    ],
    suggestedIdeals: ['Community', 'Generosity', 'Freedom', 'Aspiration'],
    suggestedBonds: [
      'The workshop where I learned my trade is the most important place in the world.',
      'I owe my guild a great debt for forging me into the person I am today.',
    ],
    suggestedFlaws: [
      'I\'ll do anything to get my hands on something rare or priceless.',
      'I\'m never satisfied with what I have — I always want more.',
    ],
  },
  {
    id: 'urchin',
    name: 'Urchin',
    icon: '🐀',
    description: 'You grew up on the streets, surviving by your wits, speed, and stealth.',
    skillProficiencies: 'Sleight of Hand, Stealth',
    feature: 'City Secrets',
    suggestedTraits: [
      'I hide scraps of food and trinkets away in my pockets.',
      'I ask a lot of questions.',
      'I bluntly say what other people are hinting at or hiding.',
    ],
    suggestedIdeals: ['Respect', 'Community', 'Change', 'Retribution'],
    suggestedBonds: [
      'I owe my survival to another urchin who taught me to live on the streets.',
      'No one else should have to endure the hardships I\'ve been through.',
    ],
    suggestedFlaws: [
      'Gold seems like a lot of money to me, and I\'ll do just about anything for it.',
      'I will never fully trust anyone other than myself.',
    ],
  },
  {
    id: 'charlatan',
    name: 'Charlatan',
    icon: '🃏',
    description: 'You\'ve always had a way with people — specifically, a way of telling them what they want to hear.',
    skillProficiencies: 'Deception, Sleight of Hand',
    feature: 'False Identity',
    suggestedTraits: [
      'I fall in and out of love easily, and am always pursuing someone.',
      'I have a joke for every occasion, especially ones where humor is inappropriate.',
      'Flattery is my preferred trick for getting what I want.',
    ],
    suggestedIdeals: ['Independence', 'Fairness', 'Friendship', 'Creativity'],
    suggestedBonds: [
      'I fleeced the wrong person and must work to ensure they can never find me.',
      'I come from a noble family, and one day I\'ll reclaim my lands and title.',
    ],
    suggestedFlaws: [
      'I can\'t resist swindling people who are more powerful than me.',
      'I can\'t help but pocket loose coins and trinkets I come across.',
    ],
  },
];

export default function BackgroundSelector({
  selectedBackground,
  onBackgroundSelect,
  personality,
  onPersonalityChange,
}: BackgroundSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const selectedBg = BACKGROUNDS.find((b) => b.id === selectedBackground);

  const handleTraitToggle = (trait: string) => {
    const newTraits = personality.traits.includes(trait)
      ? personality.traits.filter((t) => t !== trait)
      : personality.traits.length < 3
      ? [...personality.traits, trait]
      : personality.traits;
    onPersonalityChange({ ...personality, traits: newTraits });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Background & Personality</h2>
        <p className="text-slate-400 text-sm">
          Your background shapes who you were before adventure called.
        </p>
      </div>

      {/* Background Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => {
              onBackgroundSelect(bg.id);
              setShowSuggestions(true);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedBackground === bg.id
                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50'
            }`}
          >
            <div className="text-xl mb-1">{bg.icon}</div>
            <div className="text-white font-semibold text-sm">{bg.name}</div>
            <div className="text-slate-400 text-xs mt-1 line-clamp-2">{bg.description}</div>
          </button>
        ))}
      </div>

      {/* Selected Background Details & Personality */}
      {selectedBg && (
        <div className="border border-slate-700 rounded-xl bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selectedBg.icon}</span>
            <div>
              <h3 className="text-lg font-cinzel text-amber-400">{selectedBg.name}</h3>
              <p className="text-slate-400 text-sm">
                <span className="text-sky-400">Skills:</span> {selectedBg.skillProficiencies} •{' '}
                <span className="text-sky-400">Feature:</span> {selectedBg.feature}
              </p>
            </div>
          </div>

          {/* Toggle suggestions vs freeform */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowSuggestions(true)}
              className={`px-3 py-1 text-sm rounded ${
                showSuggestions
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Choose from suggestions
            </button>
            <button
              onClick={() => setShowSuggestions(false)}
              className={`px-3 py-1 text-sm rounded ${
                !showSuggestions
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Write your own
            </button>
          </div>

          {showSuggestions ? (
            <div className="space-y-4">
              {/* Personality Traits (pick up to 2-3) */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">
                  Personality Traits <span className="text-slate-500">(pick up to 3)</span>
                </label>
                <div className="space-y-1">
                  {selectedBg.suggestedTraits.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTraitToggle(t)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        personality.traits.includes(t)
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ideal */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">Ideal</label>
                <div className="flex flex-wrap gap-2">
                  {selectedBg.suggestedIdeals.map((ideal) => (
                    <button
                      key={ideal}
                      onClick={() => onPersonalityChange({ ...personality, ideal })}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        personality.ideal === ideal
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {ideal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bond */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">Bond</label>
                <div className="space-y-1">
                  {selectedBg.suggestedBonds.map((bond) => (
                    <button
                      key={bond}
                      onClick={() => onPersonalityChange({ ...personality, bond })}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        personality.bond === bond
                          ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {bond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flaw */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">Flaw</label>
                <div className="space-y-1">
                  {selectedBg.suggestedFlaws.map((flaw) => (
                    <button
                      key={flaw}
                      onClick={() => onPersonalityChange({ ...personality, flaw })}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        personality.flaw === flaw
                          ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {flaw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Freeform Personality Traits */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-1">
                  Personality Traits
                </label>
                <textarea
                  value={personality.traits.join('\n')}
                  onChange={(e) =>
                    onPersonalityChange({
                      ...personality,
                      traits: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Describe your character's personality (one trait per line)..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-1">Ideal</label>
                <input
                  type="text"
                  value={personality.ideal}
                  onChange={(e) => onPersonalityChange({ ...personality, ideal: e.target.value })}
                  placeholder="What principle guides you?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-1">Bond</label>
                <input
                  type="text"
                  value={personality.bond}
                  onChange={(e) => onPersonalityChange({ ...personality, bond: e.target.value })}
                  placeholder="Who or what do you care about most?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-1">Flaw</label>
                <input
                  type="text"
                  value={personality.flaw}
                  onChange={(e) => onPersonalityChange({ ...personality, flaw: e.target.value })}
                  placeholder="What is your greatest weakness?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
