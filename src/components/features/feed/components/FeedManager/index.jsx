import React, { useState, useEffect } from 'react';
import { feedsByFolder as initialFeedsByFolder } from '../../../../data/baseFeedsByFolder';
import './FeedManager.css';

const FeedManager = ({ feedsByFolder: externalFeedsByFolder, setFeedsByFolder: setExternalFeedsByFolder, onFeedsUpdate }) => {
  const [feedsByFolder, setFeedsByFolder] = useState({});
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFeed, setEditingFeed] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);

  // Charger les feeds depuis localStorage ou props externes
  useEffect(() => {
    if (externalFeedsByFolder) {
      setFeedsByFolder(externalFeedsByFolder);
    } else {
      const savedFeeds = JSON.parse(localStorage.getItem('feedsByFolder'));
      setFeedsByFolder(savedFeeds || { ...initialFeedsByFolder });
    }
  }, [externalFeedsByFolder]);

  // Sauvegarder dans localStorage et synchroniser avec la page principale
  const saveFeeds = (newFeeds) => {
    localStorage.setItem('feedsByFolder', JSON.stringify(newFeeds));
    setFeedsByFolder(newFeeds);
    
    // Synchroniser avec la page principale
    if (setExternalFeedsByFolder) {
      setExternalFeedsByFolder(newFeeds);
    }
    if (onFeedsUpdate) {
      onFeedsUpdate(newFeeds);
    }
  };

  // Ajouter un nouveau feed
  const addFeed = () => {
    if (!newFeedUrl.trim() || !newFeedName.trim() || !selectedFolder) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const newFeed = {
      name: newFeedName.trim(),
      url: newFeedUrl.trim()
    };

    const updatedFeeds = {
      ...feedsByFolder,
      [selectedFolder]: [...(feedsByFolder[selectedFolder] || []), newFeed]
    };

    saveFeeds(updatedFeeds);
    setNewFeedUrl('');
    setNewFeedName('');
    setSelectedFolder('');
    
    // Message de confirmation
    alert('Flux ajouté avec succès !');
  };

  // Supprimer un feed
  const deleteFeed = (folderName, feedUrl) => {
    const updatedFeeds = {
      ...feedsByFolder,
      [folderName]: feedsByFolder[folderName].filter(feed => feed.url !== feedUrl)
    };

    // Supprimer le dossier s'il est vide
    if (updatedFeeds[folderName].length === 0) {
      delete updatedFeeds[folderName];
    }

    saveFeeds(updatedFeeds);
    alert('Flux supprimé avec succès !');
  };

  // Modifier un feed
  const editFeed = (folderName, oldFeed, newName, newUrl) => {
    const updatedFeeds = {
      ...feedsByFolder,
      [folderName]: feedsByFolder[folderName].map(feed => 
        feed.url === oldFeed.url ? { name: newName, url: newUrl } : feed
      )
    };

    saveFeeds(updatedFeeds);
    setEditingFeed(null);
    alert('Flux modifié avec succès !');
  };

  // Ajouter un nouveau dossier
  const addFolder = () => {
    if (!newFolderName.trim()) {
      alert('Veuillez entrer un nom de dossier');
      return;
    }

    if (feedsByFolder[newFolderName.trim()]) {
      alert('Ce dossier existe déjà');
      return;
    }

    const updatedFeeds = {
      ...feedsByFolder,
      [newFolderName.trim()]: []
    };

    saveFeeds(updatedFeeds);
    setNewFolderName('');
    alert('Dossier ajouté avec succès !');
  };

  // Supprimer un dossier
  const deleteFolder = (folderName) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier "${folderName}" et tous ses flux ?`)) {
      const updatedFeeds = { ...feedsByFolder };
      delete updatedFeeds[folderName];
      saveFeeds(updatedFeeds);
      alert('Dossier supprimé avec succès !');
    }
  };

  // Modifier un dossier
  const editFolder = (oldName, newName) => {
    if (!newName.trim()) {
      alert('Veuillez entrer un nom de dossier');
      return;
    }

    if (feedsByFolder[newName.trim()] && newName.trim() !== oldName) {
      alert('Ce nom de dossier existe déjà');
      return;
    }

    const updatedFeeds = {
      ...feedsByFolder,
      [newName.trim()]: feedsByFolder[oldName]
    };
    delete updatedFeeds[oldName];

    saveFeeds(updatedFeeds);
    setEditingFolder(null);
    alert('Dossier modifié avec succès !');
  };

  // Réinitialiser aux feeds de base
  const resetToBase = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les flux aux valeurs par défaut ?')) {
      saveFeeds({ ...initialFeedsByFolder });
    }
  };

  // Vider tous les caches
  const clearAllCaches = () => {
    if (confirm('Êtes-vous sûr de vouloir vider tous les caches ?')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('feed-cache-')) {
          localStorage.removeItem(key);
        }
      });
      alert('Tous les caches ont été vidés');
    }
  };

  return (
    <div className="feed-manager">
      <div className="container">
        <h1 className="text-center mb-4">📰 Gestion des Flux RSS</h1>
        
        {/* Actions globales */}
        <div className="global-actions mb-4">
          <button 
            className="btn btn-warning me-2"
            onClick={resetToBase}
          >
            🔄 Réinitialiser aux flux de base
          </button>
          <button 
            className="btn btn-danger"
            onClick={clearAllCaches}
          >
            🗑️ Vider tous les caches
          </button>
        </div>

        {/* Ajouter un nouveau dossier */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>📁 Ajouter un nouveau dossier</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom du dossier"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-primary w-100"
                  onClick={addFolder}
                >
                  Ajouter le dossier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ajouter un nouveau feed */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>➕ Ajouter un nouveau flux</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom du flux"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <input
                  type="url"
                  className="form-control"
                  placeholder="URL du flux RSS"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                >
                  <option value="">Choisir un dossier</option>
                  {Object.keys(feedsByFolder).map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-success w-100"
                  onClick={addFeed}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des dossiers et feeds */}
        <div className="folders-list">
          {Object.entries(feedsByFolder).map(([folderName, feeds]) => (
            <div key={folderName} className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                {editingFolder === folderName ? (
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control me-2"
                      defaultValue={folderName}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          editFolder(folderName, e.target.value);
                        }
                      }}
                    />
                    <button 
                      className="btn btn-sm btn-success me-1"
                      onClick={() => editFolder(folderName, document.querySelector(`input[defaultValue="${folderName}"]`).value)}
                    >
                      ✓
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditingFolder(null)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <h5 className="mb-0">
                    📁 {folderName} ({feeds.length} flux)
                  </h5>
                )}
                <div>
                  <button 
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => setEditingFolder(folderName)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteFolder(folderName)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="card-body">
                {feeds.length === 0 ? (
                  <p className="text-muted">Aucun flux dans ce dossier</p>
                ) : (
                  <div className="feeds-list">
                    {feeds.map((feed, index) => (
                      <div key={feed.url} className="feed-item d-flex justify-content-between align-items-center p-2 border-bottom">
                        {editingFeed === `${folderName}-${feed.url}` ? (
                          <div className="d-flex align-items-center flex-grow-1 me-2">
                            <input
                              type="text"
                              className="form-control me-2"
                              defaultValue={feed.name}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  editFeed(folderName, feed, e.target.value, document.querySelector(`input[defaultValue="${feed.url}"]`).value);
                                }
                              }}
                            />
                            <input
                              type="url"
                              className="form-control me-2"
                              defaultValue={feed.url}
                            />
                            <button 
                              className="btn btn-sm btn-success me-1"
                              onClick={() => editFeed(folderName, feed, document.querySelector(`input[defaultValue="${feed.name}"]`).value, document.querySelector(`input[defaultValue="${feed.url}"]`).value)}
                            >
                              ✓
                            </button>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditingFeed(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="feed-info">
                              <strong>{feed.name}</strong>
                              <br />
                              <small className="text-muted">{feed.url}</small>
                            </div>
                            <div>
                              <button 
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => setEditingFeed(`${folderName}-${feed.url}`)}
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteFeed(folderName, feed.url)}
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedManager; 