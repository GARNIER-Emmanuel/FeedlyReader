import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { feedsByFolder as initialFeedsByFolder } from "./components/data/baseFeedsByFolder";
import Feed from "./components/Feed/Feed";
import FolderSelector from "./components/Feed/FolderSelector";
import NewsCarousel from "./components/Feed/NewsCarousel";
import logo from "./assets/logo.png";

export default function App() {
  // Charger depuis localStorage ou initial
  const savedFeedsByFolder = JSON.parse(localStorage.getItem("feedsByFolder"));
  const [feedsByFolder, setFeedsByFolder] = useState(savedFeedsByFolder || { ...initialFeedsByFolder });
  const [folders, setFolders] = useState(Object.keys(feedsByFolder));
  const [selectedFolder, setSelectedFolder] = useState(Object.keys(feedsByFolder)[0] || "");
  const [showRandomArticle, setShowRandomArticle] = useState(false);
  
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

  // Fonction pour l'article aléatoire avec scroll
  const handleRandomArticle = () => {
    setShowRandomArticle(true);
    // Sélectionner un dossier aléatoire
    const allFolders = Object.keys(feedsByFolder);
    const randomFolder = allFolders[Math.floor(Math.random() * allFolders.length)];
    setSelectedFolder(randomFolder);
    // Scroll vers les thèmes
    setTimeout(scrollToThemes, 100);
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
      const updatedFolder = prev[folderName].filter((feed) => feed !== feedUrl);
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
    }
  }, [selectedFolder]);

  return (
    <Router>
      <div className="min-vh-100" style={{ color: "#f5f5f5", minHeight: "100vh" }}>
        <div className="container-fluid py-4">

          {/* ✅ HEADER CENTRÉ ET LIMITÉ EN LARGEUR */}
          <div style={{ maxWidth: "98%", margin: "0 auto", padding: "0 1rem" }}>
            <header
              className="mb-2 text-center text-md-start d-flex align-items-center justify-content-center justify-content-md-between"
              style={{ gap: "1rem" }}
            >
              <div>
                <h1 className="display-5 fw-bold text-primary mb-2">Feedly Reader</h1>
              </div>

              <img
                src={logo}
                alt="Feedly Reader Logo"
                style={{
                  height: "80px",
                  width: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  border: "3px solid #3b82f6",
                }}
              />
            </header>
          </div>

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
                    className="mb-0 d-flex flex-wrap gap-3 justify-content-center justify-content-md-start folder-selector"
                    style={{ overflowX: "auto", whiteSpace: "nowrap" }}
                  >
                    <FolderSelector
                      folders={folders}
                      selected={selectedFolder}
                      onChange={handleFolderChange}
                      onDeleteFolder={deleteFolder}
                      onRenameFolder={renameFolder}
                      onRandomArticle={handleRandomArticle}
                    />
                  </section>

                  {/* Ici on place le Feed, en lui passant les feeds du dossier sélectionné */}
                  <main className="full-width" style={{ padding: "0 1rem" }}>
                    <Feed
                      feeds={feedsByFolder[selectedFolder] || []}
                      selectedFolder={selectedFolder}
                      onDeleteFeed={(feedUrl) => deleteFeedFromFolder(selectedFolder, feedUrl)}
                      showRandomArticle={showRandomArticle}
                      onFilterChange={scrollToThemes}
                    />
                  </main>
                </>
              }
            />
          </Routes>

          <footer className="mention mt-5 text-center small">
            &copy; 2025 Manu — Feedly Reader
          </footer>
        </div>
      </div>
    </Router>
  );
}
