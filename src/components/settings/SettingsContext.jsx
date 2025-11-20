import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULTS = {
  theme: 'dark', // kept in App but mirrored here for completeness
  accent: 'violet', // options: violet, indigo, blue, cyan, gold
  fontScale: 1, // 0.9..1.2
  density: 'comfortable', // comfortable | compact
};

const STORAGE_KEY = 'ui-settings';

const SettingsContext = createContext({
  settings: DEFAULTS,
  setSetting: (_key, _value) => {},
  open: false,
  setOpen: (_b) => {},
});

export function SettingsProvider({ children }) {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  })();

  const [settings, setSettings] = useState({ ...DEFAULTS, ...saved });
  const [open, setOpen] = useState(false);

  // Apply settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Accent colors map to existing palette tokens
    const accents = {
      violet: { a: 'var(--c-indigo)', b: 'var(--c-violet)' },
      indigo: { a: '#4f46e5', b: '#6366f1' },
      blue:   { a: '#2563eb', b: 'var(--c-blue)' },
      cyan:   { a: '#06b6d4', b: 'var(--c-cyan)' },
      gold:   { a: '#f59e0b', b: 'var(--c-gold)' },
    };

    const sel = accents[settings.accent] || accents.violet;
    root.style.setProperty('--accent-a', sel.a);
    root.style.setProperty('--accent-b', sel.b);

    // Font scale via percentage applied to root font-size
    const clamped = Math.max(0.9, Math.min(1.2, Number(settings.fontScale) || 1));
    root.style.setProperty('--font-scale', clamped.toString());
    root.style.setProperty('--density-scale', settings.density === 'compact' ? '0.85' : '1');

    // persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const value = useMemo(() => ({ settings, setSetting, open, setOpen }), [settings, open]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() { return useContext(SettingsContext); }
