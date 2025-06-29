import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo">
          <h1>📰 Feedly Reader</h1>
        </div>
        <nav className="header-nav">
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/feeds">Flux</a></li>
            <li><a href="/about">À propos</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 