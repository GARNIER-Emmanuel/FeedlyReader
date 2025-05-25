import React from "react";

export default function FolderSelector({ folders, selected, onChange, countsByFolder }) {
 
   const effectiveFolders = folders ?? (countsByFolder ? Object.keys(countsByFolder) : []);

   return (
    <div
      className="folder-selector d-flex gap-3 overflow-auto px-2 py-2 mb-4"
      role="list"
      aria-label="Sélecteur de dossiers"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {effectiveFolders.map((folder) => (
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
          }}
          role="listitem"
          aria-current={selected === folder ? "true" : undefined}
        >
          {folder}{" "}
          {countsByFolder && countsByFolder[folder] !== undefined && (
            <span style={{ fontWeight: "bold", marginLeft: 6 }}>
              ({countsByFolder[folder]})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}