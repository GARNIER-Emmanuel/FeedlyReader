import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { feedsByFolder as initialFeedsByFolder } from "./components/data/baseFeedsByFolder";
import Feed from "./components/features/feed/components/FeedList";
import FolderSelector from "./components/features/feed/components/FolderSelector";
import NewsCarousel from "./components/features/feed/components/NewsCarousel";
import FeedManager from "./components/features/feed/components/FeedManager";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

export default function App() {
  // Charger depuis localStorage ou initial
  const savedFeedsByFolder = JSON.parse(localStorage.getItem("feedsByFolder"));
  const [feedsByFolder, setFeedsByFolder] = useState(savedFeedsByFolder || { ...initialFeedsByFolder });
  const [folders, setFolders] = useState(Object.keys(feedsByFolder));
  const [selectedFolder, setSelectedFolder] = useState(Object.keys(feedsByFolder)[0] || "");
  const [showRandomArticle, setShowRandomArticle] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  
  // Référence pour la section des thèmes
  const themesSectionRef = useRef(null);

  // Sauvegarder dans localStorage à chaque modif
  useEffect(() => {
    localStorage.setItem("feedsByFolder", JSON.stringify(feedsByFolder));
    setFolders(Object.keys(feedsByFolder));
  }, [feedsByFolder]);

  // Fonction pour scroller vers les thèmes
  const scrollToThemes = () => {
    if (themesSectionRef.current) {
      themesSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  // Fonction pour changer de dossier avec scroll
  const handleFolderChange = (folder) => {
    setSelectedFolder(folder);
    // Scroll vers les thèmes après un court délai pour laisser le temps au changement
    setTimeout(scrollToThemes, 100);
  };

  // Fonction pour l'article aléatoire avec animation de chargement
  const handleRandomArticle = () => {
    setIsRandomLoading(true);
    setShowRandomArticle(true);
    
    // Simuler un temps de chargement pour l'animation
    setTimeout(() => {
      setIsRandomLoading(false);
      // Scroll vers les thèmes
      setTimeout(scrollToThemes, 100);
    }, 1500); // 1.5 secondes d'animation
  };

  // Supprimer un dossier
  const deleteFolder = (folderName) => {
    const { [folderName]: _, ...rest } = feedsByFolder;
    setFeedsByFolder(rest);
    if (selectedFolder === folderName) {
      setSelectedFolder(Object.keys(rest)[0] || "");
    }
  };

  // Renommer un dossier
  const renameFolder = (oldName, newName) => {
    if (folders.includes(newName) || newName.trim() === "") return;
    const updatedFeedsByFolder = {
      ...feedsByFolder,
      [newName]: feedsByFolder[oldName],
    };
    delete updatedFeedsByFolder[oldName];
    setFeedsByFolder(updatedFeedsByFolder);
    if (selectedFolder === oldName) {
      setSelectedFolder(newName);
    }
  };

  // Supprimer un feed dans un dossier
  const deleteFeedFromFolder = (folderName, feedUrl) => {
    setFeedsByFolder((prev) => {
      const updatedFolder = prev[folderName].filter((feed) => {
        // Si feed est un objet, comparer l'URL
        if (typeof feed === 'object' && feed.url) {
          return feed.url !== feedUrl;
        }
        // Si feed est une string (URL), comparer directement
        return feed !== feedUrl;
      });
      return { ...prev, [folderName]: updatedFolder };
    });
  };

  // Restaurer feeds de base
  const restoreBaseFeeds = () => {
    localStorage.removeItem("feedsByFolder");
    setFeedsByFolder({ ...initialFeedsByFolder });
    setSelectedFolder(Object.keys(initialFeedsByFolder)[0] || "");
  };

  // Réinitialiser l'affichage aléatoire quand on change de dossier manuellement
  useEffect(() => {
    if (showRandomArticle) {
      setShowRandomArticle(false);
      setIsRandomLoading(false);
    }
  }, [selectedFolder]);

  return (
    <Router>
      <div className="min-vh-100" style={{ color: "#f5f5f5", minHeight: "100vh" }}>
        {/* Nouveau Header */}
        <Header />
        
        <div className="container-fluid py-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* Carrousel d'actualités récentes */}
                  <NewsCarousel feeds={Object.values(feedsByFolder).flat()} />
                  
                  {/* Section des thèmes avec référence */}
                  <section
                    ref={themesSectionRef}
                    className="mb-0 d-flex justify-content-between align-items-center folder-selector"
                    style={{ overflowX: "auto", whiteSpace: "nowrap", marginBottom: "-1rem" }}
                  >
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <FolderSelector
                        folders={folders}
                        selected={selectedFolder}
                        onChange={handleFolderChange}
                        onDeleteFolder={deleteFolder}
                        onRenameFolder={renameFolder}
                        onRandomArticle={handleRandomArticle}
                      />
                    </div>
                    <button 
                      className="btn btn-sm refresh-button"
                      onClick={() => {
                        // Vider tous les caches
                        Object.values(feedsByFolder).flat().forEach(feed => {
                          const feedName = typeof feed === 'string' ? new URL(feed).hostname.replace('www.', '') : feed.name;
                          const feedUrl = typeof feed === 'string' ? feed : feed.url;
                          const cacheKey = `${feedName}-${feedUrl}`;
                          localStorage.removeItem(`feed-cache-${cacheKey}`);
                        });
                        // Forcer le rechargement
                        window.location.reload();
                      }}
                      title="Forcer le rafraîchissement de tous les feeds"
                    >
                      <span className="refresh-icon">🔄</span>
                      <span className="refresh-text">Actualiser</span>
                    </button>
                  </section>

                  {/* Ici on place le Feed, en lui passant les feeds du dossier sélectionné */}
                  <main className="full-width" style={{ padding: "0 1rem" }}>
                    <Feed
                      feeds={showRandomArticle ? Object.values(feedsByFolder).flat() : feedsByFolder[selectedFolder] || []}
                      selectedFolder={selectedFolder}
                      onDeleteFeed={(feedUrl) => deleteFeedFromFolder(selectedFolder, feedUrl)}
                      showRandomArticle={showRandomArticle}
                      isRandomLoading={isRandomLoading}
                      onFilterChange={scrollToThemes}
                    />
                  </main>
                </>
              }
            />
            <Route
              path="/feeds"
              element={
                <FeedManager 
                  feedsByFolder={feedsByFolder}
                  setFeedsByFolder={setFeedsByFolder}
                  onFeedsUpdate={(newFeeds) => {
                    setFeedsByFolder(newFeeds);
                    localStorage.setItem("feedsByFolder", JSON.stringify(newFeeds));
                    setFolders(Object.keys(newFeeds));
                    // Réinitialiser la sélection si le dossier actuel n'existe plus
                    if (!newFeeds[selectedFolder]) {
                      setSelectedFolder(Object.keys(newFeeds)[0] || "");
                    }
                  }}
                />
              }
            />
          </Routes>
        </div>
        
        {/* Nouveau Footer */}
        <Footer />
      </div>
    </Router>
  );
}
