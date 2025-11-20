import { useEffect, useState } from "react";
import { useToast } from '../components/ui/ToastContext.jsx';

// In-memory cache shared across hook instances to avoid unnecessary JSON.parse/localStorage churn
const memoryCache = new Map();

// Hook pour charger et mettre en cache les articles de feeds
export default function useFeeds(feeds = [], selectedFeed = "", options = {}) {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastLoadKey, setLastLoadKey] = useState(0);
  const [cacheTimestamp, setCacheTimestamp] = useState({});
  const { searchTerm = "", filterReadingTime = "all", sortBy = "date", sortOrder = "desc" } = options;
  const showToast = useToast();

  const getCacheKey = (feed) => {
    const feedName = feed.name;
    const feedUrl = feed.url;
    return `${feedName}-${feedUrl}`;
  };

  const isCacheValid = (timestamp) => {
    return timestamp && (Date.now() - timestamp) < 15 * 60 * 1000; // 15 minutes
  };

  const createFeedObject = (feed) => {
    if (typeof feed === 'object' && feed.name && feed.url) return feed;
    if (typeof feed === 'string') {
      try {
        const url = new URL(feed);
        const hostname = url.hostname.replace('www.', '');
        return { name: hostname, url: feed };
      } catch (error) {
        return { name: feed, url: feed };
      }
    }
    return feed;
  };

  const calculateReadingTime = (text) => {
    const wordCount = (text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(wordCount / 200));
  };

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        const feedObjects = feeds.map(createFeedObject);

        const feedsToLoad = selectedFeed
          ? feedObjects.filter(feed => feed.name === selectedFeed)
          : feedObjects;

        const feedPromises = feedsToLoad.map(async (feed) => {
          try {
            const cacheKey = getCacheKey(feed);

            // Try memory cache first
            if (memoryCache.has(cacheKey)) {
              const mem = memoryCache.get(cacheKey);
              if (isCacheValid(mem.ts)) return mem.items;
            }

            // Try localStorage next (persisted between reloads)
            try {
              const stored = localStorage.getItem(`feed-cache-${cacheKey}`);
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.ts && parsed.items && isCacheValid(parsed.ts)) {
                  // populate memory cache for faster subsequent reads
                  memoryCache.set(cacheKey, { ts: parsed.ts, items: parsed.items });
                  return parsed.items;
                }
              }
            } catch (e) {
              // ignore parse errors and continue to network
            }

            const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
            const res = await fetch(PROXY_URL);
            const data = await res.json();
            if (!data.contents) return [];

            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");

            const maxArticlesPerFeed = 20;
            const items = [...xml.querySelectorAll("item")].slice(0, maxArticlesPerFeed);

            const processedItems = items.map((item, index) => {
              try {
                const title = item.querySelector("title")?.textContent || "";
                const summary = item.querySelector("description")?.textContent || "";
                const pubDate = item.querySelector("pubDate")?.textContent || "";
                const link = item.querySelector("link")?.textContent || "";

                let imageUrl = null;
                try {
                  const enclosure = item.querySelector("enclosure[type^='image']");
                  if (enclosure) imageUrl = enclosure.getAttribute("url");
                  if (!imageUrl && summary) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = summary;
                    const img = tempDiv.querySelector('img');
                    if (img && img.src) imageUrl = img.src;
                  }
                } catch (e) {
                  // ignore
                }

                if (!imageUrl) {
                  imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
                }

                const readingTime = calculateReadingTime(title + " " + summary);

                let validPubDate = null;
                if (pubDate) {
                  const parsedDate = new Date(pubDate);
                  if (!isNaN(parsedDate.getTime())) validPubDate = parsedDate;
                }

                return {
                  id: `${feed.name}-${index}`,
                  title,
                  summary,
                  url: link,
                  image: imageUrl,
                  readingTime,
                  popularity: Math.floor(Math.random() * 1000),
                  source: feed.name,
                  pubDate: validPubDate,
                };
              } catch (err) {
                return null;
              }
            }).filter(Boolean);

            const payload = { ts: Date.now(), items: processedItems };
            try {
              localStorage.setItem(`feed-cache-${cacheKey}`, JSON.stringify(payload));
            } catch (e) {
              // ignore storage quota errors
            }
            memoryCache.set(cacheKey, payload);

            return processedItems;
          } catch (feedError) {
            console.error('Erreur lors du chargement du feed', feedError);
            try { showToast && showToast(`Erreur lors du chargement de ${feed.name}`, 'error', 5000); } catch (e) {}
            return [];
          }
        });

        const allFeedsItems = await Promise.all(feedPromises);
        setAllArticles(allFeedsItems.flat());
        setLastLoadKey(prev => prev + 1);
      } catch (error) {
        console.error('Erreur useFeeds:', error);
        try { showToast && showToast('Erreur lors du chargement des feeds', 'error', 6000); } catch (e) {}
      } finally {
        setLoading(false);
      }
    };

    // hook: showToast is a hook; get it here to report errors
    fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds, selectedFeed]);

  // Filtrage et tri centralisés dans le hook
  const sortedArticles = (() => {
    try {
      const term = (searchTerm || "").toLowerCase();
      const filteredBySearch = allArticles.filter(article => {
        if (!term) return true;
        return (article.title || "").toLowerCase().includes(term) || (article.summary || "").toLowerCase().includes(term);
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

      const sorted = [...filteredByReadingTime].sort((a, b) => {
        if (sortBy === "popularity") {
          return sortOrder === "asc" ? a.popularity - b.popularity : b.popularity - a.popularity;
        }
        if (sortBy === "date") {
          const dateA = a.pubDate instanceof Date ? a.pubDate.getTime() : 0;
          const dateB = b.pubDate instanceof Date ? b.pubDate.getTime() : 0;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (sortBy === "title") {
          return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }
        return 0;
      });

      return sorted;
    } catch (e) {
      return allArticles;
    }
  })();

  const forceRefresh = () => {
    feeds.forEach(feed => {
      const feedObj = createFeedObject(feed);
      const cacheKey = getCacheKey(feedObj);
      localStorage.removeItem(`feed-cache-${cacheKey}`);
    });
    setCacheTimestamp({});
    setLastLoadKey(prev => prev + 1);
  };

  const getCacheStatus = () => {
    const totalFeeds = feeds.length;
    const cachedFeeds = feeds.filter(feed => {
      const feedObj = createFeedObject(feed);
      const cacheKey = getCacheKey(feedObj);
      const cachedData = localStorage.getItem(`feed-cache-${cacheKey}`);
      return cachedData && isCacheValid(cacheTimestamp[cacheKey]);
    }).length;
    return { total: totalFeeds, cached: cachedFeeds };
  };

  return { allArticles, sortedArticles, loading, lastLoadKey, forceRefresh, getCacheStatus };
}
