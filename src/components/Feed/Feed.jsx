import { useEffect, useState } from "react";
import FeedItem from "./FeedItem";
import SearchBar from "../tools/SearchBar";
import ReadingTimeFilter from "../tools/ReadingTimeFilter";
import SortOrderSelector from "../tools/SortOrderSelector";
import FeedSelector from "../tools/FeedSelector";
import '../Style/Feed.css';

export default function Feed({ feeds, selectedFolder, onDeleteFeed, showRandomArticle = false, onFilterChange }) {
  const [allArticles, setAllArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReadingTime, setFilterReadingTime] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedFeed, setSelectedFeed] = useState(""); // feed sélectionné dans le dossier
  const [lastLoadKey, setLastLoadKey] = useState(0);
  const [randomArticle, setRandomArticle] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState({});

  // Recharger les articles quand feeds ou selectedFeed changent
  useEffect(() => {
    setSelectedFeed(""); // reset sélection feed quand dossier change
  }, [feeds]);

  // Fonction pour gérer le changement de recherche avec scroll
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  };

  // Fonction pour gérer le changement de filtre de temps de lecture avec scroll
  const handleReadingTimeChange = (newFilterReadingTime) => {
    setFilterReadingTime(newFilterReadingTime);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  };

  // Fonction pour gérer le changement de tri avec scroll
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  };

  // Fonction pour gérer le changement de feed sélectionné avec scroll
  const handleFeedChange = (newSelectedFeed) => {
    setSelectedFeed(newSelectedFeed);
    if (onFilterChange) {
      setTimeout(onFilterChange, 100);
    }
  };

  // Fonction pour obtenir la clé de cache d'un feed
  const getCacheKey = (feed) => `${feed.name}-${feed.url}`;

  // Fonction pour vérifier si le cache est valide (15 minutes)
  const isCacheValid = (timestamp) => {
    return timestamp && (Date.now() - timestamp) < 15 * 60 * 1000; // 15 minutes
  };

  // Fonction pour calculer le temps de lecture rapidement
  const calculateReadingTime = (text) => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
  };

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        // Si un feed est sélectionné, ne charger que celui-là
        const feedsToLoad = selectedFeed
          ? feeds.filter(feed => feed.name === selectedFeed)
          : feeds;

        const feedPromises = feedsToLoad.map(async (feed) => {
          try {
            const cacheKey = getCacheKey(feed);
            const cachedData = localStorage.getItem(`feed-cache-${cacheKey}`);
            const cachedTimestamp = cacheTimestamp[cacheKey];

            // Vérifier si on a un cache valide
            if (cachedData && isCacheValid(cachedTimestamp)) {
              console.log(`Utilisation du cache pour ${feed.name}`);
              return JSON.parse(cachedData);
            }

            console.log(`Chargement en cours pour ${feed.name}`);
          const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
          const res = await fetch(PROXY_URL);
          const data = await res.json();
            
            if (!data.contents) {
              console.warn(`Impossible de récupérer le contenu pour ${feed.name}`);
              return [];
            }
            
          const parser = new DOMParser();
          const xml = parser.parseFromString(data.contents, "text/xml");
            
            // Limiter le nombre d'articles par feed pour améliorer les performances
            const maxArticlesPerFeed = 20;
            const items = [...xml.querySelectorAll("item")].slice(0, maxArticlesPerFeed);
            
            const processedItems = await Promise.all(
              items.map(async (item, index) => {
                try {
              const title = item.querySelector("title")?.textContent || "";
              const summary = item.querySelector("description")?.textContent || "";
              const pubDate = item.querySelector("pubDate")?.textContent || "";
                  const link = item.querySelector("link")?.textContent || "";
                  
                  // Extraire l'image de l'article (logique simplifiée)
                  let imageUrl = null;
                  try {
                    // Essayer les enclosures d'abord
                    const enclosure = item.querySelector("enclosure[type^='image']");
                    if (enclosure) {
                      imageUrl = enclosure.getAttribute("url");
                    }
                    
                    // Si pas d'enclosure, essayer d'extraire du HTML
                    if (!imageUrl && summary) {
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = summary;
                      const img = tempDiv.querySelector('img');
                      if (img && img.src) {
                        imageUrl = img.src;
                      }
                    }
                  } catch (imageError) {
                    console.warn("Erreur lors de l'extraction d'image:", imageError);
                  }

                  // Image par défaut si aucune trouvée
                  if (!imageUrl) {
                    const defaultImages = {
                      'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop',
                      'Tech': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
                      'IA': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
                      'Sécurité': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
                      'default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'
                    };

                    let category = 'default';
                    const feedName = feed.name.toLowerCase();
                    if (feedName.includes('gaming') || feedName.includes('jeu')) category = 'Gaming';
                    else if (feedName.includes('tech') || feedName.includes('technologie')) category = 'Tech';
                    else if (feedName.includes('ia') || feedName.includes('intelligence')) category = 'IA';
                    else if (feedName.includes('sécurité') || feedName.includes('security')) category = 'Sécurité';

                    imageUrl = defaultImages[category] || defaultImages.default;
                  }

                  // Calcul rapide du temps de lecture (sans extraction complète)
                  const readingTime = calculateReadingTime(title + " " + summary);

              const popularity = Math.floor(Math.random() * 1000);
                  const article = {
                id: `${feed.name}-${index}`,
                title,
                summary,
                    url: link,
                    image: imageUrl,
                readingTime,
                popularity,
                source: feed.name,
                pubDate: pubDate ? new Date(pubDate) : null,
              };

                  return article;
                } catch (itemError) {
                  console.warn(`Erreur lors du traitement d'un article de ${feed.name}:`, itemError);
                  return null;
                }
              })
            );
            
            // Filtrer les articles null
            const validItems = processedItems.filter(item => item !== null);
            
            // Mettre en cache les résultats
            localStorage.setItem(`feed-cache-${cacheKey}`, JSON.stringify(validItems));
            setCacheTimestamp(prev => ({ ...prev, [cacheKey]: Date.now() }));
            
            return validItems;
          } catch (feedError) {
            console.error(`Erreur lors du chargement du feed ${feed.name}:`, feedError);
            return [];
          }
        });

        const allFeedsItems = await Promise.all(feedPromises);
        setAllArticles(allFeedsItems.flat());
        setVisibleCount(12);
        setLastLoadKey(prev => prev + 1);
      } catch (error) {
        console.error("Erreur lors du chargement des feeds", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [feeds, selectedFeed]);

  // Charger les timestamps de cache au démarrage
  useEffect(() => {
    const loadCacheTimestamps = () => {
      const timestamps = {};
      feeds.forEach(feed => {
        const cacheKey = getCacheKey(feed);
        const cachedData = localStorage.getItem(`feed-cache-${cacheKey}`);
        if (cachedData) {
          timestamps[cacheKey] = Date.now() - 10 * 60 * 1000; // 10 minutes par défaut
        }
      });
      setCacheTimestamp(timestamps);
    };
    
    loadCacheTimestamps();
  }, [feeds]);

  useEffect(() => {
    setVisibleCount(12);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedFeed, searchTerm, filterReadingTime]);


  useEffect(() => {
    const handleScroll = () => {
      const button = document.getElementById("scrollToTop");
      if (button) {
        if (window.scrollY > 100) {
          button.classList.remove("d-none");
        } else {
          button.classList.add("d-none");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

 
  // Filtres en chaîne
  const filteredBySearch = allArticles.filter(article => {
    const term = searchTerm.toLowerCase();
    return article.title.toLowerCase().includes(term) || article.summary.toLowerCase().includes(term);
  });

  const filteredByReadingTime = filteredBySearch.filter(article => {
    switch (filterReadingTime) {
      case "5":
        return article.readingTime <= 5;
      case "10":
        return article.readingTime > 5 && article.readingTime <= 10;
      case "20":
        return article.readingTime > 10 && article.readingTime <= 20;
      case "20plus":
        return article.readingTime > 20;
      default:
        return true;
    }
  });

  const filteredByFeed = selectedFeed
    ? filteredByReadingTime.filter(article => article.source === selectedFeed)
    : filteredByReadingTime;

  // Tri
  const sortedArticles = [...filteredByFeed].sort((a, b) => {
    if (sortBy === "popularity") {
      return sortOrder === "asc" ? a.popularity - b.popularity : b.popularity - a.popularity;
    }
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? (a.pubDate?.getTime() || 0) - (b.pubDate?.getTime() || 0)
        : (b.pubDate?.getTime() || 0) - (a.pubDate?.getTime() || 0);
    }
    return 0;
  });

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

  const loadMore = () => {
    setVisibleCount((count) => count + 12);
  };

  useEffect(() => {
    if (!loading) {
      const audio = new Audio(
        visibleArticles.length > 0 ? '/audio/ding.mp3' : '/audio/wrongding.mp3'
      );
      audio.play().catch(console.warn);
    }
  }, [lastLoadKey]);

  // Fonction pour forcer le rafraîchissement du cache
  const forceRefresh = () => {
    // Vider tous les caches
    feeds.forEach(feed => {
      const cacheKey = getCacheKey(feed);
      localStorage.removeItem(`feed-cache-${cacheKey}`);
    });
    setCacheTimestamp({});
    setLastLoadKey(prev => prev + 1);
  };

  // Fonction pour obtenir le statut du cache
  const getCacheStatus = () => {
    const totalFeeds = feeds.length;
    const cachedFeeds = feeds.filter(feed => {
      const cacheKey = getCacheKey(feed);
      const cachedData = localStorage.getItem(`feed-cache-${cacheKey}`);
      return cachedData && isCacheValid(cacheTimestamp[cacheKey]);
    }).length;
    
    return { total: totalFeeds, cached: cachedFeeds };
  };

  const cacheStatus = getCacheStatus();
  
  return (
  <div className="feed-container container-fluid px-3">
    {/* Bouton de rafraîchissement simple */}
    <div className="cache-status-bar mb-3">
      <div className="d-flex justify-content-end">
        <button 
          className="btn btn-sm refresh-button"
          onClick={forceRefresh}
          title="Forcer le rafraîchissement de tous les feeds"
        >
          <span className="refresh-icon">🔄</span>
          <span className="refresh-text">Actualiser</span>
        </button>
      </div>
    </div>

    <div className="filter-bar mb-4 d-flex flex-column flex-md-row flex-wrap gap-3 align-items-stretch">
      <div className="flex-fill">
        <SearchBar value={searchTerm} onChange={handleSearchChange} />
      </div>
      <div className="flex-fill">
         <ReadingTimeFilter value={filterReadingTime} onChange={handleReadingTimeChange} 
        />
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
          onDeleteFeed={onDeleteFeed}
        />
      </div>
    </div>

   {loading ? (
    <div className="d-flex justify-content-center align-items-center my-5" style={{ minHeight: '200px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>
    ) : visibleArticles.length === 0 ? (
      <div className="text-center my-5">Aucun article trouvé.</div>
    ) : (
      <>
        {/* Affichage de l'article aléatoire */}
        {randomArticle && (
          <div className="mb-4">
            <div className="text-center mb-3">
              <h3 className="text-success">
                🎲 Article Aléatoire Sélectionné
              </h3>
              <p className="text-muted">
                Découvrez cet article choisi au hasard pour vous !
              </p>
            </div>
            <div className="row justify-content-center">
              <div className="col-12 col-lg-8">
                <div className="random-article-highlight">
                  <FeedItem article={randomArticle} />
                </div>
              </div>
            </div>
            <hr className="my-4" />
          </div>
        )}

        <div className="feed-progress-wrapper">
        <div className="feed-progress-bar">
          <div
            className="feed-progress-fill"
            style={{
              width: `${(visibleArticles.length / filteredByFeed.length) * 100}%`,
            }}
          ></div>
        </div>
        <div className="feed-progress-label">
          {selectedFeed
            ? `${visibleArticles.length} sur ${filteredByFeed.length} articles dans ${selectedFeed}`
            : `${visibleArticles.length} sur ${filteredByFeed.length} articles dans ${selectedFolder}`}
        </div>
      </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {visibleArticles.map((article) => (
            <div key={article.id} className="col">
              <FeedItem article={article} />
            </div>
          ))}
        </div>

        {visibleArticles.length < sortedArticles.length && (
          <div className="text-center my-4">
            <button className="btn btn-primary px-4 py-2" onClick={loadMore}>
              Voir plus
            </button>
          </div>
        )}

        <div className="feed-progress-wrapper">
        <div className="feed-progress-bar">
          <div
            className="feed-progress-fill"
            style={{
              width: `${(visibleArticles.length / filteredByFeed.length) * 100}%`,
            }}
          ></div>
        </div>
        <div className="feed-progress-label">
          {selectedFeed
            ? `${visibleArticles.length} sur ${filteredByFeed.length} articles dans ${selectedFeed}`
            : `${visibleArticles.length} sur ${filteredByFeed.length} articles dans ${selectedFolder}`}
        </div>
      </div>

      </>
    )}

    {/* Flèche retour en haut */}
    <button
      className="scroll-to-top-btn position-fixed bottom-0 end-0 m-4 shadow d-none"
      id="scrollToTop"
      style={{ zIndex: 9999 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  </div>
);
}