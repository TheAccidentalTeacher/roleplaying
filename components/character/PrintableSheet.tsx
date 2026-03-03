'use client';

import type { Character } from '@/lib/types/character';

interface PrintableSheetProps {
  character: Character;
  worldName?: string;
}

const fmt = (m: number) => (m >= 0 ? `+${m}` : `${m}`);

const SKILL_LABELS: Record<string, string> = {
  acrobatics: 'Acrobatics (Dex)',
  'animal-handling': 'Animal Handling (Wis)',
  arcana: 'Arcana (Int)',
  athletics: 'Athletics (Str)',
  deception: 'Deception (Cha)',
  history: 'History (Int)',
  insight: 'Insight (Wis)',
  intimidation: 'Intimidation (Cha)',
  investigation: 'Investigation (Int)',
  medicine: 'Medicine (Wis)',
  nature: 'Nature (Int)',
  perception: 'Perception (Wis)',
  performance: 'Performance (Cha)',
  persuasion: 'Persuasion (Cha)',
  religion: 'Religion (Int)',
  'sleight-of-hand': 'Sleight of Hand (Dex)',
  stealth: 'Stealth (Dex)',
  survival: 'Survival (Wis)',
};

const SAVE_LABELS: Record<string, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

const ABILITY_LABELS: Record<string, string> = {
  str: 'STRENGTH',
  dex: 'DEXTERITY',
  con: 'CONSTITUTION',
  int: 'INTELLIGENCE',
  wis: 'WISDOM',
  cha: 'CHARISMA',
};

