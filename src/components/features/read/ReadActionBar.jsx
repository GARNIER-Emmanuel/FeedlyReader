import React from 'react';

export default function ReadActionBar({ onRefreshAll, onRandomArticle, stickyEnabled = false, onToggleSticky }) {
  return (
    <section className="glass action-bar" aria-label="Actions de lecture">
      <div className="action-bar-inner">
        <div className="left">
          <h2 className="neon" style={{margin:0, fontSize:'1.1rem'}}>Lecture</h2>
          <p className="hint" style={{margin:0}}>Gérez vos flux et explorez de nouveaux articles</p>
        </div>
        <div className="right" style={{display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center'}}>
          <button className="btn-accent focus-ring" onClick={onRandomArticle} type="button" title="Choisir un article au hasard">
            🎲 Aléatoire
          </button>
          <button className="btn-accent focus-ring" onClick={onRefreshAll} type="button" title="Rafraîchir les flux">
            🔄 Actualiser
          </button>

          {/* Sticky toggle */}
          <button
            type="button"
            className={`btn ${stickyEnabled ? 'btn-primary' : 'btn-outline-primary'} focus-ring`}
            onClick={() => onToggleSticky && onToggleSticky(!stickyEnabled)}
            aria-pressed={stickyEnabled}
            title={stickyEnabled ? 'Désactiver sticky' : 'Activer sticky'}
          >
            {stickyEnabled ? '📌 Sticky ON' : '📌 Sticky OFF'}
          </button>
        </div>
      </div>
    </section>
  );
}
