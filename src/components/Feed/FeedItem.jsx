import React, { useState } from "react";

export default function FeedItem({ article }) {
  const [expanded, setExpanded] = useState(false);

  const fullText = article.content || article.summary || "";

  return (
    <div
      className="card mb-4 shadow-sm border border-primary"
      style={{ borderColor: "#bae6fd", borderRadius: "1rem", backgroundColor: "#e0f2fe" }}
    >
      <div className="card-body">
        <h5 className="card-title text-primary mb-1" style={{ fontWeight: "700" }}>
          {article.title}
        </h5>
        <h6 className="card-subtitle mb-2 text-muted" style={{ fontSize: "0.8rem" }}>
          Source : {article.source}
        </h6>
        <p className="text-primary" style={{ fontSize: "0.9rem", marginBottom: "0.8rem" }}>
          ⏱️ Temps de lecture estimé : {article.readingTime} min
        </p>

            <p
          className="card-text text-secondary article-content"
          style={{ fontSize: "0.9rem", lineHeight: "1.4" }}
          dangerouslySetInnerHTML={{
            __html: expanded ? fullText : fullText.slice(0, 200) + "…",
          }}
        ></p>


        <div className="d-flex justify-content-between align-items-center mt-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary fw-semibold"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.color = "#0c63e4")}
            onMouseLeave={(e) => (e.target.style.color = "#0d6efd")}
          >
            🔗 Lire sur le site
          </a>

          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-primary btn-sm rounded-pill px-3"
            style={{ backgroundColor: "#7dd3fc", borderColor: "#7dd3fc" }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#38bdf8";
              e.target.style.borderColor = "#38bdf8";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#7dd3fc";
              e.target.style.borderColor = "#7dd3fc";
            }}
          >
            {expanded ? "Réduire" : "Lire ici"}
          </button>
        </div>
      </div>
    </div>
  );
}
