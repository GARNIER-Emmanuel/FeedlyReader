import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/Feed.css";
import ArticleCard from "../ArticleCard";
import { useToast } from '../../../../ui/ToastContext.jsx';

function FeedItem({ article, onReadHere, embedded = false }) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const storageKey = `read-${article.id}`;
  const [read, setRead] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved === "true";
  });
  const showToast = useToast();

  const handleReadChange = useCallback(() => {
    const newValue = !read;
    setRead(newValue);
    try { localStorage.setItem(storageKey, newValue.toString()); } catch (e) { /* ignore */ }
  }, [read, storageKey]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const fullText = article.fullContent || article.content || article.summary || "";

  const formattedDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date inconnue";

  const getArticleImage = () => {
    if (article.image) return article.image;
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
  };

  const getCleanSummary = () => {
    const summary = article.summary || article.description || "";
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

  const handleOpen = useCallback(() => {
    if (onReadHere) { onReadHere(article); }
    else { setExpanded(true); }
  }, [onReadHere, article]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  }, [handleOpen]);

  // Non-expanded: render ArticleCard for consistency and reuse
  if (!expanded) {
    return (
      <div ref={ref} role="article" aria-label={article.title} tabIndex={0} onKeyDown={handleKeyDown} className={`${visible ? "animate__animated animate__fadeIn" : "opacity-0"}`}>
        <ArticleCard
          article={{ ...article, summary: cleanSummary }}
          onReadHere={onReadHere}
          onOpen={(a) => window.open(a.url, '_blank')}
          read={read}
          onToggleRead={(a) => {
            handleReadChange();
          }}
        />
      </div>
    );
  }

  // Expanded view shows full content
  return (
    <div ref={ref} className={`card feed-card h-100 shadow-sm ${visible ? "animate__animated animate__fadeIn" : "opacity-0"}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="card-title">{article.title}</h5>
            <div className="form-check form-switch custom-read-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`readSwitch-${article.id}`}
                checked={read}
                onChange={() => {
                  handleReadChange();
                  try { showToast && showToast(read ? `Marqué comme non lu: ${article.title}` : `Marqué comme lu: ${article.title}`, 'success'); } catch(e) {}
                }}
                aria-label={read ? `Marquer ${article.title} comme non lu` : `Marquer ${article.title} comme lu`}
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

        <div className="article-content mb-3" dangerouslySetInnerHTML={{ __html: fullText }} />

        <div className="d-flex justify-content-between align-items-center">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-link custom-read-link" aria-label={`Ouvrir ${article.title} sur le site`}>🔗 Lire sur le site</a>

          <button onClick={() => setExpanded(false)} className="btn btn-secondary btn-sm" type="button" aria-label={`Réduire ${article.title}`}>Réduire</button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FeedItem);
