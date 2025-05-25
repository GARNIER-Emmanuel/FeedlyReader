import React from "react";
import SearchBar from "./SearchBar";
import ReadingTimeFilter from "./ReadingTimeFilter";
import SortOrderSelector from "./SortOrderSelector";

export default function FilterBar({
  searchValue,
  onSearchChange,
  readingTimeValue,
  onReadingTimeChange,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) {
  return (
    <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
      <SearchBar value={searchValue} onChange={onSearchChange} />
      <ReadingTimeFilter value={readingTimeValue} onChange={onReadingTimeChange} />
      <SortOrderSelector
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  );
}
