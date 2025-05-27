import React, { useState, useEffect, useRef } from "react";
import '../Style/Feed.css';

export default function FeedItem({ article }) {
  const [expanded, setExpanded] = useState(false);
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

const fullText = article.fullContent || article.content || article.summary || "";

  const formattedDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date inconnue";

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

  return (
    <div
      ref={ref}
      className={`card feed-item-card mb-4 shadow-sm ${visible ? "animate__animated animate__fadeIn" : "opacity-0"} ${read ? "read" : ""}`}
    >
      { !expanded ? (
        <div className="d-flex align-items-center p-3">
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }}
              className="me-3"
            />
          )}
          <div className="flex-grow-1 text-feeditem">
            <h5 className="mb-1">{article.title}</h5>
            <div className="d-flex flex-wrap fs-7 mb-2" style={{ gap: '1rem' }}>
              <span>Source : {article.source}</span>
              <span>🗓️ {formattedDate}</span>
              <span>⏱️ {article.readingTime} min</span>
            </div>
          </div>
          <div>
            <button
              className="btn btn-primary"
              onClick={() => setExpanded(true)}
            >
              Lire ici
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 text-feeditem">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5>{article.title}</h5>
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

          <h6>Source : {article.source}</h6>
          <p>🗓️ Publié le : {formattedDate}</p>
          <p>⏱️ Temps de lecture estimé : {article.readingTime} min</p>

          <p
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: fullText,
            }}
          ></p>

          <div className="d-flex justify-content-between align-items-center mt-3">
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
              className="btn btn-secondary"
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
