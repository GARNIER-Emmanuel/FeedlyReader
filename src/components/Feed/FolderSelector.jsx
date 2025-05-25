import React from "react";
import { useNavigate } from "react-router-dom";

export default function FolderSelector({ folders, selected, onChange }) {
  const navigate = useNavigate();

  return (
    <div
      className="folder-selector d-flex gap-3 overflow-auto px-2 py-2 mb-4 align-items-center"
      role="list"
      aria-label="Sélecteur de dossiers"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Bouton + en premier */}
      <button
        onClick={() => navigate("/add-folder")}
        className="folder-pill btn btn-sm btn-outline-primary folder-add-btn"
        aria-label="Ajouter un nouveau dossier"
        title="Ajouter un nouveau dossier"
      >
        Gérer
      </button>

      {folders.map((folder) => (
        <button
          key={folder}
          onClick={() => onChange(folder)}
          className={`folder-pill btn btn-sm ${
            selected === folder ? "btn-primary" : "btn-outline-primary"
          }`}
          style={{
            flex: "0 0 auto",
            scrollSnapAlign: "center",
            whiteSpace: "nowrap",
            userSelect: "none",
            borderRadius: "1rem",
          }}
          role="listitem"
          aria-current={selected === folder ? "true" : undefined}
        >
          {folder}
        </button>
      ))}
    </div>
  );
}