export default function PrintableSheet({ character: c, worldName }: PrintableSheetProps) {
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

  return (
    <div className="sheet-page">
      {/* ── PRINT & SCREEN STYLES ── */}
      <style>{`
        .sheet-page {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #1a1a1a;
          background: #fdf6e3;
          max-width: 850px;
          margin: 0 auto;
          padding: 24px 32px;
          line-height: 1.4;
        }
        .sheet-page * { box-sizing: border-box; }

        /* ── HEADER ── */
        .cs-header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          border-bottom: 3px double #8b4513;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .cs-charname {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #2c1810;
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
        }
        .cs-subtitle {
          font-size: 13px;
          color: #5a3a28;
          margin-top: 2px;
        }
        .cs-header-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px 16px;
          text-align: right;
          font-size: 12px;
        }
        .cs-header-label { color: #8b6914; font-weight: 600; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; }
        .cs-header-value { color: #2c1810; font-weight: 500; }

        /* ── MAIN GRID ── */
        .cs-body {
          display: grid;
          grid-template-columns: 90px 1fr 1fr;
          gap: 16px;
        }

        /* ── ABILITY SCORES (left column) ── */
        .cs-abilities { display: flex; flex-direction: column; gap: 8px; }
        .cs-ability-block {
          border: 2px solid #8b4513;
          border-radius: 8px;
          text-align: center;
          padding: 6px 4px 4px;
          background: #fefcf5;
          position: relative;
        }
        .cs-ability-label { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #8b4513; }
        .cs-ability-mod { font-size: 24px; font-weight: 800; color: #2c1810; line-height: 1.1; }
        .cs-ability-score {
          display: inline-block;
          width: 28px; height: 18px;
          border: 1.5px solid #8b4513;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          line-height: 18px;
          background: #fdf6e3;
          color: #2c1810;
          margin-top: 2px;
        }

        /* ── SECTION BOXES ── */
        .cs-box {
          border: 1.5px solid #c4a882;
          border-radius: 6px;
          padding: 10px 12px;
          background: #fefcf5;
        }
        .cs-box-title {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #8b4513;
          border-bottom: 1px solid #dcc9a8;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }

        /* ── COMBAT STATS ── */
        .cs-combat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .cs-combat-stat {
          border: 2px solid #8b4513;
          border-radius: 8px;
          text-align: center;
          padding: 8px 4px;
          background: #fefcf5;
        }
        .cs-combat-stat-label { font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #8b4513; }
        .cs-combat-stat-value { font-size: 26px; font-weight: 800; color: #2c1810; line-height: 1.1; }

        /* ── HP BOX ── */
        .cs-hp-box {
          border: 2px solid #8b4513;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
          background: #fefcf5;
        }
        .cs-hp-row { display: flex; justify-content: space-between; align-items: center; }
        .cs-hp-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8b4513; }
        .cs-hp-value { font-size: 22px; font-weight: 800; color: #2c1810; }
        .cs-hp-sub { font-size: 11px; color: #5a3a28; margin-top: 4px; }

        /* ── SAVE/SKILL ROWS ── */
        .cs-skill-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 2px 0;
          font-size: 11px;
          border-bottom: 1px dotted #e8dcc8;
        }
        .cs-skill-row:last-child { border-bottom: none; }
        .cs-prof-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          border: 1.5px solid #8b4513;
          flex-shrink: 0;
        }
        .cs-prof-dot.filled { background: #8b4513; }
        .cs-prof-dot.expertise { background: #c4952a; border-color: #c4952a; }
        .cs-skill-bonus { font-weight: 700; width: 28px; text-align: right; font-family: 'Courier New', monospace; }
        .cs-skill-name { flex: 1; color: #3a2a1a; }

        /* ── FEATURES ── */
        .cs-feature { margin-bottom: 8px; }
        .cs-feature-name { font-weight: 700; font-size: 12px; color: #2c1810; }
        .cs-feature-source { font-size: 9px; color: #8b6914; text-transform: uppercase; margin-left: 6px; }
        .cs-feature-desc { font-size: 11px; color: #4a3a2a; margin-top: 2px; }
        .cs-feature-uses { font-size: 10px; color: #8b4513; font-style: italic; }

        /* ── SPELLS ── */
        .cs-spell { padding: 4px 0; border-bottom: 1px dotted #e8dcc8; }
        .cs-spell:last-child { border-bottom: none; }
        .cs-spell-name { font-weight: 600; font-size: 12px; color: #2c1810; }
        .cs-spell-meta { font-size: 10px; color: #6a5a4a; }
        .cs-spell-desc { font-size: 10px; color: #4a3a2a; margin-top: 2px; }
        .cs-spell-damage { font-size: 10px; color: #a0522d; font-weight: 600; }

        /* ── EQUIPMENT ── */
        .cs-equip-item {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 11px;
          border-bottom: 1px dotted #e8dcc8;
          color: #3a2a1a;
        }
        .cs-equip-item:last-child { border-bottom: none; }

        /* ── PERSONALITY ── */
        .cs-personality-field { margin-bottom: 8px; }
        .cs-personality-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8b4513; }
        .cs-personality-value { font-size: 11px; color: #3a2a1a; margin-top: 2px; font-style: italic; }

        /* ── PROFICIENCIES ── */
        .cs-prof-group { margin-bottom: 6px; }
        .cs-prof-cat { font-size: 10px; font-weight: 700; color: #8b4513; }
        .cs-prof-list { font-size: 11px; color: #3a2a1a; }

        /* ── SPELL SLOTS ── */
        .cs-slots-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
        .cs-slot-group { text-align: center; }
        .cs-slot-label { font-size: 9px; font-weight: 700; color: #8b4513; }
        .cs-slot-dots { display: flex; gap: 3px; justify-content: center; margin-top: 2px; }
        .cs-slot-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          border: 1.5px solid #8b4513;
        }
        .cs-slot-dot.filled { background: #3b6ea5; border-color: #3b6ea5; }

        /* ── DEATH SAVES ── */
        .cs-death-saves { display: flex; gap: 16px; margin-top: 6px; font-size: 11px; }
        .cs-death-label { font-weight: 600; color: #5a3a28; }
        .cs-death-dots { display: flex; gap: 3px; }
        .cs-death-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          border: 1.5px solid #8b4513;
        }

        /* ── SECOND ROW (below main grid) ── */
        .cs-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }

        /* ── FOOTER ── */
        .cs-footer {
          margin-top: 16px;
          padding-top: 8px;
          border-top: 3px double #8b4513;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #8b6914;
        }

        /* ── XP BAR ── */
        .cs-xp-bar {
          background: #e8dcc8;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        }
        .cs-xp-fill {
          height: 100%;
          background: #c4952a;
          border-radius: 4px;
        }

        /* ── PRINT STYLES ── */
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .sheet-page {
            max-width: 100%;
            padding: 12px 20px;
            background: white;
            font-size: 10px;
          }
          .sheet-no-print { display: none !important; }
          .cs-charname { font-size: 22px; }
          .cs-combat-stat-value { font-size: 22px; }
          .cs-hp-value { font-size: 18px; }
          .cs-ability-mod { font-size: 20px; }
          .cs-box { page-break-inside: avoid; }
        }
      `}</style>

      {/* ── PRINT BUTTON ── */}
      <div className="sheet-no-print" style={{ textAlign: 'right', marginBottom: 12 }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '8px 20px',
            background: '#8b4513',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            marginRight: 8,
          }}
        >
          🖨️ Print Character Sheet
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '8px 20px',
            background: '#5a3a28',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Back to Game
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── HEADER ── */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="cs-header">
        <div>
          <h1 className="cs-charname">{c.name}</h1>
          <div className="cs-subtitle">
            Level {c.level} {c.race} {c.class}
            {c.subclass ? ` — ${c.subclass}` : ''}
          </div>
        </div>
        <div className="cs-header-stats">
          <div>
            <div className="cs-header-label">Background</div>
            <div className="cs-header-value">{c.background || '—'}</div>
          </div>
          <div>
            <div className="cs-header-label">Alignment</div>
            <div className="cs-header-value" style={{ textTransform: 'capitalize' }}>
              {(c.alignment || 'neutral').replace('-', ' ')}
            </div>
          </div>
          <div>
            <div className="cs-header-label">World</div>
            <div className="cs-header-value">{worldName || '—'}</div>
          </div>
          <div>
            <div className="cs-header-label">Experience</div>
            <div className="cs-header-value">{c.xp ?? 0} / {c.xpToNextLevel ?? 300}</div>
          </div>
          <div>
            <div className="cs-header-label">Prof. Bonus</div>
            <div className="cs-header-value">{fmt(c.proficiencyBonus ?? 2)}</div>
          </div>
          <div>
            <div className="cs-header-label">Passive Perc.</div>
            <div className="cs-header-value">{c.passivePerception ?? 10}</div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="cs-xp-bar">
        <div
          className="cs-xp-fill"
          style={{ width: `${c.xpToNextLevel ? (c.xp / c.xpToNextLevel) * 100 : 0}%` }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── MAIN BODY: 3-column grid ── */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="cs-body" style={{ marginTop: 16 }}>

        {/* ── LEFT COLUMN: Ability Scores ── */}
        <div className="cs-abilities">
          {abilities.map((ab) => {
            const data = c.abilityScores?.[ab];
            const score = data?.score ?? 10;
            const mod = data?.modifier ?? Math.floor((score - 10) / 2);
            return (
              <div key={ab} className="cs-ability-block">
                <div className="cs-ability-label">{ABILITY_LABELS[ab]}</div>
                <div className="cs-ability-mod">{fmt(mod)}</div>
                <div className="cs-ability-score">{score}</div>
              </div>
            );
          })}
        </div>

        {/* ── MIDDLE COLUMN: Saves, Skills ── */}
        <div>
          {/* Saving Throws */}
          <div className="cs-box" style={{ marginBottom: 12 }}>
            <div className="cs-box-title">Saving Throws</div>
            {(c.savingThrows ?? []).map((st) => (
              <div key={st.ability} className="cs-skill-row">
                <div className={`cs-prof-dot ${st.proficient ? 'filled' : ''}`} />
                <span className="cs-skill-bonus">{fmt(st.bonus)}</span>
                <span className="cs-skill-name">{SAVE_LABELS[st.ability] || st.ability}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="cs-box">
            <div className="cs-box-title">Skills</div>
            {(c.skills ?? [])
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((sk) => (
                <div key={sk.name} className="cs-skill-row">
                  <div
                    className={`cs-prof-dot ${sk.expertise ? 'expertise' : sk.proficient ? 'filled' : ''}`}
                  />
                  <span className="cs-skill-bonus">{fmt(sk.bonus)}</span>
                  <span className="cs-skill-name">{SKILL_LABELS[sk.name] || sk.name}</span>
                </div>
              ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Combat, HP, Features ── */}
        <div>
          {/* Combat Stats */}
          <div className="cs-combat-row">
            <div className="cs-combat-stat">
              <div className="cs-combat-stat-label">Armor Class</div>
              <div className="cs-combat-stat-value">{c.armorClass ?? 10}</div>
            </div>
            <div className="cs-combat-stat">
              <div className="cs-combat-stat-label">Initiative</div>
              <div className="cs-combat-stat-value">{fmt(c.initiative ?? 0)}</div>
            </div>
            <div className="cs-combat-stat">
              <div className="cs-combat-stat-label">Speed</div>
              <div className="cs-combat-stat-value">{c.speed ?? 30}<span style={{ fontSize: 10 }}>ft</span></div>
            </div>
          </div>

          {/* Hit Points */}
          <div className="cs-hp-box">
            <div className="cs-hp-row">
              <div>
                <div className="cs-hp-label">Hit Points</div>
                <div className="cs-hp-value">
                  {c.hitPoints?.current ?? 0} / {c.hitPoints?.max ?? 0}
                  {(c.hitPoints?.temporary ?? 0) > 0 && (
                    <span style={{ fontSize: 14, color: '#3b6ea5' }}> +{c.hitPoints.temporary} temp</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cs-hp-label">Hit Dice</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2c1810' }}>
                  {c.hitPoints?.hitDice?.remaining ?? 0}/{c.hitPoints?.hitDice?.total ?? 1}d{c.hitPoints?.hitDice?.dieType ?? 8}
                </div>
              </div>
            </div>
            {/* Death Saves */}
            <div className="cs-death-saves">
              <div>
                <span className="cs-death-label">Successes </span>
                <span className="cs-death-dots">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`cs-death-dot ${i < (c.deathSaves?.successes ?? 0) ? 'filled' : ''}`} style={i < (c.deathSaves?.successes ?? 0) ? { background: '#2d8a4e', borderColor: '#2d8a4e' } : {}} />
                  ))}
                </span>
              </div>
              <div>
                <span className="cs-death-label">Failures </span>
                <span className="cs-death-dots">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`cs-death-dot ${i < (c.deathSaves?.failures ?? 0) ? 'filled' : ''}`} style={i < (c.deathSaves?.failures ?? 0) ? { background: '#a0522d', borderColor: '#a0522d' } : {}} />
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Mana (if applicable) */}
          {c.mana && c.mana.max > 0 && (
            <div className="cs-box" style={{ marginBottom: 12 }}>
              <div className="cs-box-title">Mana</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#3b6ea5', textAlign: 'center' }}>
                {c.mana.current} / {c.mana.max}
              </div>
            </div>
          )}

          {/* Features & Traits */}
          <div className="cs-box">
            <div className="cs-box-title">Features &amp; Traits</div>
            {(c.features ?? []).length === 0 && (
              <p style={{ fontSize: 11, color: '#8b6914', fontStyle: 'italic' }}>No features yet.</p>
            )}
            {(c.features ?? []).map((f) => (
              <div key={f.id} className="cs-feature">
                <span className="cs-feature-name">{f.name}</span>
                <span className="cs-feature-source">{f.source}</span>
                {f.uses && <span className="cs-feature-uses"> ({f.uses.remaining}/{f.uses.max}, {f.uses.rechargeOn.replace('-', ' ')})</span>}
                {f.isPassive && <span style={{ fontSize: 9, color: '#2d8a4e', marginLeft: 4 }}>passive</span>}
                <div className="cs-feature-desc">{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── BOTTOM ROW ── */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="cs-bottom-grid">

        {/* LEFT: Equipment & Inventory */}
        <div>
          {/* Proficiencies */}
          <div className="cs-box" style={{ marginBottom: 12 }}>
            <div className="cs-box-title">Proficiencies</div>
            {(c.proficiencies?.armor ?? []).length > 0 && (
              <div className="cs-prof-group">
                <span className="cs-prof-cat">Armor: </span>
                <span className="cs-prof-list">{c.proficiencies.armor.join(', ')}</span>
              </div>
            )}
            {(c.proficiencies?.weapons ?? []).length > 0 && (
              <div className="cs-prof-group">
                <span className="cs-prof-cat">Weapons: </span>
                <span className="cs-prof-list">{c.proficiencies.weapons.join(', ')}</span>
              </div>
            )}
            {(c.proficiencies?.tools ?? []).length > 0 && (
              <div className="cs-prof-group">
                <span className="cs-prof-cat">Tools: </span>
                <span className="cs-prof-list">{c.proficiencies.tools.join(', ')}</span>
              </div>
            )}
            {(c.proficiencies?.languages ?? []).length > 0 && (
              <div className="cs-prof-group">
                <span className="cs-prof-cat">Languages: </span>
                <span className="cs-prof-list">{c.proficiencies.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Equipment & Inventory */}
          <div className="cs-box" style={{ marginBottom: 12 }}>
            <div className="cs-box-title">Equipment &amp; Inventory</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c4952a', marginBottom: 8 }}>
              💰 {c.gold ?? 0} Gold
            </div>
            {(c.inventory ?? []).map((item, i) => (
              <div key={i} className="cs-equip-item">{item}</div>
            ))}
            {(c.inventory ?? []).length === 0 && (
              <p style={{ fontSize: 11, color: '#8b6914', fontStyle: 'italic' }}>No items.</p>
            )}
            <div style={{ marginTop: 8, fontSize: 10, color: '#6a5a4a' }}>
              Carry Weight: {c.carryWeight ?? 0} / {c.carryCapacity ?? 150} lbs ({c.encumbrance ?? 'light'})
            </div>
          </div>
        </div>

        {/* RIGHT: Spellcasting OR Personality */}
        <div>
          {/* Spellcasting */}
          {c.spellcasting && (
            <div className="cs-box" style={{ marginBottom: 12 }}>
              <div className="cs-box-title">Spellcasting</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#8b4513' }}>Ability: </span>
                  <span style={{ textTransform: 'uppercase' }}>{c.spellcasting.ability}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#8b4513' }}>Save DC: </span>
                  {c.spellcasting.spellSaveDC}
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#8b4513' }}>Attack: </span>
                  {fmt(c.spellcasting.spellAttackBonus)}
                </div>
              </div>

              {/* Spell Slots */}
              {(c.spellcasting.spellSlots ?? []).length > 0 && (
                <div className="cs-slots-row">
                  {c.spellcasting.spellSlots.map((slot) => (
                    <div key={slot.level} className="cs-slot-group">
                      <div className="cs-slot-label">Level {slot.level}</div>
                      <div className="cs-slot-dots">
                        {Array.from({ length: slot.total }).map((_, i) => (
                          <div key={i} className={`cs-slot-dot ${i < slot.remaining ? 'filled' : ''}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cantrips */}
              {(c.spellcasting.cantrips ?? []).length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b4513', marginTop: 8, marginBottom: 4 }}>
                    CANTRIPS
                  </div>
                  {c.spellcasting.cantrips.map((sp) => (
                    <div key={sp.id} className="cs-spell">
                      <span className="cs-spell-name">{sp.name}</span>
                      <span className="cs-spell-meta"> — {sp.school}</span>
                      {sp.damage && <span className="cs-spell-damage"> [{sp.damage}]</span>}
                      <div className="cs-spell-desc">{sp.description}</div>
                    </div>
                  ))}
                </>
              )}

              {/* Spells */}
              {(c.spellcasting.knownSpells ?? []).length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b4513', marginTop: 10, marginBottom: 4 }}>
                    SPELLS
                  </div>
                  {c.spellcasting.knownSpells.map((sp) => (
                    <div key={sp.id} className="cs-spell">
                      <span className="cs-spell-name">{sp.name}</span>
                      <span className="cs-spell-meta"> — Lv{sp.level} {sp.school} • {sp.castingTime} • {sp.range}</span>
                      {sp.damage && <span className="cs-spell-damage"> [{sp.damage}]</span>}
                      <div className="cs-spell-desc">{sp.description}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Personality */}
          <div className="cs-box">
            <div className="cs-box-title">Personality</div>
            {(c.personality?.traits ?? []).length > 0 && (
              <div className="cs-personality-field">
                <div className="cs-personality-label">Traits</div>
                {c.personality.traits.map((t, i) => (
                  <div key={i} className="cs-personality-value">&ldquo;{t}&rdquo;</div>
                ))}
              </div>
            )}
            <div className="cs-personality-field">
              <div className="cs-personality-label">Ideal</div>
              <div className="cs-personality-value">{c.personality?.ideal || '—'}</div>
            </div>
            <div className="cs-personality-field">
              <div className="cs-personality-label">Bond</div>
              <div className="cs-personality-value">{c.personality?.bond || '—'}</div>
            </div>
            <div className="cs-personality-field">
              <div className="cs-personality-label">Flaw</div>
              <div className="cs-personality-value">{c.personality?.flaw || '—'}</div>
            </div>
            {c.appearance && (
              <div className="cs-personality-field">
                <div className="cs-personality-label">Appearance</div>
                <div className="cs-personality-value">{c.appearance}</div>
              </div>
            )}
            {c.backstory && (
              <div className="cs-personality-field">
                <div className="cs-personality-label">Backstory</div>
                <div className="cs-personality-value">{c.backstory}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="cs-footer">
        <span>Created: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</span>
        <span>Sessions: {c.sessionCount ?? 0} • Play time: {Math.floor((c.playTimeMinutes ?? 0) / 60)}h {(c.playTimeMinutes ?? 0) % 60}m</span>
        <span>{c.race} {c.class} • Level {c.level}</span>
      </div>
    </div>
  );
}
