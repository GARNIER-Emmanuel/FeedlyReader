import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FolderSelector({ folders, selected, onChange }) {
  const navigate = useNavigate();

  // refs pour chaque folder, indexé par le nom du folder
  const folderRefs = useRef({});

  useEffect(() => {
    if (selected && folderRefs.current[selected]) {
      folderRefs.current[selected].scrollIntoView({
        behavior: "smooth",
        inline: "center", // pour centrer horizontalement
        block: "nearest", // verticalement sans forcer le scroll vertical
      });
    }
  }, [selected]);

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
      

      {folders.map((folder) => (
        <button
          key={folder}
          ref={(el) => (folderRefs.current[folder] = el)} // assignation ref
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
