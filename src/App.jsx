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
        className="min-vh-100 bg-light"
        style={{ background: "linear-gradient(to right, #eff6ff, #e0e7ff)" }}
      >
        <div className="container py-5">
          <header
            className="mb-5 text-center text-md-start d-flex align-items-center justify-content-center justify-content-md-between"
            style={{ gap: "1rem" }}
          >
            <div>
              <h1 className="display-4 fw-bold text-primary mb-3">Feedly Reader</h1>
            </div>
            <img
              src={logo}
              alt="Feedly Reader Logo"
              style={{
                height: "100px",
                width: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                border: "4px solid #3b82f6",
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

                  <section className="mb-4 d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                    <FolderSelector
                      folders={folders}
                      selected={selectedFolder}
                      onChange={setSelectedFolder}
                      onDeleteFolder={deleteFolder}
                      onRenameFolder={renameFolder}
                    />
                  </section>

                  <main className="bg-white rounded-4 shadow p-4">
                    <Feed
                      feeds={feedsByFolder[selectedFolder]}
                      onDeleteFeed={(feedUrl) => deleteFeedFromFolder(selectedFolder, feedUrl)}
                    />
                  </main>
                </>
              }
            />

            {/* Pas de route pour ManageFeeds ici */}

          </Routes>

          <footer className="mt-5 text-center text-muted small">
            &copy; 2025 Manu — Feedly Reader
          </footer>
        </div>
      </div>
    </Router>
  );
}
