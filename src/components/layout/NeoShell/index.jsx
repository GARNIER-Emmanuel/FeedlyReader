import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../settings/SettingsContext.jsx';

export default function NeoShell({ children, theme = 'dark', onToggleTheme = () => {} }) {
  const { setOpen } = useSettings();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  return (
    <div className="neo-shell">
      <aside className="neo-sidebar glass" role="navigation" aria-label="Navigation latérale">
        <div className="brand" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(e)=> (e.key==='Enter'||e.key===' ') && navigate('/') } aria-label="Accueil Feedly Reader">
          <span className="logo">🛰️</span>
          <span className="title">Feedly Reader</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => `nav-item focus-ring ${isActive?'active':''}`} end>
            <span className="icon">🏠</span><span className="label">Accueil</span>
          </NavLink>
          <NavLink to="/read" className={({isActive}) => `nav-item focus-ring ${isActive?'active':''}`}>
            <span className="icon">📖</span><span className="label">Lecture</span>
          </NavLink>
          <NavLink to="/feeds" className={({isActive}) => `nav-item focus-ring ${isActive?'active':''}`}>
            <span className="icon">🧩</span><span className="label">Mes flux</span>
          </NavLink>
          <NavLink to="/about" className={({isActive}) => `nav-item focus-ring ${isActive?'active':''}`}>
            <span className="icon">ℹ️</span><span className="label">À propos</span>
          </NavLink>
        </nav>
        <div className="sidebar-actions">
          <button className="btn-accent focus-ring" onClick={() => setOpen(true)} aria-label="Ouvrir les paramètres">⚙️ Paramètres</button>
          <button className="btn-accent focus-ring" onClick={onToggleTheme} aria-label={isDark? 'Activer le mode clair' : 'Activer le mode sombre'}>
            {isDark ? '🌞 Clair' : '🌙 Sombre'}
          </button>
        </div>
      </aside>
      <div className="neo-main">
        <header className="neo-topbar glass" role="banner">
          <a href="#main-content" className="skip-link">Aller au contenu</a>
          <div className="topbar-inner">
            <div className="search-wrap">
              <input className="search-input focus-ring" placeholder="Rechercher..." aria-label="Rechercher" />
            </div>
            <div className="top-actions">
              <button className="icon-btn focus-ring" title="Paramètres" aria-label="Paramètres" onClick={() => setOpen(true)}>⚙️</button>
              <button className="icon-btn focus-ring" title="Thème" aria-label="Basculer le thème" onClick={onToggleTheme}>{isDark?'🌞':'🌙'}</button>
            </div>
          </div>
        </header>
        <main id="main-content" className="neo-content">
          {children}
        </main>
        <footer className="neo-footer glass" role="contentinfo">
          <div className="foot-inner">© {new Date().getFullYear()} Feedly Reader • Interface Neo</div>
        </footer>
      </div>
    </div>
  );
}
