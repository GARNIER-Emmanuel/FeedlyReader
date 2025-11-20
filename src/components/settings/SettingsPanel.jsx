import React, { useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext.jsx';

export default function SettingsPanel() {
  const { settings, setSetting, open, setOpen } = useSettings();
  const dialogRef = useRef(null);
  const firstFocusable = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      // Focus first control when opened
      setTimeout(() => { firstFocusable.current?.focus(); }, 0);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title" ref={dialogRef}>
      <div className="settings-panel glass">
        <div className="settings-header">
          <h2 id="settings-title">Paramètres</h2>
          <button className="settings-close focus-ring" aria-label="Fermer les paramètres" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
        <div className="settings-content">
          <section aria-labelledby="accent-title">
            <h3 id="accent-title">Couleur d'accent</h3>
            <div className="accent-grid" role="group" aria-label="Choisir la couleur d'accent">
              {['violet','indigo','blue','cyan','gold'].map((a, idx) => (
                <button
                  key={a}
                  ref={idx===0 ? firstFocusable : undefined}
                  className={`accent-chip ${settings.accent===a ? 'active' : ''} focus-ring`}
                  onClick={() => setSetting('accent', a)}
                  aria-pressed={settings.accent===a}
                >{a}</button>
              ))}
            </div>
          </section>

          <section aria-labelledby="font-title">
            <h3 id="font-title">Taille de police</h3>
            <input
              type="range"
              min="0.9" max="1.2" step="0.05"
              value={settings.fontScale}
              onChange={(e) => setSetting('fontScale', parseFloat(e.target.value))}
              aria-label="Ajuster la taille de la police"
            />
            <div className="hint">{Math.round(settings.fontScale*100)}%</div>
          </section>

          <section aria-labelledby="density-title">
            <h3 id="density-title">Densité de l'interface</h3>
            <div role="radiogroup" aria-label="Choisir la densité">
              <label className="radio">
                <input type="radio" name="density" value="comfortable" checked={settings.density==='comfortable'} onChange={()=>setSetting('density','comfortable')} />
                <span>Confort</span>
              </label>
              <label className="radio">
                <input type="radio" name="density" value="compact" checked={settings.density==='compact'} onChange={()=>setSetting('density','compact')} />
                <span>Compact</span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
