import React from "react";
import { useNavigate } from "react-router-dom";

export default function FolderSelector({ folders, selected, onChange }) {
  const navigate = useNavigate();

  return (
    <nav
      className="folder-selector d-flex gap-3 overflow-auto px-3 py-2 mb-4 align-items-center"
      role="list"
      aria-label="Sélecteur de dossiers"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        backgroundColor: "transparent",
        borderRadius: "0",
        border: "none",
        paddingLeft: "0",
        paddingRight: "0",
      }}
    >
      {/* Bouton + en premier */}
      <button
        onClick={() => navigate("/add-folder")}
        className="btn btn-sm btn-outline-primary fw-semibold"
        aria-label="Ajouter un nouveau dossier"
        title="Ajouter un nouveau dossier"
        style={{
          flex: "0 0 auto",
          borderRadius: "1rem",
          padding: "0.3rem 1rem",
          whiteSpace: "nowrap",
          userSelect: "none",
          boxShadow: "0 1px 3px rgba(0,123,255,0.3)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,123,255,0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        Gérer
      </button>

      {folders.map((folder) => (
        <button
          key={folder}
          onClick={() => onChange(folder)}
          className={`btn btn-sm ${
            selected === folder ? "btn-primary" : "btn-outline-primary"
          } fw-semibold`}
          style={{
            flex: "0 0 auto",
            scrollSnapAlign: "center",
            whiteSpace: "nowrap",
            userSelect: "none",
            borderRadius: "1rem",
            padding: "0.3rem 1rem",
            boxShadow:
              selected === folder
                ? "0 1px 8px rgba(59, 130, 246, 0.5)"
                : "0 1px 2px rgba(59, 130, 246, 0.2)",
            transition: "box-shadow 0.3s ease",
          }}
          role="listitem"
          aria-current={selected === folder ? "true" : undefined}
          onMouseEnter={(e) => {
            if (selected !== folder) e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            if (selected !== folder) e.currentTarget.style.boxShadow = "0 1px 3px rgba(59, 130, 246, 0.2)";
          }}
        >
          {folder}
        </button>
      ))}
    </nav>
  );
}
