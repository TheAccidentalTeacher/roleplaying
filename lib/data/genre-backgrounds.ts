// ============================================================
// GENRE-SPECIFIC CHARACTER BACKGROUNDS
// Each genre gets its own set of backgrounds with unique
// personality traits, ideals, bonds, and flaws.
// ============================================================

export interface BackgroundDef {
  id: string;
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

// ─── GENRE REGISTRY ──────────────────────────────────────────

const GENRE_BACKGROUNDS: Record<string, BackgroundDef[]> = {};

function register(genre: string, bgs: BackgroundDef[]) {
  GENRE_BACKGROUNDS[genre] = bgs;
}

// Fallback chain for genres that don't yet have their own set
const GENRE_FALLBACKS: Record<string, string> = {
  'dark-fantasy': 'epic-fantasy',
  'mythology': 'mythological',
  'mythological': 'epic-fantasy',
  'eastern': 'epic-fantasy',
  'noir': 'mystery',
  'military': 'survival',
  'romance': 'epic-fantasy',
  'comedy': 'epic-fantasy',
};

/**
 * Get genre-appropriate backgrounds. Falls back to related
 * genres, then to epic-fantasy as the universal default.
 */
export function getBackgroundsForGenre(genre?: string): BackgroundDef[] {
  if (genre && GENRE_BACKGROUNDS[genre]) {
    return GENRE_BACKGROUNDS[genre];
  }
  if (genre && GENRE_FALLBACKS[genre]) {
    const fb = GENRE_FALLBACKS[genre];
    if (GENRE_BACKGROUNDS[fb]) return GENRE_BACKGROUNDS[fb];
  }
  return GENRE_BACKGROUNDS['epic-fantasy'] ?? [];
}

// ═══════════════════════════════════════════════════════════════
// EPIC FANTASY
// ═══════════════════════════════════════════════════════════════

register('epic-fantasy', [
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
]);

// ═══════════════════════════════════════════════════════════════
// CYBERPUNK
// ═══════════════════════════════════════════════════════════════

register('cyberpunk', [
  {
    id: 'street-samurai',
    name: 'Street Samurai',
    icon: '⚔️',
    description: 'A cybernetically enhanced mercenary who lives and dies by a personal code on the neon-lit streets.',
    skillProficiencies: 'Athletics, Intimidation',
    feature: 'Street Rep',
    suggestedTraits: [
      'I settle my debts — in blood if necessary.',
      'Chrome is who I am; meat is just the foundation.',
      'My word is my contract. Break yours and we\'re done.',
      'I only truly relax when I\'m armed and augmented.',
    ],
    suggestedIdeals: ['Honor', 'Protection', 'Survival', 'Glory'],
    suggestedBonds: [
      'My crew is the only family I\'ve ever known.',
      'I carry the memory chip of a fallen partner — their unfinished job is mine now.',
      'There\'s a bounty on my head from a corp I wronged.',
    ],
    suggestedFlaws: [
      'I solve most problems with violence first.',
      'I\'m addicted to cyberware upgrades — always chasing the next mod.',
      'I don\'t trust anyone who isn\'t augmented.',
    ],
  },
  {
    id: 'netrunner',
    name: 'Netrunner',
    icon: '💻',
    description: 'A digital ghost who hacks corporate networks and dives deep into cyberspace, where data is currency.',
    skillProficiencies: 'Investigation, Stealth',
    feature: 'ICE Breaker',
    suggestedTraits: [
      'I see the world as data streams and exploit paths.',
      'I\'m more comfortable in cyberspace than meatspace.',
      'I compulsively scan every device within range.',
      'People are just wetware with backdoors.',
    ],
    suggestedIdeals: ['Freedom', 'Knowledge', 'Chaos', 'Truth'],
    suggestedBonds: [
      'I found something in a corporate database that changed everything.',
      'My mentor was flatlined by black ICE — I\'ll find who wrote it.',
      'I maintain a hidden data cache that could bring down a megacorp.',
    ],
    suggestedFlaws: [
      'I can\'t resist jacking into unsecured networks.',
      'I\'ve been online so long I forget to eat and sleep.',
      'My neural interface glitches cause embarrassing episodes.',
    ],
  },
  {
    id: 'corporate-exile',
    name: 'Corporate Exile',
    icon: '🏢',
    description: 'Once you climbed the megacorp ladder. Now you\'ve fallen from the tower — or been pushed.',
    skillProficiencies: 'Deception, Persuasion',
    feature: 'Corporate Contacts',
    suggestedTraits: [
      'I still dress sharp — old habits die hard.',
      'I know exactly how the corps think because I was one of them.',
      'I catch myself using corporate jargon and hate it.',
      'I trust data and projections more than feelings.',
    ],
    suggestedIdeals: ['Redemption', 'Power', 'Freedom', 'Justice'],
    suggestedBonds: [
      'I know where my former employer buried the bodies — literally.',
      'Someone inside the corp still feeds me intel.',
      'I was framed for a crime I didn\'t commit. I need to clear my name.',
    ],
    suggestedFlaws: [
      'I look down on people who\'ve never worked corporate.',
      'I\'m paranoid that extraction teams are always watching.',
      'I miss the luxury and sometimes consider going back.',
    ],
  },
  {
    id: 'fixer',
    name: 'Fixer',
    icon: '🤝',
    description: 'The dealmaker, the info broker, the person who connects people and makes impossible things happen.',
    skillProficiencies: 'Insight, Persuasion',
    feature: 'Contact Network',
    suggestedTraits: [
      'Everyone owes me a favor, or will soon.',
      'I never reveal my sources — that\'s business.',
      'I treat every conversation as a negotiation.',
      'I know everyone\'s price. Everyone has one.',
    ],
    suggestedIdeals: ['Profit', 'Loyalty', 'Connections', 'Neutrality'],
    suggestedBonds: [
      'My reputation is everything — I never break a deal.',
      'I owe a syndicate a debt I can never fully repay.',
      'A client I trusted burned me once. Never again.',
    ],
    suggestedFlaws: [
      'I can\'t help but insert myself into other people\'s deals.',
      'I hoard secrets compulsively, even ones I\'ll never use.',
      'I\'ve made promises to both sides that can\'t both be kept.',
    ],
  },
  {
    id: 'techie',
    name: 'Techie',
    icon: '🔧',
    description: 'A hardware specialist who builds, repairs, and invents. If it has circuits, you can make it sing.',
    skillProficiencies: 'Investigation, Perception',
    feature: 'Jury Rig',
    suggestedTraits: [
      'If it\'s broken, I can fix it. If it works, I can make it better.',
      'I hoard components the way others hoard ammunition.',
      'I name all my tools and talk to my projects.',
      'I see beauty in elegant engineering that others miss.',
    ],
    suggestedIdeals: ['Innovation', 'Self-Reliance', 'Progress', 'Curiosity'],
    suggestedBonds: [
      'My workshop is my sanctuary — touch nothing.',
      'I\'m building something that will change the world, once I find the last component.',
      'My mentor sold out to a megacorp. I\'ll finish our work alone.',
    ],
    suggestedFlaws: [
      'I tinker with things at the worst possible times.',
      'I refuse to use technology I consider inferior.',
      'I get so focused on a project I ignore everything else.',
    ],
  },
  {
    id: 'media',
    name: 'Media',
    icon: '📡',
    description: 'A journalist, streamer, or content creator exposing truth in a world built on lies and corporate spin.',
    skillProficiencies: 'Investigation, Persuasion',
    feature: 'Audience',
    suggestedTraits: [
      'The truth is the most dangerous weapon in this city.',
      'I\'ll go anywhere for a story — even into a firefight.',
      'I record everything. Everything.',
      'I\'ve learned to read people like headlines.',
    ],
    suggestedIdeals: ['Truth', 'Justice', 'Fame', 'Freedom'],
    suggestedBonds: [
      'My last exposé got someone killed. I owe it to them to keep going.',
      'My subscriber count is my lifeline — lose the audience, lose the protection.',
      'I have encrypted footage that powerful people would kill for.',
    ],
    suggestedFlaws: [
      'I\'ll risk my life and others\' for the perfect shot.',
      'I can\'t let a story go, even when it\'s clearly a trap.',
      'I sensationalize things for clicks more than I\'d like to admit.',
    ],
  },
  {
    id: 'nomad',
    name: 'Nomad',
    icon: '🚗',
    description: 'A road warrior from outside the city walls. You grew up in the wastes, where family is everything.',
    skillProficiencies: 'Athletics, Survival',
    feature: 'Road Family',
    suggestedTraits: [
      'The open road is the only freedom left.',
      'I trust my clan above all else in this rotten world.',
      'I can fix any vehicle with duct tape and determination.',
      'City people are soft. I pity them.',
    ],
    suggestedIdeals: ['Family', 'Freedom', 'Honor', 'Survival'],
    suggestedBonds: [
      'My clan was scattered by a corporate raid. I\'m gathering us back together.',
      'My vehicle is more than a ride — it\'s my home.',
      'I left the wastes for the city to find medicine for someone I love.',
    ],
    suggestedFlaws: [
      'I distrust walls and enclosed spaces.',
      'I\'m fiercely territorial about my gear and vehicle.',
      'I struggle with city customs and social rules.',
    ],
  },
  {
    id: 'ripperdoc',
    name: 'Ripperdoc',
    icon: '💉',
    description: 'A street doctor who patches wounds and installs cyberware in back-alley clinics, no questions asked.',
    skillProficiencies: 'Medicine, Insight',
    feature: 'Back-Alley Clinic',
    suggestedTraits: [
      'I\'ve held people\'s lives in my hands so many times I\'ve lost count.',
      'I don\'t judge my patients — everyone deserves to live.',
      'I keep steady hands by never looking at the whole picture.',
      'Every scar tells a story. I\'ve read thousands.',
    ],
    suggestedIdeals: ['Compassion', 'Knowledge', 'Neutrality', 'Duty'],
    suggestedBonds: [
      'I operate on anyone — gang, corp, civilian — no questions asked.',
      'I lost my medical license for a reason I\'ll never discuss.',
      'A patient died on my table and their crew still blames me.',
    ],
    suggestedFlaws: [
      'I self-medicate with the same drugs I prescribe.',
      'I\'ve installed illegal experimental cyberware in myself.',
      'I freeze up when I encounter a situation too similar to my worst failure.',
    ],
  },
  {
    id: 'rockerboy',
    name: 'Rockerboy',
    icon: '🎸',
    description: 'A musician and rebel who uses art as a weapon against the system. Every chord is a revolution.',
    skillProficiencies: 'Performance, Persuasion',
    feature: 'Rebellious Following',
    suggestedTraits: [
      'My music is my weapon — every chord is a revolution.',
      'I live fast because tomorrow isn\'t guaranteed.',
      'The stage is the only place I feel truly alive.',
      'I channel rage and hope into every performance.',
    ],
    suggestedIdeals: ['Revolution', 'Art', 'Freedom', 'Unity'],
    suggestedBonds: [
      'My songs speak for the voiceless — I can\'t let them down.',
      'My band was killed for a song that went too far. I\'m still singing it.',
      'A megacorp offered me a deal. I burned the contract live on stage.',
    ],
    suggestedFlaws: [
      'I make enemies from every stage I play.',
      'I can\'t turn down an audience, even when it\'s obviously a setup.',
      'My ego writes checks my chrome can\'t cash.',
    ],
  },
  {
    id: 'enforcer',
    name: 'Enforcer',
    icon: '🔫',
    description: 'Muscle for hire. Whether corp security or gang lieutenant, you are the iron fist that keeps order.',
    skillProficiencies: 'Athletics, Intimidation',
    feature: 'Feared Reputation',
    suggestedTraits: [
      'I don\'t negotiate. I enforce.',
      'My body is my weapon — chrome just makes it better.',
      'I follow orders now so I can give them later.',
      'Silence is more intimidating than threats.',
    ],
    suggestedIdeals: ['Loyalty', 'Power', 'Discipline', 'Survival'],
    suggestedBonds: [
      'I protect someone who doesn\'t know they need protecting.',
      'The gang that raised me expects my loyalty forever.',
      'I\'m paying off a debt by doing jobs I\'m not proud of.',
    ],
    suggestedFlaws: [
      'I default to intimidation in every social situation.',
      'I can\'t back down from a challenge, even one I\'ll lose.',
      'My violent reputation follows me even when I try to change.',
    ],
  },
]);
