import React from "react";

export default function SortOrderSelector({ sortBy, setSortBy, sortOrder, setSortOrder }) {
  return (
    <div className="d-flex gap-2">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="form-select form-select-sm"
        style={{ minWidth: "130px" }}
      >
        <option value="popularity">Popularité</option>
        <option value="title">Titre</option>
        <option value="date">Date</option>
      </select>

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="form-select form-select-sm"
        style={{ width: "70px" }}
      >
        <option value="asc">↑</option>
        <option value="desc">↓</option>
      </select>
    </div>
  );
}
