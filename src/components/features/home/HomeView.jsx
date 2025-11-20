import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeView() {
  const navigate = useNavigate();
  return (
    <div className="home-grid">
      <section className="hero glass">
        <h1 className="neon">Bienvenue</h1>
        <p className="lead">Un lecteur RSS moderne, clair et personnalisable.
        Choisissez une action pour commencer.</p>
        <div className="hero-actions">
          <button className="btn-accent-lg focus-ring" onClick={() => navigate('/read')}>
            📖 Lire mes articles
          </button>
          <button className="btn-accent-lg focus-ring" onClick={() => navigate('/feeds')}>
            🧩 Gérer mes flux
          </button>
          <button className="btn-secondary-lg focus-ring" onClick={() => navigate('/about')}>
            ℹ️ En savoir plus
          </button>
        </div>
      </section>
      <section className="tips glass">
        <h2>Astuce</h2>
        <ul>
          <li>Appuyez sur Tab pour naviguer au clavier. Utilisez le lien « Aller au contenu » pour sauter l'entête.</li>
          <li>Dans Paramètres, changez la couleur d'accent, la taille de police et la densité.</li>
          <li>Mode sombre/clair accessible depuis la barre latérale.</li>
        </ul>
      </section>
    </div>
  );
}
