'use client';

import { useState, useCallback } from 'react';

// ─── Utilities ────────────────────────────────────────────────────────

/** camelCase / snake_case → Title Case */
function humanize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (s) => s.toUpperCase())
    .replace(/\bId\b/, 'ID')
    .replace(/\bNpc\b/, 'NPC')
    .replace(/\bXp\b/, 'XP')
    .replace(/\bHp\b/, 'HP');
}

/** Get a display title for an array item (tries name → title → id → index) */
function itemTitle(item: unknown, index: number): string {
  if (typeof item !== 'object' || item === null) return `Item ${index + 1}`;
  const obj = item as Record<string, unknown>;
  return String(obj.name || obj.title || obj.label || obj.id || `Item ${index + 1}`);
}

/** Keys to skip in display (internal/auto-generated) */
const SKIP_KEYS = new Set(['id', 'createdAt', 'updatedAt', 'characterId']);

// ─── Field Components ─────────────────────────────────────────────────

function StringField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const inputClasses =
    'w-full bg-slate-800/60 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-sm ' +
    'focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:outline-none transition-colors';

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {multiline ? (
        <textarea
          className={inputClasses + ' resize-y min-h-[56px]'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          className={inputClasses}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function BooleanField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500/40"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function StringListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, '']);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              className="flex-1 bg-slate-800/60 border border-slate-700 rounded px-3 py-1 text-slate-200 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 focus:outline-none"
              value={v}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              onClick={() => remove(i)}
              className="text-slate-500 hover:text-red-400 px-1.5 text-sm transition-colors"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
      >
        + Add item
      </button>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────

function Collapsible({
  title,
  defaultOpen = false,
  depth = 0,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  depth?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bg = depth === 0 ? 'bg-slate-800/30' : depth === 1 ? 'bg-slate-800/20' : 'bg-slate-800/10';

  return (
    <div className={`rounded-lg border border-slate-700/50 ${bg} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
      >
        <span className={`text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        <span className="truncate">{title}</span>
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

// ─── Main Recursive Editor ────────────────────────────────────────────

interface JsonEditorProps {
  data: unknown;
  onChange: (updated: unknown) => void;
  depth?: number;
  maxDepth?: number;
}

export default function GenericJsonEditor({
  data,
  onChange,
  depth = 0,
  maxDepth = 4,
}: JsonEditorProps) {
  // Safety: don't recurse too deep
  if (depth > maxDepth) {
    return <pre className="text-xs text-slate-500 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
  }

  if (data === null || data === undefined) return null;

  // ── Primitive ──
  if (typeof data === 'string') {
    return (
      <StringField
        label=""
        value={data}
        onChange={(v) => onChange(v)}
        multiline={data.length > 80}
      />
    );
  }
  if (typeof data === 'number') {
    return (
      <input
        type="number"
        className="w-24 bg-slate-800/60 border border-slate-700 rounded px-3 py-1 text-slate-200 text-sm focus:border-sky-500 focus:outline-none"
        value={data}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }
  if (typeof data === 'boolean') {
    return <BooleanField label="" value={data} onChange={(v) => onChange(v)} />;
  }

  // ── Array ──
  if (Array.isArray(data)) {
    // Array of primitives (strings/numbers)
    if (data.length === 0 || typeof data[0] === 'string') {
      return <StringListField label="" values={data as string[]} onChange={onChange} />;
    }

    // Array of objects
    return (
      <div className="space-y-2">
        {data.map((item, i) => (
          <Collapsible key={i} title={itemTitle(item, i)} depth={depth}>
            <GenericJsonEditor
              data={item}
              depth={depth + 1}
              maxDepth={maxDepth}
              onChange={(updated) => {
                const next = [...data];
                next[i] = updated;
                onChange(next);
              }}
            />
          </Collapsible>
        ))}
      </div>
    );
  }

  // ── Object ──
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => !SKIP_KEYS.has(k));

    const updateKey = useCallback(
      (key: string, value: unknown) => {
        onChange({ ...obj, [key]: value });
      },
      [obj, onChange]
    );

    return (
      <div className="space-y-3">
        {keys.map((key) => {
          const value = obj[key];
          if (value === null || value === undefined) return null;
          const label = humanize(key);

          // Simple string
          if (typeof value === 'string') {
            return (
              <StringField
                key={key}
                label={label}
                value={value}
                onChange={(v) => updateKey(key, v)}
                multiline={value.length > 80}
              />
            );
          }

          // Number
          if (typeof value === 'number') {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-slate-400">{label}</label>
                <input
                  type="number"
                  className="w-24 bg-slate-800/60 border border-slate-700 rounded px-3 py-1 text-slate-200 text-sm focus:border-sky-500 focus:outline-none"
                  value={value}
                  onChange={(e) => updateKey(key, Number(e.target.value))}
                />
              </div>
            );
          }

          // Boolean
          if (typeof value === 'boolean') {
            return (
              <BooleanField
                key={key}
                label={label}
                value={value}
                onChange={(v) => updateKey(key, v)}
              />
            );
          }

          // Array of strings
          if (Array.isArray(value) && (value.length === 0 || typeof value[0] === 'string')) {
            return (
              <StringListField
                key={key}
                label={label}
                values={value as string[]}
                onChange={(v) => updateKey(key, v)}
              />
            );
          }

          // Array of objects
          if (Array.isArray(value)) {
            return (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">{label}</label>
                <div className="space-y-2">
                  {value.map((item, i) => (
                    <Collapsible key={i} title={itemTitle(item, i)} depth={depth + 1}>
                      <GenericJsonEditor
                        data={item}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                        onChange={(updated) => {
                          const next = [...value];
                          next[i] = updated;
                          updateKey(key, next);
                        }}
                      />
                    </Collapsible>
                  ))}
                </div>
              </div>
            );
          }

          // Nested object
          if (typeof value === 'object') {
            return (
              <Collapsible key={key} title={label} depth={depth} defaultOpen={depth < 1}>
                <GenericJsonEditor
                  data={value}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onChange={(updated) => updateKey(key, updated)}
                />
              </Collapsible>
            );
          }

          return null;
        })}
      </div>
    );
  }

  return null;
}
