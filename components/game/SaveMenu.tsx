// ============================================================
// SAVE MENU — Save/load interface
// ============================================================
'use client';

import React, { useState, useEffect } from 'react';
import { listSaves, loadSave, deleteSave, quickSave, manualSave } from '@/lib/services/save-service';
import type { SaveState } from '@/lib/types/session';
import type { SavePayload } from '@/lib/services/save-service';

interface SaveMenuProps {
  currentPayload: SavePayload;
  onLoad: (payload: SavePayload) => void;
  onClose: () => void;
}

type Tab = 'save' | 'load';

export default function SaveMenu({ currentPayload, onLoad, onClose }: SaveMenuProps) {
  const [tab, setTab] = useState<Tab>('save');
  const [saves, setSaves] = useState<SaveState[]>([]);
  const [saveLabel, setSaveLabel] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSaves(listSaves());
  }, []);

  const refresh = () => setSaves(listSaves());

  const handleQuickSave = () => {
    quickSave(currentPayload);
    setMessage('Quick Save created!');
    refresh();
    setTimeout(() => setMessage(''), 2000);
  };

  const handleManualSave = () => {
    const label = saveLabel.trim() || `Save ${new Date().toLocaleString()}`;
    manualSave(currentPayload, label);
    setSaveLabel('');
    setMessage(`Saved: ${label}`);
    refresh();
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLoad = (save: SaveState) => {
    const payload = loadSave(save.id);
    if (payload) {
      onLoad(payload);
    } else {
      setMessage('Failed to load save data.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleDelete = (saveId: string) => {
    deleteSave(saveId);
    setMessage('Save deleted.');
    refresh();
    setTimeout(() => setMessage(''), 2000);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const saveTypeIcon = (type: string) => {
    switch (type) {
      case 'auto': return '🔄';
      case 'quick': return '⚡';
      case 'manual': return '💾';
      default: return '📁';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-dark-800 border border-dark-600 rounded-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
          <h2 className="font-cinzel text-lg text-primary-400">Save &amp; Load</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-200 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-600">
          <button
            onClick={() => setTab('save')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'save'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            Save
          </button>
          <button
            onClick={() => setTab('load')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'load'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            Load ({saves.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Message */}
          {message && (
            <div className="mb-3 p-2 bg-green-900/20 border border-green-800 rounded text-sm text-green-400 text-center">
              {message}
            </div>
          )}

          {tab === 'save' && (
            <div className="space-y-4">
              {/* Quick save */}
              <button
                onClick={handleQuickSave}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
              >
                ⚡ Quick Save
              </button>

              {/* Manual save */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  placeholder="Save label (optional)"
                  className="w-full bg-dark-700 border border-dark-600 rounded p-2 text-sm text-dark-200 focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleManualSave}
                  className="w-full py-2 bg-dark-600 hover:bg-dark-500 rounded text-sm font-medium transition-colors"
                >
                  💾 Save Game
                </button>
              </div>

              <p className="text-xs text-dark-500 text-center">
                Auto-saves happen at key story moments.
              </p>
            </div>
          )}

          {tab === 'load' && (
            <div className="space-y-2">
              {saves.length === 0 ? (
                <p className="text-sm text-dark-400 text-center py-8">No saves found.</p>
              ) : (
                saves.map((save) => (
                  <div
                    key={save.id}
                    className="flex items-center gap-3 p-3 bg-dark-700 border border-dark-600 rounded hover:border-dark-500 transition-colors"
                  >
                    <span className="text-lg">{saveTypeIcon(save.saveType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-200 truncate">
                        {save.label || 'Unnamed Save'}
                      </p>
                      <p className="text-xs text-dark-400">
                        {save.character.name} Lv.{save.character.level} &middot;{' '}
                        {save.currentLocation} &middot; {formatDate(save.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoad(save)}
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-500 rounded text-xs font-medium transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(save.id)}
                        className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
