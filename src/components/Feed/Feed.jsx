import React, { useEffect, useState } from "react";
import FeedItem from "./FeedItem";
import SearchBar from "../tools/SearchBar";
import ReadingTimeFilter from "../tools/ReadingTimeFilter";
import SortOrderSelector from "../tools/SortOrderSelector";
import FeedSelector from "../tools/FeedSelector";
import '../Style/Feed.css';

export default function Feed({ feeds }) {
  const [allArticles, setAllArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReadingTime, setFilterReadingTime] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedFeed, setSelectedFeed] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Nouvel état pour gérer l’affichage de la flèche
  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    setSelectedFeed("");  // pour charger tous les feeds du dossier
  }, [selectedFolder]);
  const feedsInFolder = selectedFolder
    ? feeds.filter(feed => feed.folder === selectedFolder)
    : feeds;

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        // Si un feed est sélectionné, ne charger que celui-là
        const feedsToLoad = selectedFeed
          ? feeds.filter(feed => feed.name === selectedFeed)
          : feeds;

        const feedPromises = feedsToLoad.map(async (feed) => {
          const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
          const res = await fetch(PROXY_URL);
          const data = await res.json();
          const parser = new DOMParser();
          const xml = parser.parseFromString(data.contents, "text/xml");
          const items = await Promise.all(
            [...xml.querySelectorAll("item")].map(async (item, index) => {
              const title = item.querySelector("title")?.textContent || "";
              const summary = item.querySelector("description")?.textContent || "";
              const pubDate = item.querySelector("pubDate")?.textContent || "";
              let readingTime = 1;
              try {
                const extractUrl = `http://localhost:5001/extract?url=${encodeURIComponent(item.querySelector("link")?.textContent || "")}`;
                const extractRes = await fetch(extractUrl);
                const extractData = await extractRes.json();
                const articleText = extractData.content || "";
                const wordCount = articleText.trim().split(/\s+/).length;
                readingTime = Math.max(1, Math.round(wordCount / 200));
              } catch (e) {
                console.warn("Erreur extraction contenu complet, fallback résumé :", e);
                const fallbackCount = (title + " " + summary).trim().split(/\s+/).length;
                readingTime = Math.max(1, Math.round(fallbackCount / 200));
              }

              const popularity = Math.floor(Math.random() * 1000);
              return {
                id: `${feed.name}-${index}`,
                title,
                summary,
                url: item.querySelector("link")?.textContent || "#",
                readingTime,
                popularity,
                source: feed.name,
                pubDate: pubDate ? new Date(pubDate) : null,
              };
            })
          );
          return items;
        });

        const allFeedsItems = await Promise.all(feedPromises);
        setAllArticles(allFeedsItems.flat());
        setVisibleCount(10);
      } catch (error) {
        console.error("Erreur lors du chargement des feeds", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [feeds, selectedFeed]);

  useEffect(() => {
    setVisibleCount(10);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedFeed, searchTerm, filterReadingTime]);

  // useEffect pour écouter le scroll et afficher/cacher la flèche
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredBySearch = allArticles.filter((article) => {
    const term = searchTerm.toLowerCase();
    return (
      article.title.toLowerCase().includes(term) ||
      article.summary.toLowerCase().includes(term)
    );
  });

  const addFeed = (folder, newFeed) => {
    setFeedsByFolder(prev => ({
      ...prev,
      [folder]: [...(prev[folder] || []), newFeed]
    }));
  };

  const filteredByReadingTime = filteredBySearch.filter((article) => {
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

  const sortedArticles = [...filteredByFeed].sort((a, b) => {
    if (sortBy === "popularity") {
      return sortOrder === "asc"
        ? a.popularity - b.popularity
        : b.popularity - a.popularity;
    } else if (sortBy === "date") {
      // Trier par date (du plus récent au plus ancien, ou inverse)
      if (!a.pubDate) return 1;  // articles sans date à la fin
      if (!b.pubDate) return -1;
      return sortOrder === "asc"
        ? a.pubDate - b.pubDate
        : b.pubDate - a.pubDate;
    } else {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  const visibleArticles = sortedArticles.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, sortedArticles.length));
  };

  const handleLoadAll = () => {
    setVisibleCount(sortedArticles.length);
  };

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
return (
  <div className="container my-4">
    {/* Filtres */}
    <div className="filtre p-3 mb-4 custom-feed-filter-card">
      <div className="row g-3 align-items-center">
        <div className="col-md">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="col-md">
          <ReadingTimeFilter value={filterReadingTime} onChange={setFilterReadingTime} />
        </div>
        <div className="col-md">
          <SortOrderSelector
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>
        <div className="col-md">
          <FeedSelector
            feeds={feeds}
            selectedFeed={selectedFeed}
            setSelectedFeed={setSelectedFeed}
          />
        </div>
      </div>
    </div>

    {/* Affichage loader pendant chargement */}
    {loading ? (
      <div className="spinner" aria-label="Chargement en cours" />
    ) : (
      <>
        {/* Titre avec compteur */}
        <section className="mb-5">
          <h2 className="mb-3 pb-2 border-bottom">
            {`${visibleArticles.length} / ${filteredByFeed.length} articles${selectedFeed ? ` de ${selectedFeed}` : ""}`}
          </h2>

          {/* Si aucun article visible */}
          {visibleArticles.length === 0 ? (
            <p className="no-articles-text">Aucun article trouvé</p>
          ) : (
            <div className="row g-4">
              {visibleArticles.map(article => (
                <div key={article.id} className="col-12 col-md-4 col-lg-3">
                  <FeedItem article={article} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Boutons charger plus / tout charger */}
        {visibleArticles.length < sortedArticles.length && (
          <div className="buttons-container">
            <button
              onClick={handleLoadMore}
              className="btn-outline-primary custom-load-more"
            >
              Charger 10 articles de plus
            </button>

            <button
              onClick={handleLoadAll}
              className="btn-primary custom-load-all"
            >
              Charger tous les articles
            </button>
          </div>
        )}

        {/* Bouton flèche pour remonter en haut */}
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            aria-label="Remonter en haut"
            className="scroll-to-top-btn"
          >
            ↑
          </button>
        )}
      </>
    )}
  </div>
);
}