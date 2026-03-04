'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Character } from '@/lib/types/character';
import type { PortraitRecord, PortraitMilestone, CharacterGallery } from '@/lib/types/gallery';
import { MILESTONE_LABELS } from '@/lib/types/gallery';

interface PortraitGalleryProps {
  character: Character;
  characterId: string;
  worldGenre?: string;
  worldData?: Record<string, unknown>;
}

export default function PortraitGallery({ character, characterId, worldGenre, worldData }: PortraitGalleryProps) {
  const [gallery, setGallery] = useState<CharacterGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedPortrait, setSelectedPortrait] = useState<PortraitRecord | null>(null);
  const [milestoneChoice, setMilestoneChoice] = useState<PortraitMilestone>('custom');
  const [customLabel, setCustomLabel] = useState('');
  const [storyContext, setStoryContext] = useState('');
  const [showGenForm, setShowGenForm] = useState(false);

  // ── Load gallery ──
  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/character-portrait/gallery?characterId=${characterId}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      } else {
        // Gallery might not exist yet — that's fine
        setGallery({ characterId, visualIdentity: null, portraits: [] });
      }
    } catch {
      setGallery({ characterId, visualIdentity: null, portraits: [] });
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  // ── Auto-suggest milestone based on level ──
  useEffect(() => {
    const lvl = character.level;
    if (gallery && gallery.portraits.length === 0) {
      setMilestoneChoice('creation');
    } else if (lvl >= 20 && !gallery?.portraits.some(p => p.milestone === 'level-20')) {
      setMilestoneChoice('level-20');
    } else if (lvl >= 15 && !gallery?.portraits.some(p => p.milestone === 'level-15')) {
      setMilestoneChoice('level-15');
    } else if (lvl >= 10 && !gallery?.portraits.some(p => p.milestone === 'level-10')) {
      setMilestoneChoice('level-10');
    } else if (lvl >= 5 && !gallery?.portraits.some(p => p.milestone === 'level-5')) {
      setMilestoneChoice('level-5');
    }
  }, [character.level, gallery]);

  // ── Generate portrait ──
  const handleGenerate = async () => {
    console.log('[Gallery] handleGenerate CLICKED', { characterId, milestoneChoice, generating });
    if (generating) {
      console.log('[Gallery] Already generating, skipping');
      return;
    }
    try {
      setGenerating(true);
      setError('');

      const payload = {
        character,
        characterId,
        milestone: milestoneChoice,
        storyContext: storyContext || undefined,
        label: customLabel || undefined,
        worldGenre,
        worldData,
      };
      console.log('[Gallery] Sending portrait request...', { milestone: milestoneChoice, characterId });

      const res = await fetch('/api/character-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[Gallery] Response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('[Gallery] Portrait generated successfully', { hasPortrait: !!data.portrait, hasVI: !!data.visualIdentity });

      // Add to local gallery state
      setGallery(prev => prev ? {
        ...prev,
        visualIdentity: data.visualIdentity || prev.visualIdentity,
        portraits: [...prev.portraits, data.portrait],
      } : prev);

      setShowGenForm(false);
      setCustomLabel('');
      setStoryContext('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[Gallery] Generate error:', msg);
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="gallery-container">
        <style>{galleryStyles}</style>
        <div className="gallery-loading">Loading gallery...</div>
      </div>
    );
  }

  const portraits = gallery?.portraits ?? [];
  const hasIdentity = !!gallery?.visualIdentity;

  return (
    <div className="gallery-container">
      <style>{galleryStyles}</style>

      {/* ── Header ── */}
      <div className="gallery-header">
        <h2 className="gallery-title">🎨 Portrait Gallery</h2>
        <div className="gallery-subtitle">
          {portraits.length} portrait{portraits.length !== 1 ? 's' : ''}
          {hasIdentity && <span className="gallery-identity-badge"> • Visual identity locked</span>}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="gallery-error">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')} className="gallery-error-dismiss">✕</button>
        </div>
      )}

      {/* ── Gallery grid ── */}
      {portraits.length > 0 ? (
        <div className="gallery-grid">
          {portraits.map((p) => (
            <div
              key={p.id}
              className={`gallery-card ${selectedPortrait?.id === p.id ? 'selected' : ''}`}
              onClick={() => setSelectedPortrait(selectedPortrait?.id === p.id ? null : p)}
            >
              <div className="gallery-card-img-wrap">
                <img
                  src={p.imageUrl}
                  alt={p.label}
                  className="gallery-card-img"
                  loading="lazy"
                />
              </div>
              <div className="gallery-card-info">
                <div className="gallery-card-label">{p.label}</div>
                <div className="gallery-card-meta">
                  Lv{p.characterLevel} • {MILESTONE_LABELS[p.milestone]}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">
          <div className="gallery-empty-icon">🖼️</div>
          <p>No portraits yet. Generate your first character portrait below!</p>
          {!hasIdentity && (
            <p className="gallery-empty-hint">
              The AI will first analyze your character sheet to create a consistent visual identity,
              then generate the portrait. Future portraits will match the same art style.
            </p>
          )}
        </div>
      )}

      {/* ── Selected portrait detail ── */}
      {selectedPortrait && (
        <div className="gallery-detail">
          <div className="gallery-detail-img-wrap">
            <img src={selectedPortrait.imageUrl} alt={selectedPortrait.label} className="gallery-detail-img" />
          </div>
          <div className="gallery-detail-info">
            <h3>{selectedPortrait.label}</h3>
            <p className="gallery-detail-meta">
              Level {selectedPortrait.characterLevel} • {MILESTONE_LABELS[selectedPortrait.milestone]} • {selectedPortrait.model}
            </p>
            <p className="gallery-detail-date">
              Generated: {new Date(selectedPortrait.createdAt).toLocaleDateString()}
            </p>
            <details className="gallery-detail-prompt">
              <summary>View Prompt</summary>
              <p>{selectedPortrait.prompt}</p>
            </details>
          </div>
        </div>
      )}

      {/* ── Generate button / form ── */}
      {!showGenForm ? (
        <button
          onClick={() => {
            console.log('[Gallery] Opening generate form');
            setShowGenForm(true);
          }}
          className="gallery-gen-btn"
          disabled={generating}
        >
          {portraits.length === 0
            ? '✨ Generate First Portrait'
            : '🎨 Generate New Portrait'}
        </button>
      ) : (
        <div className="gallery-gen-form">
          <h3 className="gallery-gen-title">Generate Portrait</h3>

          {/* Milestone selector */}
          <div className="gallery-gen-field">
            <label className="gallery-gen-label">Milestone</label>
            <select
              value={milestoneChoice}
              onChange={(e) => setMilestoneChoice(e.target.value as PortraitMilestone)}
              className="gallery-gen-select"
            >
              <option value="creation">The Beginning (Level 1)</option>
              <option value="level-5">Rising Adventurer (Level 5)</option>
              <option value="level-10">Seasoned Hero (Level 10)</option>
              <option value="level-15">Legendary Champion (Level 15)</option>
              <option value="level-20">Epic Destiny (Level 20)</option>
              <option value="story-moment">Story Moment</option>
              <option value="custom">Custom Portrait</option>
            </select>
          </div>

          {/* Custom label */}
          <div className="gallery-gen-field">
            <label className="gallery-gen-label">Custom Label (optional)</label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. After defeating the dragon"
              className="gallery-gen-input"
            />
          </div>

          {/* Story context (for story-moment / custom) */}
          {(milestoneChoice === 'story-moment' || milestoneChoice === 'custom') && (
            <div className="gallery-gen-field">
              <label className="gallery-gen-label">Scene Description</label>
              <textarea
                value={storyContext}
                onChange={(e) => setStoryContext(e.target.value)}
                placeholder="Describe the scene or moment you want depicted..."
                className="gallery-gen-textarea"
                rows={3}
              />
            </div>
          )}

          {!hasIdentity && (
            <div className="gallery-gen-notice">
              <strong>First portrait:</strong> The AI will analyze your character sheet to create a visual identity
              before generating. This takes a few extra seconds but ensures all future portraits are consistent.
            </div>
          )}

          <div className="gallery-gen-actions">
            <button
              onClick={(e) => {
                console.log('[Gallery] Submit button clicked', e.type);
                handleGenerate();
              }}
              disabled={generating}
              className="gallery-gen-submit"
            >
              {generating ? (
                <span className="gallery-gen-spinner">
                  <span className="spinner" /> Generating{!hasIdentity ? ' (creating visual identity...)' : '...'}
                </span>
              ) : (
                '🎨 Generate'
              )}
            </button>
            <button
              onClick={() => setShowGenForm(false)}
              disabled={generating}
              className="gallery-gen-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Visual Identity Info ── */}
      {gallery?.visualIdentity && (
        <details className="gallery-vi-details">
          <summary className="gallery-vi-summary">🔒 Visual Identity (Art Style Lock)</summary>
          <div className="gallery-vi-content">
            <p><strong>Art Style:</strong> {gallery.visualIdentity.artStyle}</p>
            <p><strong>Prompt Prefix:</strong></p>
            <p className="gallery-vi-prompt">{gallery.visualIdentity.promptPrefix}</p>
            <p className="gallery-vi-date">
              Created: {new Date(gallery.visualIdentity.createdAt).toLocaleDateString()}
            </p>
            <button
              onClick={async () => {
                if (!confirm('This will regenerate your visual identity using improved genre-aware prompts. Your existing portraits will be kept, but new portraits will use the updated style. Continue?')) return;
                try {
                  setGenerating(true);
                  setError('');
                  console.log('[Gallery] Regenerating visual identity...');
                  const res = await fetch('/api/character-portrait', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      character,
                      characterId,
                      milestone: milestoneChoice,
                      worldGenre,
                      worldData,
                      forceNewIdentity: true,
                    }),
                  });
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(err.error || `Failed: ${res.status}`);
                  }
                  const data = await res.json();
                  setGallery(prev => prev ? {
                    ...prev,
                    visualIdentity: data.visualIdentity || prev.visualIdentity,
                    portraits: [...prev.portraits, data.portrait],
                  } : prev);
                  console.log('[Gallery] Visual identity regenerated');
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : String(e);
                  console.error('[Gallery] Regenerate VI error:', msg);
                  setError(msg);
                } finally {
                  setGenerating(false);
                }
              }}
              disabled={generating}
              className="gallery-vi-regen"
            >
              🔄 Regenerate Visual Identity
            </button>
          </div>
        </details>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES (self-contained, works in both game page and print page)
// ═══════════════════════════════════════════════════════════════════
const galleryStyles = `
  .gallery-container {
    max-width: 850px;
    margin: 24px auto;
    padding: 0 16px;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }

  .gallery-header { margin-bottom: 16px; }
  .gallery-title {
    font-size: 22px;
    font-weight: 800;
    color: #2c1810;
    font-family: Georgia, serif;
    margin: 0;
  }
  .gallery-subtitle { font-size: 12px; color: #6a5a4a; margin-top: 4px; }
  .gallery-identity-badge { color: #2d8a4e; font-weight: 600; }

  .gallery-loading {
    text-align: center;
    padding: 32px;
    color: #8b6914;
    font-style: italic;
  }

  .gallery-error {
    background: #fdf2f2;
    border: 1px solid #e8a0a0;
    color: #8b2020;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }
  .gallery-error-dismiss {
    background: none;
    border: none;
    color: #8b2020;
    cursor: pointer;
    font-size: 16px;
  }

  /* ── Grid ── */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  .gallery-card {
    border: 2px solid #c4a882;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    background: #fefcf5;
  }
  .gallery-card:hover { border-color: #8b4513; box-shadow: 0 4px 12px rgba(139,69,19,0.15); }
  .gallery-card.selected { border-color: #c4952a; box-shadow: 0 0 0 2px #c4952a40; }
  .gallery-card-img-wrap {
    aspect-ratio: 1;
    overflow: hidden;
    background: #e8dcc8;
  }
  .gallery-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gallery-card-info { padding: 8px 10px; }
  .gallery-card-label { font-size: 12px; font-weight: 700; color: #2c1810; }
  .gallery-card-meta { font-size: 10px; color: #6a5a4a; margin-top: 2px; }

  /* ── Empty state ── */
  .gallery-empty {
    text-align: center;
    padding: 32px 16px;
    color: #6a5a4a;
    background: #fefcf5;
    border: 2px dashed #c4a882;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  .gallery-empty-icon { font-size: 48px; margin-bottom: 12px; }
  .gallery-empty-hint { font-size: 12px; color: #8b6914; margin-top: 8px; font-style: italic; }

  /* ── Detail view ── */
  .gallery-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    background: #fefcf5;
    border: 2px solid #c4a882;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .gallery-detail-img-wrap { border-radius: 6px; overflow: hidden; }
  .gallery-detail-img { width: 100%; display: block; border-radius: 6px; }
  .gallery-detail-info h3 { font-size: 16px; font-weight: 700; color: #2c1810; margin: 0 0 8px; }
  .gallery-detail-meta { font-size: 12px; color: #6a5a4a; }
  .gallery-detail-date { font-size: 11px; color: #8b6914; margin-top: 4px; }
  .gallery-detail-prompt {
    margin-top: 8px;
    font-size: 11px;
    color: #4a3a2a;
  }
  .gallery-detail-prompt summary {
    cursor: pointer;
    color: #8b4513;
    font-weight: 600;
  }
  .gallery-detail-prompt p { margin-top: 4px; line-height: 1.5; }

  /* ── Gen button ── */
  .gallery-gen-btn {
    display: block;
    width: 100%;
    padding: 12px;
    background: #8b4513;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 12px;
  }
  .gallery-gen-btn:hover { background: #a0522d; }
  .gallery-gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Gen form ── */
  .gallery-gen-form {
    background: #fefcf5;
    border: 2px solid #c4a882;
    border-radius: 8px;
    padding: 20px;
    margin-top: 12px;
  }
  .gallery-gen-title { font-size: 16px; font-weight: 700; color: #2c1810; margin: 0 0 14px; }
  .gallery-gen-field { margin-bottom: 12px; }
  .gallery-gen-label { display: block; font-size: 11px; font-weight: 700; color: #8b4513; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .gallery-gen-select, .gallery-gen-input, .gallery-gen-textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1.5px solid #c4a882;
    border-radius: 6px;
    font-size: 13px;
    background: #fdf6e3;
    color: #2c1810;
    font-family: inherit;
  }
  .gallery-gen-select:focus, .gallery-gen-input:focus, .gallery-gen-textarea:focus {
    outline: none;
    border-color: #8b4513;
  }
  .gallery-gen-textarea { resize: vertical; }

  .gallery-gen-notice {
    background: #f5ecd8;
    border: 1px solid #dcc9a8;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 12px;
    color: #5a3a28;
    margin-bottom: 12px;
  }

  .gallery-gen-actions { display: flex; gap: 10px; }
  .gallery-gen-submit {
    flex: 1;
    padding: 10px;
    background: #8b4513;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .gallery-gen-submit:hover { background: #a0522d; }
  .gallery-gen-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .gallery-gen-cancel {
    padding: 10px 20px;
    background: transparent;
    color: #5a3a28;
    border: 1.5px solid #c4a882;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }
  .gallery-gen-cancel:hover { background: #f5ecd8; }

  .gallery-gen-spinner { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Visual Identity details ── */
  .gallery-vi-details {
    margin-top: 16px;
    background: #f5ecd8;
    border: 1px solid #dcc9a8;
    border-radius: 6px;
    padding: 0;
  }
  .gallery-vi-summary {
    cursor: pointer;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #8b4513;
  }
  .gallery-vi-content { padding: 0 14px 14px; font-size: 12px; color: #4a3a2a; }
  .gallery-vi-content p { margin: 6px 0; }
  .gallery-vi-prompt { font-style: italic; line-height: 1.5; background: #fefcf5; padding: 8px; border-radius: 4px; }
  .gallery-vi-date { font-size: 10px; color: #8b6914; }
  .gallery-vi-regen {
    margin-top: 10px;
    padding: 6px 14px;
    background: transparent;
    color: #8b4513;
    border: 1.5px solid #c4a882;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .gallery-vi-regen:hover { background: #fefcf5; }
  .gallery-vi-regen:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Print: hide interactive elements ── */
  @media print {
    .gallery-gen-btn,
    .gallery-gen-form,
    .gallery-vi-details,
    .gallery-error,
    .gallery-gen-cancel,
    .gallery-gen-submit { display: none; }
    .gallery-card { border: 1px solid #ccc; }
    .gallery-detail { page-break-inside: avoid; }
  }
`;
