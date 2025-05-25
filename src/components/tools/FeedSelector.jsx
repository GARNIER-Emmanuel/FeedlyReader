import React from "react";

export default function FeedSelector({ feeds, selectedFeed, setSelectedFeed }) {
  return (
    <select
      value={selectedFeed}
      onChange={(e) => setSelectedFeed(e.target.value)}
      className="form-select form-select-sm"
      style={{ minWidth: "180px" }}
    >
      <option value="">Tous les feeds</option>
      {feeds.map((feed) => (
        <option key={feed.name} value={feed.name}>
          {feed.name}
        </option>
      ))}
    </select>
  );
}
