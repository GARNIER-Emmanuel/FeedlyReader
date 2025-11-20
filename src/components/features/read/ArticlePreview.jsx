import React from 'react';

function ArticlePreview({ article }) {
  if (!article) {
    // No article selected: render nothing (hide the preview panel)
    return null;
  }

  const formattedDate = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' })
    : 'Date inconnue';

  const fullText = article.fullContent || article.content || article.summary || '';
  const image = article.image || null;

  return (
    <aside className="glass panel" aria-live="polite" aria-label={`Aperçu: ${article.title}`}>
      <div className="panel-inner">
        {image && (
          <div className="mb-3">
            <img src={image} alt="Illustration de l'article" loading="lazy" decoding="async" style={{width:'100%', borderRadius:12, maxHeight:220, objectFit:'cover'}} />
          </div>
        )}
        <h3 style={{marginTop: 0}}>{article.title}</h3>
        <div className="mb-2" style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
          {article.source && <span className="badge bg-primary">{article.source}</span>}
          <span className="badge bg-secondary">🗓️ {formattedDate}</span>
          <span className="badge bg-info">⏱️ {article.readingTime || '~3'} min</span>
        </div>
        <div className="article-content mb-3" dangerouslySetInnerHTML={{ __html: fullText }} />
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'.5rem'}}>
          {article.url && (
            <a className="btn btn-link" href={article.url} target="_blank" rel="noopener noreferrer">🔗 Lire sur le site</a>
          )}
        </div>
      </div>
    </aside>
  );
}

// Memoize to avoid re-renders when article prop is unchanged
export default React.memo(ArticlePreview, (prev, next) => {
  if (!prev.article && !next.article) return true;
  if (!prev.article || !next.article) return false;
  return prev.article.id === next.article.id && prev.article.pubDate === next.article.pubDate;
});
