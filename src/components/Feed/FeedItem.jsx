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

  const fullText = article.content || article.summary || "";

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
    className={`card feed-item-card mb-4 shadow-sm ${
      visible ? "animate__animated animate__fadeIn" : "opacity-0"
    } ${read ? "read" : ""}`}
  >
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

    <h6 className="article-source">Source : {article.source}</h6>

    <p className="article-date">🗓️ Publié le : {formattedDate}</p>

    <p className="article-reading-time">⏱️ Temps de lecture estimé : {article.readingTime} min</p>

    <p
      className="article-content"
      dangerouslySetInnerHTML={{
        __html: expanded ? fullText : fullText.slice(0, 200) + "…",
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
        onClick={() => setExpanded(!expanded)}
        className="btn btn-primary custom-expand-btn"
        type="button"
      >
        {expanded ? "Réduire" : "Lire ici"}
      </button>
    </div>
  </div>
);
}