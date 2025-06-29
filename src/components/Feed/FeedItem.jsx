import React, { useState, useEffect, useRef } from "react";
import '../Style/Feed.css';

export default function FeedItem({ article }) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const storageKey = `read-${article.id}`;
  const [read, setRead] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved === "true";
  });

  const handleReadChange = () => {
    const newValue = !read;
    setRead(newValue);
    localStorage.setItem(storageKey, newValue.toString());
  };

  const handleImageError = () => {
    setImageError(true);
  };

const fullText = article.fullContent || article.content || article.summary || "";

  const formattedDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date inconnue";

  // Fonction pour extraire une image de l'article
  const getArticleImage = () => {
    // L'image est maintenant extraite au niveau du Feed, donc on peut l'utiliser directement
    if (article.image) return article.image;
    
    // Fallback simple si aucune image n'est disponible
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
  };

  // Fonction pour obtenir un résumé propre
  const getCleanSummary = () => {
    const summary = article.summary || article.description || "";
    // Nettoyer le HTML et limiter à 150 caractères
    const cleanText = summary.replace(/<[^>]*>/g, '').trim();
    return cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const articleImage = getArticleImage();
  const cleanSummary = getCleanSummary();

  return (
    <div
      ref={ref}
      className={`card feed-item-card h-100 shadow-sm ${visible ? "animate__animated animate__fadeIn" : "opacity-0"} ${read ? "read" : ""}`}
    >
      { !expanded ? (
        <div className="card-body d-flex flex-column h-100">
          {/* Section Image */}
          <div className="article-image-container mb-3">
            <img
              src={articleImage}
              alt={article.title}
              className="card-img-top article-image"
              onError={handleImageError}
              style={{ 
                height: 200, 
                objectFit: "cover", 
                borderRadius: 8,
                width: "100%"
              }}
            />
          </div>

          <div className="flex-grow-1">
            {/* Titre */}
            <h5 className="card-title mb-2">{article.title}</h5>
            
            {/* Badges d'information */}
            <div className="d-flex flex-wrap fs-7 mb-3" style={{ gap: '0.5rem' }}>
              <span className="badge bg-primary">{article.source}</span>
              <span className="badge bg-secondary">🗓️ {formattedDate}</span>
              <span className="badge bg-info">⏱️ {article.readingTime || '~3'} min</span>
            </div>
            
            {/* Description résumé */}
            {cleanSummary && (
              <div className="article-summary mb-3">
                <p className="card-text summary-text">
                  {cleanSummary}
            </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center">
              <div className="form-check form-switch custom-read-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`readSwitch-${article.id}`}
                  checked={read}
                  onChange={handleReadChange}
                />
                <label className="form-check-label" htmlFor={`readSwitch-${article.id}`}>
                  Lu
                </label>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setExpanded(true)}
              >
                Lire ici
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="card-title">{article.title}</h5>
            <div className="form-check form-switch custom-read-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`readSwitch-${article.id}`}
                checked={read}
                onChange={handleReadChange}
              />
              <label className="form-check-label" htmlFor={`readSwitch-${article.id}`}>
                Lu
              </label>
            </div>
          </div>

          <div className="mb-3">
            <span className="badge bg-primary me-2">{article.source}</span>
            <span className="badge bg-secondary me-2">🗓️ {formattedDate}</span>
            <span className="badge bg-info">⏱️ {article.readingTime || '~3'} min</span>
          </div>

          <div
            className="article-content mb-3"
            dangerouslySetInnerHTML={{
              __html: fullText,
            }}
          ></div>

          <div className="d-flex justify-content-between align-items-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link custom-read-link"
            >
              🔗 Lire sur le site
            </a>

            <button
              onClick={() => setExpanded(false)}
              className="btn btn-secondary btn-sm"
              type="button"
            >
              Réduire
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
