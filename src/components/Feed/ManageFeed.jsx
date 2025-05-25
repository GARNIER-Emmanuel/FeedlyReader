import React, { useState, useEffect } from "react";

function ManageFeeds({ restoreBaseFeeds, feedsByFolder, setFeedsByFolder, setSelectedFolder }) {
  const [folderName, setFolderName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [selectedFolderLocal, setSelectedFolderLocal] = useState(Object.keys(feedsByFolder)[0] || "");

  useEffect(() => {
    if (Object.keys(feedsByFolder).length > 0) {
      setSelectedFolderLocal(Object.keys(feedsByFolder)[0]);
    }
  }, [feedsByFolder]);

  // Supprimer un feed d'un dossier
  const removeFeed = (folder, feedUrl) => {
    const newFeeds = { ...feedsByFolder };
    newFeeds[folder] = newFeeds[folder].filter(feed => feed !== feedUrl);
    setFeedsByFolder(newFeeds);
  };

  // Ajouter un feed dans le dossier sélectionné
  const addFeed = () => {
    if (!newFeedUrl.trim()) return alert("URL du feed requis !");
    if (!selectedFolderLocal) return alert("Aucun dossier sélectionné !");
    const newFeeds = { ...feedsByFolder };
    if (!newFeeds[selectedFolderLocal].includes(newFeedUrl)) {
      newFeeds[selectedFolderLocal] = [...newFeeds[selectedFolderLocal], newFeedUrl];
      setFeedsByFolder(newFeeds);
      setNewFeedUrl("");
    } else {
      alert("Feed déjà existant !");
    }
  };

  // Ajouter un nouveau dossier
  const addFolder = () => {
    if (!folderName.trim()) return alert("Nom du dossier requis !");
    if (feedsByFolder[folderName]) return alert("Ce dossier existe déjà !");
    const newFeeds = { ...feedsByFolder };
    newFeeds[folderName] = [];
    setFeedsByFolder(newFeeds);
    setFolderName("");
    setSelectedFolderLocal(folderName);
    setSelectedFolder(folderName);
  };

  // Supprimer un dossier
  const removeFolder = (folder) => {
    if (!window.confirm(`Supprimer le dossier "${folder}" et tous ses feeds ?`)) return;
    const newFeeds = { ...feedsByFolder };
    delete newFeeds[folder];
    setFeedsByFolder(newFeeds);
    const folders = Object.keys(newFeeds);
    setSelectedFolder(folders[0] || "");
    setSelectedFolderLocal(folders[0] || "");
  };

  return (
    <div>
      <h2>Gestion des Feeds</h2>

      <button
        onClick={restoreBaseFeeds}
        className="btn btn-warning mb-3"
      >
        Récupérer mes feeds de base
      </button>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Liste des dossiers */}
        <div style={{ minWidth: "150px" }}>
          <h3>Dossiers</h3>
          <ul>
            {Object.keys(feedsByFolder).map(folder => (
              <li key={folder}>
                <button
                  style={{
                    fontWeight: folder === selectedFolderLocal ? "bold" : "normal",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => {
                    setSelectedFolderLocal(folder);
                    setSelectedFolder(folder);
                  }}
                >
                  {folder}
                </button>
                <button
                  style={{ marginLeft: "5px", color: "red" }}
                  onClick={() => removeFolder(folder)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="Nouveau dossier"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
          />
          <button onClick={addFolder}>Ajouter dossier</button>
        </div>

        {/* Liste des feeds dans dossier sélectionné */}
        <div style={{ flexGrow: 1 }}>
          <h3>Feeds dans "{selectedFolderLocal}"</h3>
          <ul>
            {(feedsByFolder[selectedFolderLocal] || []).map(feedUrl => (
              <li key={feedUrl}>
                {feedUrl}
                <button
                  style={{ marginLeft: "10px", color: "red" }}
                  onClick={() => removeFeed(selectedFolderLocal, feedUrl)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="URL du feed"
            value={newFeedUrl}
            onChange={e => setNewFeedUrl(e.target.value)}
          />
          <button onClick={addFeed}>Ajouter feed</button>
        </div>
      </div>
    </div>
  );
}

export default ManageFeeds;
