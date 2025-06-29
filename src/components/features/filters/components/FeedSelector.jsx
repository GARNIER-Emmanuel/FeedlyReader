import React from "react";

export default function FeedSelector({ feeds, selectedFeed, setSelectedFeed, selectedFolder }) {
  // Les feeds sont déjà des objets avec name et url
  const folderFeeds = feeds.map((feed) => {
    // Si c'est déjà un objet avec name et url, l'utiliser tel quel
    if (typeof feed === 'object' && feed.name && feed.url) {
      return feed;
    }
    
    // Si c'est une string (URL), créer un objet
    if (typeof feed === 'string') {
      try {
        const url = new URL(feed);
        const hostname = url.hostname.replace('www.', '');
        return {
          name: hostname,
          url: feed,
          folder: selectedFolder
        };
      } catch (error) {
        console.warn('URL invalide:', feed);
        return {
          name: feed,
          url: feed,
          folder: selectedFolder
        };
      }
    }
    
    return feed;
  });

  // Debug: afficher les feeds pour diagnostiquer
  console.log('FeedSelector - feeds reçus:', feeds);
  console.log('FeedSelector - folderFeeds traités:', folderFeeds);

  return (
    <select
      value={selectedFeed}
      onChange={(e) => setSelectedFeed(e.target.value)}
      className="form-select form-select-sm"
      style={{ minWidth: "180px" }}
    >
      <option value="">Tous les feeds du dossier</option>
      {folderFeeds.map((feed) => (
        <option key={feed.url || feed.name} value={feed.name}>
          {feed.name}
        </option>
      ))}
    </select>
  );
}
