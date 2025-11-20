import React, { useCallback, useState } from 'react';
import '../../styles/Feed.css';

function ArticleCard({ article, onReadHere, onOpen, read, onToggleRead }) {
  const formattedDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' })
    : 'Date inconnue';

  const handleOpen = useCallback(() => {
    if (onReadHere) onReadHere(article);
  }, [onReadHere, article]);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErrored, setImgErrored] = useState(false);
  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23071228"/></svg>';

  return (
    <div className={`card feed-card h-100 shadow-sm ${read ? 'read' : ''}`} tabIndex={-1}>
      <div className={`article-image-container image-top ${imgLoaded ? 'image-loaded' : 'image-loading'}`}>
        {!imgLoaded && (
          <div className="image-placeholder" aria-hidden="true"></div>
        )}
        <img
          src={imgErrored ? placeholder : article.image}
          alt={article.title}
          className={`article-image-top large ${imgLoaded ? 'loaded' : 'loading'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgErrored(true); setImgLoaded(true); }}
        />
      </div>

      <div className="card-body p-3 d-flex flex-column">
        <h3 className="feed-card-title">{article.title}</h3>

        <div className="feed-card-meta d-flex flex-wrap mb-2" style={{ gap: '0.5rem' }}>
          {article.source && <span className="badge bg-primary">{article.source}</span>}
          <span className="badge bg-secondary">🗓️ {formattedDate}</span>
          <span className="badge bg-info">⏱️ {article.readingTime || '~3'} min</span>
        </div>

        {article.summary && (
          <p className="feed-card-summary">{article.summary}</p>
        )}

        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <div className="form-check form-switch custom-read-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`readSwitch-${article.id}`}
                checked={!!read}
                onChange={() => onToggleRead && onToggleRead(article)}
                aria-label={read ? `Marquer ${article.title} comme non lu` : `Marquer ${article.title} comme lu`}
              />
              <label className="form-check-label" htmlFor={`readSwitch-${article.id}`}>Lu</label>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onOpen && onOpen(article)} aria-label={`Ouvrir ${article.title} dans un nouvel onglet`}>Ouvrir</button>
            <button className="btn btn-primary btn-sm" onClick={handleOpen} aria-label={`Lire ${article.title}`} >Lire</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ArticleCard, (a,b) => a.article?.id === b.article?.id && a.read === b.read);
