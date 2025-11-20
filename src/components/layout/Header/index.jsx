import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import { useSettings } from '../../settings/SettingsContext.jsx';

const Header = ({ theme = 'dark', onToggleTheme = () => {} }) => {
  const isDark = theme === 'dark';
  const { setOpen } = useSettings();
  return (
    <header className="app-header glass" role="banner">
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <div className="header-container">
        <div className="header-logo">
          <h1 className="neon" aria-label="Feedly Reader">🛰️ Feedly Reader</h1>
        </div>
        <nav className="header-nav" aria-label="Navigation principale">
          <ul>
            <li><NavLink className={({isActive}) => `focus-ring ${isActive ? 'active' : ''}`} to="/">Accueil</NavLink></li>
            <li><NavLink className={({isActive}) => `focus-ring ${isActive ? 'active' : ''}`} to="/feeds">Flux</NavLink></li>
            <li><NavLink className={({isActive}) => `focus-ring ${isActive ? 'active' : ''}`} to="/about">À propos</NavLink></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="settings-toggle focus-ring"
            aria-label={'Ouvrir les paramètres'}
            title={'Paramètres'}
            onClick={() => setOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19.4 15a7.96 7.96 0 0 0 .08-1 7.96 7.96 0 0 0-.08-1l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a8.1 8.1 0 0 0-1.73-1l-.38-2.65A.5.5 0 0 0 13.8 2h-3.6a.5.5 0 0 0-.49.38l-.38 2.65a8.1 8.1 0 0 0-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L4.4 13a7.96 7.96 0 0 0 0 2l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.54.41 1.12.76 1.73 1l.38 2.65c.06.23.26.38.49.38h3.6c.23 0 .43-.15.49-.38l.38-2.65c.61-.24 1.19-.59 1.73-1l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64L19.4 15z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button
            type="button"
            className="theme-toggle focus-ring"
            aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            onClick={onToggleTheme}
          >
            {isDark ? (
              // Sun icon
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              // Moon icon
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 