// ============================================================
// WORLD DEFINITION TYPES
// Shared interfaces for the world → origin → class pipeline
// ============================================================

/** What "race" is called in each setting */
export type OriginLabel = 'Race' | 'Species' | 'Origin' | 'Lineage' | 'Strain' | 'Archetype' | 'Heritage' | 'Stock' | 'Breed' | 'Kin' | 'Bloodline';

/** What "class" is called in each setting */
export type ClassLabel = 'Class' | 'Role' | 'Profession' | 'Calling' | 'Specialization' | 'Vocation' | 'Discipline' | 'Path' | 'MOS' | 'Division' | 'Style' | 'Archetype';

export interface OriginDef {
  id: string;
  name: string;
  description: string;
  bonuses: string;           // e.g. "+2 STR, +1 CON" or "Radiation Resist +20%"
  traits?: string[];         // 1-3 innate traits
}

export interface ClassDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  hitDie: string;            // e.g. "d10" or "High HP" for non-fantasy
  primaryStat: string;
  role: string;              // e.g. "Tank / Damage" or "Front-line / Support"
}

export interface OriginCategory {
  category: string;
  origins: OriginDef[];
}

export interface WorldDefinition {
  id: string;
  name: string;
  icon: string;
  genre: string;
  description: string;
  flavor: string;            // One atmospheric sentence
  originLabel: OriginLabel;  // What "race" is called
  classLabel: ClassLabel;    // What "class" is called
  origins: OriginCategory[];
  classes: ClassDef[];
}

export interface WorldCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  worlds: WorldDefinition[];
}
