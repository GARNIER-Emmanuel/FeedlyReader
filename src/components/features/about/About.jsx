import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">À propos de Feedly Reader</h1>
            <p className="hero-subtitle">
              Votre lecteur RSS moderne et personnalisable pour rester informé
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <h2>Notre Mission</h2>
              <p className="mission-text">
                Feedly Reader est né de la volonté de créer une expérience de lecture RSS 
                moderne, intuitive et personnalisable. Dans un monde où l'information 
                circule à vitesse grand V, nous croyons qu'il est essentiel de pouvoir 
                organiser et consommer le contenu qui nous intéresse de manière efficace.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>Fonctionnalités Principales</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">📰</div>
                <h3>Gestion des Flux RSS</h3>
                <p>
                  Ajoutez, organisez et gérez vos flux RSS préférés avec une interface 
                  intuitive. Créez des dossiers personnalisés pour organiser vos sources.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Recherche Avancée</h3>
                <p>
                  Trouvez rapidement les articles qui vous intéressent grâce à notre 
                  système de recherche et de filtrage avancé.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Performance Optimisée</h3>
                <p>
                  Une application rapide et réactive, optimisée pour une expérience 
                  de lecture fluide et agréable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="technology-section">
          <h2>Technologies Utilisées</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="tech-card">
                <h4>Frontend</h4>
                <ul>
                  <li>React.js - Interface utilisateur moderne</li>
                  <li>Vite - Build tool rapide</li>
                  <li>Bootstrap - Design responsive</li>
                  <li>CSS3 - Styles personnalisés</li>
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tech-card">
                <h4>Fonctionnalités</h4>
                <ul>
                  <li>RSS Parser - Lecture des flux</li>
                  <li>LocalStorage - Sauvegarde locale</li>
                  <li>Responsive Design - Compatible mobile</li>
                  <li>PWA Ready - Application web progressive</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <h2>L'Équipe</h2>
          <div className="row g-4">
            <div className="col-lg-8 mx-auto">
              <div className="team-card">
                <div className="team-avatar">👨‍💻</div>
                <h3>Développeur Full-Stack</h3>
                <p>
                  Passionné par les technologies web modernes et l'expérience utilisateur, 
                  j'ai créé Feedly Reader pour offrir une alternative moderne aux lecteurs 
                  RSS traditionnels.
                </p>
                <div className="team-skills">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">JavaScript</span>
                  <span className="skill-tag">CSS3</span>
                  <span className="skill-tag">RSS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2>Contact</h2>
          <div className="row">
            <div className="col-lg-6 mx-auto">
              <div className="contact-info">
                <p>
                  Vous avez des questions, des suggestions ou souhaitez contribuer au projet ? 
                  N'hésitez pas à nous contacter !
                </p>
                <div className="contact-links">
                  <a href="mailto:manu.boidun@gmail.com" className="contact-link">
                    📧 manu.boidun@gmail.com
                  </a>
                  <a href="https://github.com/feedlyreader" className="contact-link">
                    🐙 GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About; 