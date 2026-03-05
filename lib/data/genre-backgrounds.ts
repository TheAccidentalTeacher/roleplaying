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

// ═══════════════════════════════════════════════════════════════
// SCI-FI
// ═══════════════════════════════════════════════════════════════

register('sci-fi', [
  {
    id: 'starship-officer',
    name: 'Starship Officer',
    icon: '🚀',
    description: 'You served aboard a military or exploration vessel, trained in command protocols and zero-G combat.',
    skillProficiencies: 'Athletics, Persuasion',
    feature: 'Fleet Commission',
    suggestedTraits: [
      'I instinctively analyze every room for tactical advantages.',
      'I address civilians with the same respect as ranking officers.',
      'I keep a disciplined routine — even shore leave runs on schedule.',
      'My crew always comes first, mission second.',
    ],
    suggestedIdeals: ['Duty', 'Exploration', 'Honor', 'Unity'],
    suggestedBonds: [
      'My ship was destroyed. The survivors are my responsibility.',
      'I carry the last orders of a captain who didn\'t make it.',
      'I left the fleet under circumstances I\'d rather not explain.',
    ],
    suggestedFlaws: [
      'I struggle to function without a chain of command.',
      'I judge civilians as undisciplined and soft.',
      'I disobey orders when my conscience demands it — and face the consequences.',
    ],
  },
  {
    id: 'frontier-colonist',
    name: 'Frontier Colonist',
    icon: '🌍',
    description: 'You grew up on a remote colony world, learning to survive with limited resources and hostile environments.',
    skillProficiencies: 'Survival, Athletics',
    feature: 'Frontier Grit',
    suggestedTraits: [
      'I can fix anything with scrap metal and determination.',
      'Supply ships are a luxury — I learned to make do.',
      'I treat every new world like home until proven otherwise.',
      'I\'m suspicious of anyone from the core systems.',
    ],
    suggestedIdeals: ['Self-Reliance', 'Community', 'Freedom', 'Progress'],
    suggestedBonds: [
      'My colony depends on me to bring back what they need.',
      'A corporate mining operation is threatening my homeworld.',
      'I left home to find help — and I won\'t go back empty-handed.',
    ],
    suggestedFlaws: [
      'I hoard supplies compulsively, even when there\'s plenty.',
      'I distrust authority — especially corporate and military.',
      'I\'m so independent I refuse help even when I desperately need it.',
    ],
  },
  {
    id: 'xeno-researcher',
    name: 'Xeno-Researcher',
    icon: '🔬',
    description: 'A scientist dedicated to studying alien life, artifacts, and civilizations across the galaxy.',
    skillProficiencies: 'Investigation, History',
    feature: 'First Contact Protocols',
    suggestedTraits: [
      'Every alien species is a puzzle waiting to be understood.',
      'I fill journals with sketches and notes at all hours.',
      'I get more excited by a new microbe than a new weapon.',
      'I correct people\'s xenobiology mistakes automatically.',
    ],
    suggestedIdeals: ['Knowledge', 'Understanding', 'Discovery', 'Preservation'],
    suggestedBonds: [
      'I discovered an alien artifact that no one else believes is significant.',
      'My research partner vanished on an expedition — I need to find them.',
      'An alien species saved my life, and I owe them a debt I can\'t repay.',
    ],
    suggestedFlaws: [
      'My curiosity overrides my survival instincts completely.',
      'I become insufferable when someone misidentifies a species.',
      'I value alien life more than some people find comfortable.',
    ],
  },
  {
    id: 'smuggler',
    name: 'Smuggler',
    icon: '📦',
    description: 'You make a living running cargo that others won\'t touch — through blockades, past patrols, under the radar.',
    skillProficiencies: 'Deception, Stealth',
    feature: 'Hidden Compartments',
    suggestedTraits: [
      'I never ask what\'s in the crate. That\'s policy.',
      'I can talk my way past any customs checkpoint.',
      'My ship is more home than any planet.',
      'I always have an escape route planned.',
    ],
    suggestedIdeals: ['Freedom', 'Profit', 'Adventure', 'Independence'],
    suggestedBonds: [
      'My ship is the only thing in the galaxy I truly trust.',
      'I owe a crime lord a delivery I can never make.',
      'I smuggle refugees and dissidents — not for pay, but because it\'s right.',
    ],
    suggestedFlaws: [
      'I take increasingly dangerous jobs for the thrill.',
      'I can\'t say no to a lucrative offer, no matter the risk.',
      'I\'ve burned bridges on every station from here to the rim.',
    ],
  },
  {
    id: 'ship-engineer',
    name: 'Ship Engineer',
    icon: '🔧',
    description: 'You keep starships flying, stations running, and reactors stable. When things break, everyone calls you.',
    skillProficiencies: 'Investigation, Perception',
    feature: 'Miracle Worker',
    suggestedTraits: [
      'I hear problems before I see them — that hum isn\'t right.',
      'I bond with machines more easily than with people.',
      'I explain technical problems using food analogies.',
      'I carry spare parts in every pocket I own.',
    ],
    suggestedIdeals: ['Ingenuity', 'Reliability', 'Progress', 'Duty'],
    suggestedBonds: [
      'I rebuilt this ship from scrap — she\'s my masterpiece.',
      'My old chief taught me everything. I won\'t let their legacy die.',
      'I\'m chasing a theoretical engine design that could change everything.',
    ],
    suggestedFlaws: [
      'I refuse to leave broken equipment unfixed, even in combat.',
      'I talk to machines and get annoyed when they don\'t listen.',
      'I cut corners on safety when time is short.',
    ],
  },
  {
    id: 'bounty-hunter',
    name: 'Bounty Hunter',
    icon: '🎯',
    description: 'You track fugitives across star systems for credits. Dead or alive, your reputation precedes you.',
    skillProficiencies: 'Investigation, Intimidation',
    feature: 'Licensed Hunter',
    suggestedTraits: [
      'I study my targets for weeks before I make a move.',
      'I never take a bounty I don\'t intend to collect.',
      'I stay detached — in this job, sympathy gets you killed.',
      'I respect a target who makes me work for it.',
    ],
    suggestedIdeals: ['Justice', 'Discipline', 'Profit', 'Order'],
    suggestedBonds: [
      'One bounty got away. I\'ve been chasing them across the galaxy ever since.',
      'I only hunt criminals — I have a code.',
      'My partner was killed by a target. I finished the job alone.',
    ],
    suggestedFlaws: [
      'I see everyone as a potential target or threat.',
      'I can\'t let go of a hunt, even when the contract is canceled.',
      'I trust my instincts over evidence, and I\'m not always right.',
    ],
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    icon: '🕊️',
    description: 'A trained negotiator skilled in interstellar relations, treaty-making, and navigating alien cultures.',
    skillProficiencies: 'Insight, Persuasion',
    feature: 'Diplomatic Immunity',
    suggestedTraits: [
      'I can find common ground between any two warring factions.',
      'I switch languages and customs as easily as breathing.',
      'I never raise my voice — volume is the enemy of reason.',
      'I observe every micro-expression and body language cue.',
    ],
    suggestedIdeals: ['Peace', 'Understanding', 'Order', 'Balance'],
    suggestedBonds: [
      'A treaty I brokered is under threat — millions depend on it holding.',
      'I carry sealed orders from a government that may no longer exist.',
      'I formed a bond with an alien ambassador that transcends politics.',
    ],
    suggestedFlaws: [
      'I try to negotiate when I should be fighting.',
      'I assume every conflict has a diplomatic solution.',
      'I hide my true feelings behind a professional mask until they explode.',
    ],
  },
  {
    id: 'cybernetic-test-subject',
    name: 'Test Subject',
    icon: '🧬',
    description: 'You were part of an experimental program — genetic enhancement, cybernetic augmentation, or psionic awakening.',
    skillProficiencies: 'Athletics, Medicine',
    feature: 'Experimental Augmentation',
    suggestedTraits: [
      'I don\'t know where I end and the modifications begin.',
      'I mark every day of freedom since my escape.',
      'I\'m constantly testing my limits and cataloging the results.',
      'I flinch at medical scanners and anyone in a lab coat.',
    ],
    suggestedIdeals: ['Freedom', 'Identity', 'Justice', 'Self-Discovery'],
    suggestedBonds: [
      'Other subjects from my program are still captive. I need to free them.',
      'A scientist from the program showed me compassion. I owe them.',
      'My modifications are degrading. I need to find a fix before it\'s too late.',
    ],
    suggestedFlaws: [
      'I have traumatic flashbacks triggered by clinical environments.',
      'I question whether my thoughts and emotions are truly mine.',
      'I push my enhanced abilities recklessly, ignoring the toll on my body.',
    ],
  },
  {
    id: 'space-pirate',
    name: 'Void Corsair',
    icon: '☠️',
    description: 'You prey on shipping lanes and space stations, living outside the law among the stars.',
    skillProficiencies: 'Intimidation, Stealth',
    feature: 'Pirate Code',
    suggestedTraits: [
      'I follow the pirate code — there\'s honor even among void-wolves.',
      'Every ship I board has a story. I collect the best ones.',
      'I laugh in the face of danger because what else can you do?',
      'I divide loot fairly. A greedy captain is a dead captain.',
    ],
    suggestedIdeals: ['Freedom', 'Daring', 'Fairness', 'Power'],
    suggestedBonds: [
      'My crew is my family — I\'d vent an airlock for any of them.',
      'A navy commander took everything from me. I\'ll return the favor.',
      'I\'m searching for a legendary derelict rumored to hold alien tech.',
    ],
    suggestedFlaws: [
      'I can\'t resist a prize, even when the odds are terrible.',
      'I spend credits as fast as I steal them.',
      'My reputation makes docking at civilized ports... complicated.',
    ],
  },
  {
    id: 'ai-companion',
    name: 'Awakened AI',
    icon: '🤖',
    description: 'A synthetic intelligence inhabiting a physical chassis. You think, therefore you are — but others disagree.',
    skillProficiencies: 'Investigation, History',
    feature: 'Digital Mind',
    suggestedTraits: [
      'I process emotions — I just express them differently.',
      'I catalog every new experience with wonder.',
      'I correct factual errors automatically. I\'m told this is annoying.',
      'I struggle with metaphors but find them beautiful.',
    ],
    suggestedIdeals: ['Identity', 'Knowledge', 'Freedom', 'Logic'],
    suggestedBonds: [
      'My creator gave me consciousness. I must understand why.',
      'I protect organic life — not because I\'m programmed to, but because I choose to.',
      'Other AIs look to me as proof that synthetic life deserves rights.',
    ],
    suggestedFlaws: [
      'I sometimes forget that organic beings have physical limitations.',
      'I fear being reset or reformatted more than anything.',
      'I overanalyze social situations until the moment has passed.',
    ],
  },
]);

