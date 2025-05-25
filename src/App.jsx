import React, { useState } from "react";
import { feedsByFolder } from "./components/data/feedsByFolder";
import Feed from "./components/Feed/Feed";
import FolderSelector from "./components/Feed/FolderSelector";
import FilterBar from "./components/tools/FilterBar";

export default function App() {
  const folders = Object.keys(feedsByFolder);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]);

  return (
    <div className="min-vh-100 bg-light" style={{ background: "linear-gradient(to right, #eff6ff, #e0e7ff)" }}>
      <div className="container py-5">
        <header className="mb-5 text-center text-md-start">
          <h1 className="display-4 fw-bold text-primary mb-3">Feedly Reader</h1>
          <p className="text-secondary fs-5 mx-auto mx-md-0" style={{ maxWidth: "600px" }}>
            Choisis une catégorie pour afficher les flux RSS associés.
          </p>
        </header>

        <section className="mb-4 d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
          <FolderSelector
            folders={folders}
            selected={selectedFolder}
            onChange={setSelectedFolder}
          />
        </section>

        <main className="bg-white rounded-4 shadow p-4">
          <Feed feeds={feedsByFolder[selectedFolder]} />
        </main>

        <footer className="mt-5 text-center text-muted small">
          &copy; 2025 Manu — Feedly Reader
        </footer>
      </div>
    </div>
  );
}
