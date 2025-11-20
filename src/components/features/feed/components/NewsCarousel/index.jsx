import React, { useState, useEffect, useRef } from 'react';
import '../../styles/NewsCarousel.css';

// --- CACHE EN MÉMOIRE POUR LE CARROUSEL ---
let carouselCache = {
  articles: [],
  timestamp: 0,
  feedsLength: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const LOCALSTORAGE_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const NewsCarousel = ({ feeds = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // État pour gérer les articles lus
  const [readArticles, setReadArticles] = useState({});

  // Charger les articles lus depuis localStorage
  useEffect(() => {
    const savedReadArticles = {};
    articles.forEach(article => {
      const storageKey = `read-${article.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved === "true") {
        savedReadArticles[article.id] = true;
      }
    });
    setReadArticles(savedReadArticles);
  }, [articles]);

  // Fonction pour marquer/démarquer un article comme lu
  const handleReadChange = (articleId) => {
    const newValue = !readArticles[articleId];
    const storageKey = `read-${articleId}`;
    
    setReadArticles(prev => ({
      ...prev,
      [articleId]: newValue
    }));
    
    localStorage.setItem(storageKey, newValue.toString());
  };

  // Récupérer les vrais articles des flux RSS avec cache
  useEffect(() => {
    const now = Date.now();
    
    // Vérifier d'abord le cache mémoire
    if (
      carouselCache.articles.length > 0 &&
      now - carouselCache.timestamp < CACHE_DURATION &&
      feeds.length === carouselCache.feedsLength
    ) {
      console.log('Utilisation du cache mémoire carrousel - affichage instantané');
      setArticles(carouselCache.articles);
      setLoading(false);
      return;
    }

    // Vérifier le cache localStorage
    try {
      const cachedData = localStorage.getItem('carousel-cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (
          parsed.articles.length > 0 &&
          now - parsed.timestamp < LOCALSTORAGE_CACHE_DURATION &&
          parsed.feedsLength === feeds.length
        ) {
          console.log('Utilisation du cache localStorage carrousel - affichage rapide');
          setArticles(parsed.articles);
          setLoading(false);
          // Mettre à jour le cache mémoire
          carouselCache = parsed;
          return;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la lecture du cache localStorage:', error);
    }

    console.log('Chargement des articles carrousel depuis les feeds');
    const fetchRecentArticles = async () => {
      setLoading(true);
      try {
        if (feeds.length === 0) {
          setArticles([]);
          setLoading(false);
          return;
        }

        // Récupérer les articles de tous les feeds (limité à 2 par feed pour plus de rapidité)
        const feedPromises = feeds.map(async (feed) => {
          try {
            const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
            const res = await fetch(PROXY_URL);
            const data = await res.json();
            
            if (!data.contents) {
              console.warn(`Impossible de récupérer le contenu pour ${feed.name}`);
              return [];
            }

            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            
            const items = [...xml.querySelectorAll("item")].slice(0, 2).map((item, index) => {
              const title = item.querySelector("title")?.textContent || "";
              const description = item.querySelector("description")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const pubDate = item.querySelector("pubDate")?.textContent || "";
              const imageElement = item.querySelector("enclosure[type^='image']") || 
                                 item.querySelector("media\\:content") ||
                                 item.querySelector("media:content");
              
              // Extraire l'image de l'article
              let imageUrl = null;
              if (imageElement) {
                imageUrl = imageElement.getAttribute("url") || imageElement.getAttribute("href");
              } else {
                // Essayer d'extraire une image du contenu HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = description;
                const img = tempDiv.querySelector('img');
                if (img) {
                  imageUrl = img.src;
                }
              }

              // Image par défaut selon la catégorie
              const defaultImages = {
                'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop',
                'Tech': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
                'IA': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
                'Sécurité': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
                'default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'
              };

              // Déterminer la catégorie basée sur le nom du feed
              let category = 'default';
              const feedName = feed.name.toLowerCase();
              if (feedName.includes('gaming') || feedName.includes('jeu')) category = 'Gaming';
              else if (feedName.includes('tech') || feedName.includes('technologie')) category = 'Tech';
              else if (feedName.includes('ia') || feedName.includes('intelligence')) category = 'IA';
              else if (feedName.includes('sécurité') || feedName.includes('security')) category = 'Sécurité';

              // Formater la date
              let formattedDate = "Récemment";
              if (pubDate) {
                const date = new Date(pubDate);
                const now = new Date();
                const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
                
                if (diffInHours < 1) {
                  formattedDate = "À l'instant";
                } else if (diffInHours < 24) {
                  formattedDate = `Il y a ${diffInHours}h`;
                } else {
                  const diffInDays = Math.floor(diffInHours / 24);
                  formattedDate = `Il y a ${diffInDays}j`;
                }
              }

              return {
                id: `${feed.name}-${index}`,
                title: title.length > 60 ? title.substring(0, 60) + '...' : title,
                description: description.length > 120 ? description.substring(0, 120) + '...' : description,
                url: link,
                image: imageUrl || defaultImages[category] || defaultImages.default,
                category: category,
                source: feed.name,
                date: formattedDate,
                pubDate: pubDate ? new Date(pubDate) : new Date()
              };
            });

            return items;
          } catch (error) {
            console.error(`Erreur lors du chargement du feed ${feed.name}:`, error);
            return [];
          }
        });

        const allFeedsItems = await Promise.all(feedPromises);
        const allArticles = allFeedsItems.flat();
        
        // Trier par date de publication (plus récent en premier)
        const sortedArticles = allArticles
          .filter(article => article.title && article.description)
          .sort((a, b) => b.pubDate - a.pubDate)
          .slice(0, 6); // Limiter à 6 articles pour le carrousel (au lieu de 8)
        
        setArticles(sortedArticles);
        
        // Mettre à jour les caches
        const cacheData = {
          articles: sortedArticles,
          timestamp: Date.now(),
          feedsLength: feeds.length
        };
        
        carouselCache = cacheData;
        localStorage.setItem('carousel-cache', JSON.stringify(cacheData));
        console.log('Caches carrousel mis à jour');
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentArticles();
  }, [feeds]);

  // Auto-rotation du carrousel
  useEffect(() => {
    if (articles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === articles.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // Change toutes les 10 secondes (au lieu de 5)

    return () => clearInterval(interval);
  }, [articles.length]);

  // Fonctions de navigation tactile
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? articles.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === articles.length - 1 ? 0 : currentIndex + 1);
  };

  const handleReadMore = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="news-carousel-container">
        <div className="carousel-loading">
          <div className="spinner"></div>
          <p>Chargement des actualités récentes...</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="news-carousel-container">
        <div className="carousel-loading">
          <p>Aucun article récent disponible</p>
          <small>Vérifiez vos flux RSS ou réessayez plus tard</small>
        </div>
      </div>
    );
  }

  return (
    <div className="news-carousel-container">
      <div 
        className="carousel-wrapper"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button 
          className="carousel-button carousel-button-prev" 
          onClick={goToPrevious}
          aria-label="Article précédent"
        >
          ‹
        </button>
        
        <div className="carousel-content">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`
              }}
            >
              <div className="carousel-card">
                <div className="carousel-image-container">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="carousel-image"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
                    }}
                  />
                  <div className="carousel-overlay">
                    <span className="carousel-category">{article.category}</span>
                    <span className="carousel-date">{article.date}</span>
                  </div>
                </div>
                
                <div className="carousel-text">
                  <h3 className="carousel-title">{article.title}</h3>
                  <p className="carousel-description">{article.description}</p>
                  <div className="carousel-source">
                    <small>Source: {article.source}</small>
                  </div>
                  <div className="carousel-actions">
                    <button 
                      className="carousel-read-more"
                      onClick={() => handleReadMore(article.url)}
                    >
                      Lire la suite →
                    </button>
                    <div className="form-check form-switch custom-read-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`carousel-read-${article.id}`}
                        checked={readArticles[article.id] || false}
                        onChange={() => handleReadChange(article.id)}
                      />
                      <label className="form-check-label" htmlFor={`carousel-read-${article.id}`}>
                        Lu
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-button carousel-button-next" 
          onClick={goToNext}
          aria-label="Article suivant"
        >
          ›
        </button>
      </div>
      
      <div className="carousel-indicators">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Aller à l'article ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const propsAreEqual = (prev, next) => {
  if ((prev.feeds || []).length !== (next.feeds || []).length) return false;
  // shallow compare feed urls if same length
  const prevUrls = (prev.feeds || []).map(f => (typeof f === 'object' ? f.url : f)).join('|');
  const nextUrls = (next.feeds || []).map(f => (typeof f === 'object' ? f.url : f)).join('|');
  return prevUrls === nextUrls;
};

export default React.memo(NewsCarousel, propsAreEqual); 