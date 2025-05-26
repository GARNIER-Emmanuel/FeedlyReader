import React, { useEffect, useState } from "react";
import FeedItem from "./FeedItem";
import SearchBar from "../tools/SearchBar";
import ReadingTimeFilter from "../tools/ReadingTimeFilter";
import SortOrderSelector from "../tools/SortOrderSelector";
import FeedSelector from "../tools/FeedSelector";

export default function Feed({ feeds }) {
  const [allArticles, setAllArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReadingTime, setFilterReadingTime] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedFeed, setSelectedFeed] = useState("");

  // Nouvel état pour gérer l’affichage de la flèche
  const [showScrollButton, setShowScrollButton] = useState(false);

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
    <div
      className="card p-3 mb-4"
      style={{ backgroundColor: "#e0f2fe", borderColor: "#bae6fd" }}
    >
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
        <div
          className="spinner"
          aria-label="Chargement en cours"
          style={{
            border: "4px solid rgba(0, 0, 0, 0.1)",
            borderLeftColor: "#0284c7",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "2rem auto",
          }}
        />
      ) : (
        <>
        {/* Titre avec compteur */}
        <section className="mb-5">
          <h2
            className="mb-3 pb-2 border-bottom"
            style={{ color: "#0369a1", borderColor: "#bae6fd", fontWeight: "700" }}
          >
           {`${visibleArticles.length} / ${filteredByFeed.length} articles${selectedFeed ? ` de ${selectedFeed}` : ""}`}
          </h2>

          {/* Si aucun article visible */}
          {visibleArticles.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#888" }}>Aucun article trouvé</p>
          ) : (
            <div className="row g-4">
              {visibleArticles.map(article => (
                <div key={article.id} className="col-12 col-md-6 col-lg-4">
                  <FeedItem article={article} />
                </div>
              ))}
            </div>
          )}
        </section>


          {/* Boutons charger plus / tout charger */}
          {visibleArticles.length < sortedArticles.length && (
            <div
              className="d-flex justify-content-center gap-3 mt-5"
              style={{ gap: "1rem" }}
            >
              <button
                onClick={handleLoadMore}
                className="btn btn-outline-primary rounded-pill px-4 py-2"
                style={{
                  backgroundColor: "#7dd3fc",
                  borderColor: "#7dd3fc",
                  color: "#0c4a6e",
                  fontWeight: "600",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#38bdf8";
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#7dd3fc";
                  e.target.style.borderColor = "#7dd3fc";
                  e.target.style.color = "#0c4a6e";
                }}
              >
                Charger 10 articles de plus
              </button>

              <button
                onClick={handleLoadAll}
                className="btn btn-primary rounded-pill px-4 py-2"
                style={{
                  backgroundColor: "#0284c7",
                  borderColor: "#0284c7",
                  color: "white",
                  fontWeight: "600",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#0369a1";
                  e.target.style.borderColor = "#0369a1";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#0284c7";
                  e.target.style.borderColor = "#0284c7";
                }}
              >
                Charger tous les articles
              </button>
            </div>
          )}

          {/* Bouton flèche pour remonter en haut, affiché seulement quand showScrollButton = true */}
          {showScrollButton && (
            <button
              onClick={scrollToTop}
              aria-label="Remonter en haut"
              style={{
                position: "fixed",
                bottom: "2rem",
                right: "2rem",
                backgroundColor: "#0284c7",
                border: "none",
                borderRadius: "50%",
                width: "3rem",
                height: "3rem",
                color: "white",
                fontSize: "1.2rem",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#0369a1")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#0284c7")}
            >
              ↑
            </button>
          )}
        </>
      )}

      {/* Animation CSS clé spin */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
