import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { feedsByFolder as initialFeedsByFolder } from "./components/data/baseFeedsByFolder";
import Feed from "./components/features/feed/components/FeedList";
import FolderSelector from "./components/features/feed/components/FolderSelector";
import NewsCarousel from "./components/features/feed/components/NewsCarousel";
import FeedManager from "./components/features/feed/components/FeedManager";
import About from "./components/features/about/About";
import StarfieldBackground from "./components/visual/StarfieldBackground";
import SettingsPanel from "./components/settings/SettingsPanel.jsx";
import NeoShell from "./components/layout/NeoShell";
import HomeView from "./components/features/home/HomeView.jsx";
import ReadView from "./components/features/read/ReadView.jsx";

export default function App() { const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; const initialTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light'); const [theme, setTheme] = useState(initialTheme); useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }, [theme]); const toggleTheme = ()=> setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
      <StarfieldBackground />
      <SettingsPanel />
      <NeoShell theme={theme} onToggleTheme={toggleTheme}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route
            path="/read"
            element={
              <ReadView
                feedsByFolder={feedsByFolder}
                folders={folders}
                selectedFolder={selectedFolder}
                onFolderChange={handleFolderChange}
                onDeleteFolder={deleteFolder}
                onRenameFolder={renameFolder}
                onRandomArticle={handleRandomArticle}
                onDeleteFeed={(feedUrl) => deleteFeedFromFolder(selectedFolder, feedUrl)}
                showRandomArticle={showRandomArticle}
                isRandomLoading={isRandomLoading}
                onFilterChange={scrollToThemes}
                themesSectionRef={themesSectionRef}
              />
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
                  if (!newFeeds[selectedFolder]) {
                    setSelectedFolder(Object.keys(newFeeds)[0] || "");
                  }
                }}
              />
            }
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </NeoShell>
    </Router>
  );
}