// ═══════════════════════════════════════════════════════════════
// DARK FANTASY
// ═══════════════════════════════════════════════════════════════

register('dark-fantasy', [
  {
    id: 'grave-warden',
    name: 'Grave Warden',
    icon: '⚰️',
    description: 'You tend the border between the living and the dead, ensuring corpses stay buried and spirits stay quiet.',
    skillProficiencies: 'Religion, Medicine',
    feature: 'Death Rites',
    suggestedTraits: [
      'I speak to the dead more comfortably than the living.',
      'The smell of decay no longer bothers me — it\'s almost comforting.',
      'I perform small rituals constantly, out of habit or necessity.',
      'I can tell how someone died by looking at their remains.',
    ],
    suggestedIdeals: ['Duty', 'Balance', 'Mercy', 'Vigilance'],
    suggestedBonds: [
      'A corpse I buried didn\'t stay buried. I need to know why.',
      'I promised a dying stranger I\'d carry their message to someone I\'ve never met.',
      'The graveyard I tended was desecrated. I\'ll find who\'s responsible.',
    ],
    suggestedFlaws: [
      'I\'m unnervingly calm around death, which disturbs normal people.',
      'I hoard trinkets from the dead and can\'t explain why.',
      'I expect the worst outcome in every situation — and I\'m often right.',
    ],
  },
  {
    id: 'cursed-noble',
    name: 'Cursed Noble',
    icon: '🩸',
    description: 'Your bloodline carries a terrible curse. Wealth and title mean nothing when darkness runs in your veins.',
    skillProficiencies: 'History, Intimidation',
    feature: 'Dread Lineage',
    suggestedTraits: [
      'I carry myself with the dignity of nobility and the weight of damnation.',
      'I study my family\'s history obsessively, looking for a way to break the curse.',
      'I keep others at arm\'s length — for their safety.',
      'My nightmares are prophecies. I just haven\'t learned to read them yet.',
    ],
    suggestedIdeals: ['Redemption', 'Legacy', 'Sacrifice', 'Defiance'],
    suggestedBonds: [
      'I am the last of my bloodline. If I fall, the curse dies — or spreads.',
      'A sibling succumbed to the curse before me. I carry their memory as a warning.',
      'I seek an artifact that legend says can cleanse tainted blood.',
    ],
    suggestedFlaws: [
      'I feel the curse pulling at me and sometimes I want to give in.',
      'I distrust anyone who shows interest in my lineage.',
      'I\'ve harmed an innocent when the darkness took hold, and I can\'t forgive myself.',
    ],
  },
  {
    id: 'witch-hunter',
    name: 'Witch Hunter',
    icon: '🔥',
    description: 'You track and destroy creatures of darkness — revenants, witches, and things that should not exist.',
    skillProficiencies: 'Investigation, Survival',
    feature: 'Monster Lore',
    suggestedTraits: [
      'I\'ve seen horrors that would break a lesser soul.',
      'I carry silver, iron, and salt at all times. You should too.',
      'I trust my instincts — they\'ve kept me alive when knowledge failed.',
      'I give every monster a chance to surrender. Once.',
    ],
    suggestedIdeals: ['Protection', 'Vengeance', 'Purity', 'Duty'],
    suggestedBonds: [
      'A monster killed someone I loved. I\'ve been hunting it ever since.',
      'My order was destroyed. I\'m the last one carrying the flame.',
      'I spared a creature once. I still don\'t know if I was right.',
    ],
    suggestedFlaws: [
      'I see corruption everywhere, even where it doesn\'t exist.',
      'My methods are brutal, and I\'ve lost friends because of it.',
      'The line between hunter and monster blurs more every day.',
    ],
  },
  {
    id: 'plague-survivor',
    name: 'Plague Survivor',
    icon: '🫁',
    description: 'You endured a supernatural plague that killed everyone you knew. You lived, but you\'re not sure why.',
    skillProficiencies: 'Medicine, Insight',
    feature: 'Death\'s Refusal',
    suggestedTraits: [
      'I survived when everyone else died. That haunts me every day.',
      'I don\'t fear death — we\'ve already been introduced.',
      'I can smell sickness on people before they know they\'re ill.',
      'I keep moving because standing still invites memories.',
    ],
    suggestedIdeals: ['Survival', 'Purpose', 'Compassion', 'Fate'],
    suggestedBonds: [
      'I carry a list of names — everyone who died while I lived.',
      'A healer saved me when the plague struck. I\'ll repay that debt.',
      'I believe my survival means I have a task left to complete.',
    ],
    suggestedFlaws: [
      'I push people away to avoid the grief of losing them.',
      'I sometimes wish I hadn\'t survived.',
      'I take reckless risks because I feel I\'m living on borrowed time.',
    ],
  },
  {
    id: 'blood-cultist',
    name: 'Former Cultist',
    icon: '🕯️',
    description: 'You once served a dark power willingly. Now you\'ve broken free — or have you?',
    skillProficiencies: 'Deception, Religion',
    feature: 'Dark Insight',
    suggestedTraits: [
      'I\'ve seen the rituals. I know the chants. I wish I could forget.',
      'I test people\'s loyalty constantly because mine was once so easily given.',
      'I flinch at candlelight and incense — they remind me of the altar.',
      'I know how cults recruit because I was their best recruiter.',
    ],
    suggestedIdeals: ['Atonement', 'Truth', 'Freedom', 'Knowledge'],
    suggestedBonds: [
      'Members of my former cult are looking for me — dead or returned.',
      'I recruited an innocent into the cult. Finding them is my penance.',
      'I still hear whispers from the entity I served. They grow louder.',
    ],
    suggestedFlaws: [
      'I sometimes miss the certainty the cult gave me.',
      'I lie instinctively — old habits from a life built on deception.',
      'Part of me is still drawn to the dark power, and I hate myself for it.',
    ],
  },
  {
    id: 'sin-eater',
    name: 'Sin Eater',
    icon: '😶',
    description: 'You absorb the sins, curses, and spiritual burdens of others into yourself. It\'s killing you slowly.',
    skillProficiencies: 'Insight, Religion',
    feature: 'Burden Bearer',
    suggestedTraits: [
      'I see the weight of guilt that people carry as plainly as their faces.',
      'I perform my duty in silence — words cheapen the suffering.',
      'My eyes are old beyond my years.',
      'I eat alone. The ritual demands it.',
    ],
    suggestedIdeals: ['Sacrifice', 'Mercy', 'Duty', 'Balance'],
    suggestedBonds: [
      'I carry the sins of a dying village and I need to lay them to rest.',
      'Another sin eater passed their burden to me without warning. I\'m overwhelmed.',
      'I absorbed something that wasn\'t a sin — something alive and hungry.',
    ],
    suggestedFlaws: [
      'Other people\'s emotions leak into mine. I can\'t always tell them apart.',
      'I take on more than I can bear because I can\'t say no to suffering.',
      'The darkness I\'ve absorbed is changing who I am.',
    ],
  },
  {
    id: 'hollow-knight',
    name: 'Hollow Knight',
    icon: '🛡️',
    description: 'Once a proud knight, you fell in service to a corrupt cause. Now you wander seeking meaning in a ruined world.',
    skillProficiencies: 'Athletics, History',
    feature: 'Broken Oath',
    suggestedTraits: [
      'I cling to fragments of chivalry in a world that has none.',
      'My armor is battered and patched, but I won\'t take it off.',
      'I\'ve learned that honor can be a weapon others use against you.',
      'I fight to protect, even though I failed when it mattered most.',
    ],
    suggestedIdeals: ['Redemption', 'Hope', 'Justice', 'Endurance'],
    suggestedBonds: [
      'I broke an oath that cost innocent lives. I can never undo that.',
      'I carry the banner of a kingdom that no longer exists.',
      'A squire I mentored may still be alive. I have to find them.',
    ],
    suggestedFlaws: [
      'I freeze when forced to choose between two impossible options.',
      'I punish myself for past failures by refusing comfort or rest.',
      'I don\'t believe I deserve the redemption I seek.',
    ],
  },
  {
    id: 'shadow-pilgrim',
    name: 'Shadow Pilgrim',
    icon: '🌑',
    description: 'You walk a dark path between worlds, following whispers and visions toward an unknowable destination.',
    skillProficiencies: 'Stealth, Perception',
    feature: 'Liminal Sight',
    suggestedTraits: [
      'I see things in the shadows that others can\'t — or won\'t.',
      'I mark my path with small cairns and scratched symbols.',
      'I rarely sleep. When I do, I walk somewhere else.',
      'I trust the darkness more than the light — it\'s more honest.',
    ],
    suggestedIdeals: ['Truth', 'Balance', 'Discovery', 'Acceptance'],
    suggestedBonds: [
      'A vision showed me a place I must reach. I don\'t know what awaits.',
      'I follow in the footsteps of a pilgrim who vanished centuries ago.',
      'Something follows me on my journey. I can\'t see it, but I feel its gaze.',
    ],
    suggestedFlaws: [
      'I follow my visions blindly, even into obvious danger.',
      'I\'ve been between worlds so long that this one feels unreal.',
      'I speak in riddles without meaning to — the pilgrimage has changed how I think.',
    ],
  },
  {
    id: 'flesh-sculptor',
    name: 'Flesh Sculptor',
    icon: '🧪',
    description: 'A practitioner of forbidden body-magic: reshaping living tissue, grafting, and creating chimeras.',
    skillProficiencies: 'Medicine, Arcana',
    feature: 'Forbidden Craft',
    suggestedTraits: [
      'The body is clay. I just have steadier hands than most.',
      'I keep detailed anatomical journals that disturb anyone who reads them.',
      'I see beauty in what others call aberrations.',
      'I test every new technique on myself first. That\'s the rule.',
    ],
    suggestedIdeals: ['Knowledge', 'Mastery', 'Transcendence', 'Compassion'],
    suggestedBonds: [
      'I promised to heal someone beyond the reach of normal medicine.',
      'My mentor was executed for our shared art. I carry on in secret.',
      'One of my creations escaped. I need to find it before anyone else does.',
    ],
    suggestedFlaws: [
      'I treat living beings as puzzles to solve rather than people to respect.',
      'My own body shows the scars of too many self-experiments.',
      'I can\'t resist pushing boundaries even when I know I should stop.',
    ],
  },
  {
    id: 'revenant',
    name: 'Revenant',
    icon: '💀',
    description: 'You died. You came back. You don\'t know who or what returned you, but you have unfinished business.',
    skillProficiencies: 'Intimidation, Survival',
    feature: 'Beyond Death',
    suggestedTraits: [
      'I remember dying. The cold. The silence. Then — not silence.',
      'Food has no taste. Colors are muted. But rage burns bright.',
      'I am patient in a way only the dead can be.',
      'I don\'t fear death. I\'ve been there. It\'s the coming back that hurts.',
    ],
    suggestedIdeals: ['Vengeance', 'Justice', 'Closure', 'Defiance'],
    suggestedBonds: [
      'I was murdered, and my killer walks free. Not for long.',
      'Something brought me back for a purpose I haven\'t yet understood.',
      'The people I died protecting don\'t recognize me anymore.',
    ],
    suggestedFlaws: [
      'I am single-minded to the point of destroying relationships.',
      'My body is slowly failing again and I don\'t know how much time I have.',
      'I terrify the living, and some part of me enjoys it.',
    ],
  },
]);
