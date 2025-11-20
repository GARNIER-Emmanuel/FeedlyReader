import React, { useEffect, useState, useCallback } from "react";
import FeedItem from "../FeedItem";
import ArticleSkeleton from "../ArticleSkeleton";
import SearchBar from "../../../filters/components/SearchBar";
import ReadingTimeFilter from "../../../filters/components/ReadingTimeFilter";
import SortOrderSelector from "../../../filters/components/SortOrderSelector";
import FeedSelector from "../../../filters/components/FeedSelector";
import SourceFilter from "../../../filters/components/SourceFilter";
import PopularityFilter from "../../../filters/components/PopularityFilter";
import CategoryFilter from "../../../filters/components/CategoryFilter";
import useFeeds from "../../../../../hooks/useFeeds";
import "../../styles/Feed.css";

function Feed({ feeds, selectedFolder, onDeleteFeed, showRandomArticle = false, isRandomLoading = false, onFilterChange, onSelectArticle, embedded = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReadingTime, setFilterReadingTime] = useState("all");
  const [filterSource, setFilterSource] = useState("");
  const [filterPopularity, setFilterPopularity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const INITIAL_VISIBLE = 10;
  const LOAD_MORE_STEP = 10;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [selectedFeed, setSelectedFeed] = useState(""); // feed sélectionné dans le dossier
  const [randomArticle, setRandomArticle] = useState(null);

  const { allArticles, sortedArticles, loading, lastLoadKey, forceRefresh, getCacheStatus } = useFeeds(
    feeds || [],
    selectedFeed,
    { searchTerm, filterReadingTime, sortBy, sortOrder, filterSource, filterPopularity, filterCategory, selectedFolder }
  );

  // Recharger les articles quand feeds ou selectedFeed changent
  useEffect(() => {
    setSelectedFeed(""); // reset sélection feed quand dossier change
  }, [feeds]);

  // Fonction pour gérer le changement de recherche avec scroll
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  }, [onFilterChange]);

  // Fonction pour gérer le changement de filtre de temps de lecture avec scroll
  const handleReadingTimeChange = useCallback((newFilterReadingTime) => {
    setFilterReadingTime(newFilterReadingTime);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  }, [onFilterChange]);

  // Fonction pour gérer le changement de tri avec scroll
  const handleSortChange = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  }, [onFilterChange]);

  // Fonction pour gérer le changement de feed sélectionné avec scroll
  const handleFeedChange = useCallback((newSelectedFeed) => {
    // logging kept for debugging
    // console.log('=== CHANGEMENT DE FEED ===', selectedFeed, newSelectedFeed, feeds);
    setSelectedFeed(newSelectedFeed);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  }, [onFilterChange, feeds]);

  // Fonction pour obtenir la clé de cache d'un feed
  const getCacheKey = (feed) => {
    // Les feeds sont déjà des objets avec name et url
    const feedName = feed.name;
    const feedUrl = feed.url;
    return `${feedName}-${feedUrl}`;
  };

  // Fonction pour créer un objet feed à partir d'une URL (pour compatibilité)
  const createFeedObject = (feed) => {
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
          url: feed
        };
      } catch (error) {
        console.warn('URL invalide dans createFeedObject:', feed);
        return {
          name: feed,
          url: feed
        };
      }
    }
    return feed;
  };

  // Fonction pour vérifier si le cache est valide (15 minutes)
  const isCacheValid = (timestamp) => {
    return timestamp && (Date.now() - timestamp) < 15 * 60 * 1000; // 15 minutes
  };

  // Fonction pour calculer le temps de lecture rapidement
  const calculateReadingTime = (text) => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
  };

  // useFeeds hook gère le chargement et le cache des articles
  // lastLoadKey permet de notifier les effets qui dépendent du rechargement

  // Le hook useFeeds gère le cache, pas besoin de charger les timestamps ici

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
    if (!embedded) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedFeed, searchTerm, filterReadingTime, embedded]);

  useEffect(() => {
    if (embedded) return; // pas de bouton retour en haut en mode embarqué

    const handleScrollToTopButton = () => {
      const button = document.getElementById("scrollToTop");
      if (button) {
        if (window.scrollY > 100) {
          button.classList.remove("d-none");
        } else {
          button.classList.add("d-none");
        }
      }
    };

    const debouncedHandleScroll = () => {
      setTimeout(handleScrollToTopButton, 10);
    };

    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [embedded]);

 
  // sortedArticles is provided by the useFeeds hook (already filtered & sorted according to options)

  // Sélectionner un article aléatoire si demandé
  useEffect(() => {
    if (showRandomArticle && sortedArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * sortedArticles.length);
      setRandomArticle(sortedArticles[randomIndex]);
    } else {
      setRandomArticle(null);
    }
  }, [showRandomArticle, sortedArticles]);

  
  const visibleArticles = sortedArticles.slice(0, visibleCount);

  // CSS grid classes: 1 column on mobile, 2 on tablet, 3 on desktop
  const gridClasses = 'feed-grid';

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + LOAD_MORE_STEP);
  }, []);

  useEffect(() => {
    if (!loading) {
      const audio = new Audio(
        visibleArticles.length > 0 ? '/audio/ding.mp3' : '/audio/wrongding.mp3'
      );
      audio.play().catch(console.warn);
    }
  }, [lastLoadKey, loading, visibleArticles.length]);

  // Utiliser la fonction exportée par le hook
  // cacheStatus peut être utilisé si besoin
  const cacheStatus = getCacheStatus ? getCacheStatus() : { total: feeds.length, cached: 0 };
  
  return (
    <div className={`feed-container ${embedded ? 'embedded' : 'container-fluid px-0'}`} style={{ minHeight: embedded ? 'auto' : '600px' }}>
      <div className="filter-bar mb-4 d-flex flex-column flex-md-row flex-wrap gap-3 align-items-stretch">
        {!embedded && (
          <>
            <div className="flex-fill">
              <SearchBar value={searchTerm} onChange={handleSearchChange} />
            </div>
            <div className="flex-fill">
              <ReadingTimeFilter value={filterReadingTime} onChange={handleReadingTimeChange} />
            </div>
            <div className="flex-fill">
              <SortOrderSelector
                sortBy={sortBy}
                sortOrder={sortOrder}
                setSortBy={(newSortBy) => handleSortChange(newSortBy, sortOrder)}
                setSortOrder={(newSortOrder) => handleSortChange(sortBy, newSortOrder)}
              />
            </div>
            <div className="flex-fill">
              <FeedSelector
                feeds={feeds}
                selectedFeed={selectedFeed}
                setSelectedFeed={handleFeedChange}
                selectedFolder={selectedFolder}
              />
            </div>

            {/* Restored filters: Source, Popularity, Category (if folders provided) */}
            <div className="flex-fill">
              <SourceFilter
                sources={(feeds || []).map(f => (typeof f === 'object' ? f.name : (new URL(f).hostname.replace('www.',''))))}
                value={filterSource}
                onChange={(v) => { setFilterSource(v); if (onFilterChange) setTimeout(onFilterChange, 100); }}
              />
            </div>
            <div className="flex-fill">
              <PopularityFilter value={filterPopularity} onChange={(v) => { setFilterPopularity(v); if (onFilterChange) setTimeout(onFilterChange, 100); }} />
            </div>
            <div className="flex-fill">
              <CategoryFilter categories={[]} value={filterCategory} onChange={(v) => { setFilterCategory(v); if (onFilterChange) setTimeout(onFilterChange, 100); }} />
            </div>
          </>
        )}
        {embedded && (
          <>
            <div style={{ minWidth: 200 }}>
              <SearchBar value={searchTerm} onChange={handleSearchChange} />
            </div>
            <div style={{ minWidth: 140 }}>
              <ReadingTimeFilter value={filterReadingTime} onChange={handleReadingTimeChange} />
            </div>
          </>
        )}
      </div>

      <div className="feed-content-wrapper">
        {/* Loading skeleton + spinner to keep layout stable while feeds load */}
        {loading && (
          <>
            <div className="d-flex justify-content-center my-2">
              <div className="spinner-border text-primary" role="status" aria-hidden="true">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>

            <div className={`feed-skeleton-grid ${gridClasses}`} aria-hidden="true">
              {Array.from({ length: INITIAL_VISIBLE }).map((_, i) => (
                <div key={i} className="feed-grid-item">
                  <ArticleSkeleton />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Random article loading state */}
        {!loading && showRandomArticle && isRandomLoading && (
          <div className="d-flex justify-content-center align-items-center my-5" style={{ minHeight: '320px' }}>
            <div className="text-center">
              <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Sélection d'un article aléatoire...</span>
              </div>
              <h4 className="text-success">🎲 Sélection d'un article aléatoire...</h4>
              <p className="text-muted">Nous cherchons le meilleur article pour vous !</p>
            </div>
          </div>
        )}

        {/* When loaded but no articles, keep the container height */}
        {!loading && !showRandomArticle && visibleArticles.length === 0 && (
          <div className="text-center my-4 empty-state" style={{ minHeight: '320px' }}>Aucun article trouvé.</div>
        )}

        {/* Normal article list rendering */}
        {!loading && (
          <>
            {/* Affichage de l'article aléatoire */}
            {randomArticle && showRandomArticle && !isRandomLoading && (
              <div className="mb-1">
                <div className="text-center mb-1">
                  <h3 className="text-success">🎲 Article Aléatoire Sélectionné</h3>
                </div>
                <div className="row justify-content-center">
                  <div className="col-12 col-lg-8">
                    <div className="random-article-highlight">
                      <FeedItem article={randomArticle} onReadHere={onSelectArticle} embedded={embedded} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Afficher les articles normaux seulement si pas en mode article aléatoire */}
            {!showRandomArticle && (
              <>
                <div className={gridClasses}>
                  {visibleArticles.map((article) => (
                      <article key={article.id} className="feed-grid-item">
                        <FeedItem article={article} onReadHere={onSelectArticle} embedded={embedded} />
                      </article>
                    ))}
                </div>

                <div className="feed-progress-wrapper">
                  <div className="feed-progress-bar">
                    <div
                      className="feed-progress-fill"
                      style={{
                        width: `${(visibleArticles.length / (sortedArticles.length || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="feed-progress-label">
                    {selectedFeed
                      ? `${visibleArticles.length} sur ${sortedArticles.length} articles dans ${selectedFeed}`
                      : `${visibleArticles.length} sur ${sortedArticles.length} articles dans ${selectedFolder}`}
                  </div>
                </div>

                {visibleArticles.length < sortedArticles.length && (
                  <div className="text-center my-4">
                    <button className="btn btn-primary px-4 py-2" onClick={loadMore} aria-label="Charger plus d'articles">Voir plus</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Flèche retour en haut */}
      <button
        className="scroll-to-top-btn position-fixed bottom-0 end-0 m-4 shadow d-none"
        id="scrollToTop"
        style={{ zIndex: 9999 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
      >
        ↑
      </button>
    </div>
  );
}

// Memoize FeedList to avoid full re-renders when feeds or folder don't change
const feedPropsAreEqual = (prev, next) => {
  if (prev.embedded !== next.embedded) return false;
  if (prev.selectedFolder !== next.selectedFolder) return false;
  const prevFeeds = prev.feeds || [];
  const nextFeeds = next.feeds || [];
  if (prevFeeds.length !== nextFeeds.length) return false;
  const prevUrls = prevFeeds.map(f => (typeof f === 'object' ? f.url : f)).join('|');
  const nextUrls = nextFeeds.map(f => (typeof f === 'object' ? f.url : f)).join('|');
  return prevUrls === nextUrls;
};

export default React.memo(Feed, feedPropsAreEqual);