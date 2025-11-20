import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer glass">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📰 Feedly Reader</h3>
            <p>Votre lecteur de flux RSS moderne et intuitif</p>
          </div>
          
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul>
              <li><a href="#home">Accueil</a></li>
              <li><a href="#feeds">Mes Flux</a></li>
              <li><a href="#settings">Paramètres</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Aide</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Confidentialité</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Technologies</h4>
            <ul>
              <li>React</li>
              <li>Vite</li>
              <li>Bootstrap</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Feedly Reader. Tous droits réservés.</p>
          <div className="footer-social">
            <span>🚀 Propulsé par React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 