import React, { useEffect, useState } from "react";
import FeedItem from "./FeedItem";
import SearchBar from "../tools/SearchBar";
import ReadingTimeFilter from "../tools/ReadingTimeFilter";
import SortOrderSelector from "../tools/SortOrderSelector";
import FeedSelector from "../tools/FeedSelector";
import '../Style/Feed.css';

export default function Feed({ feeds, selectedFolder, onDeleteFeed }) {
  const [allArticles, setAllArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReadingTime, setFilterReadingTime] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedFeed, setSelectedFeed] = useState(""); // feed sélectionné dans le dossier
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [lastLoadKey, setLastLoadKey] = useState(0);

  // Recharger les articles quand feeds ou selectedFeed changent
  useEffect(() => {
    setSelectedFeed(""); // reset sélection feed quand dossier change
  }, [feeds]);

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
        setLastLoadKey(prev => prev + 1); 
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

  
  const visibleArticles = sortedArticles.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((count) => count + 10);
  };

  useEffect(() => {
    if (!loading) {
      const audio = new Audio(
        visibleArticles.length > 0 ? '/audio/ding.mp3' : '/audio/wrongding.mp3'
      );
      audio.play().catch(console.warn);
    }
  }, [lastLoadKey]);


  
  return (
  <div className="feed-container container-fluid px-3">
    <div className="filter-bar mb-4 d-flex flex-column flex-md-row flex-wrap gap-3 align-items-stretch">
      <div className="flex-fill">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      <div className="flex-fill">
        <ReadingTimeFilter
          filterReadingTime={filterReadingTime}
          setFilterReadingTime={setFilterReadingTime}
        />
      </div>
      <div className="flex-fill">
        <SortOrderSelector
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
        />
      </div>
      <div className="flex-fill">
        <FeedSelector
          feeds={feeds}
          selectedFeed={selectedFeed}
          setSelectedFeed={setSelectedFeed}
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
        <ul className="list-unstyled">
          {visibleArticles.map((article) => (
            <FeedItem key={article.id} article={article} />
          ))}
        </ul>

        {visibleArticles.length < sortedArticles.length && (
          <div className="text-center my-4">
            <button className="btn btn-primary px-4 py-2" onClick={loadMore}>
              Voir plus
            </button>
          </div>
        )}
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