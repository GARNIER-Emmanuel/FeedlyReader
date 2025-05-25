import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Recherche..."
      className="form-control form-control-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: "200px" }}
    />
  );
}
