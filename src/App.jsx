import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { feedsByFolder as initialFeedsByFolder } from "./components/data/baseFeedsByFolder";
import Feed from "./components/Feed/Feed";
import FolderSelector from "./components/Feed/FolderSelector";
import logo from "./assets/logo.png";

export default function App() {
  // Charger depuis localStorage ou initial
  const savedFeedsByFolder = JSON.parse(localStorage.getItem("feedsByFolder"));
  const [feedsByFolder, setFeedsByFolder] = useState(savedFeedsByFolder || { ...initialFeedsByFolder });
  const [folders, setFolders] = useState(Object.keys(feedsByFolder));
  const [selectedFolder, setSelectedFolder] = useState(Object.keys(feedsByFolder)[0]);

  // Sauvegarder dans localStorage à chaque modif
  useEffect(() => {
    localStorage.setItem("feedsByFolder", JSON.stringify(feedsByFolder));
    setFolders(Object.keys(feedsByFolder));
  }, [feedsByFolder]);

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

  // Supprimer un feed
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

  return (
    <Router>
      
      <div
        className="min-vh-100"
        style={{
          color: "#f5f5f5",
          minHeight: "100vh",
        }}
        >
          
        <div className="container-fluid py-4">
          <header
            className="mb-4 text-center text-md-start d-flex align-items-center justify-content-center justify-content-md-between"
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

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <p
                    className="text-secondary fs-5 mx-auto mx-md-0"
                    style={{ maxWidth: "600px" }}
                  >
                    Choisis une catégorie pour afficher les flux RSS associés.
                  </p>

                  <section
                    className="mb-3 d-flex flex-wrap gap-3 justify-content-center justify-content-md-start folder-selector"
                    style={{ overflowX: "auto", whiteSpace: "nowrap" }}
                  >
                    <FolderSelector
                      folders={folders}
                      selected={selectedFolder}
                      onChange={setSelectedFolder}
                      onDeleteFolder={deleteFolder}
                      onRenameFolder={renameFolder}
                    />
                  </section>

                  <main className="full-width" style={{ padding: "0 1rem" }}>
                    <Feed
                      feeds={feedsByFolder[selectedFolder]}
                      onDeleteFeed={(feedUrl) => deleteFeedFromFolder(selectedFolder, feedUrl)}
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
