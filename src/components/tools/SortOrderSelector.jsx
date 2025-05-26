export default function SortOrderSelector({ sortBy, setSortBy, sortOrder, setSortOrder }) {
  return (
    <div className="d-flex gap-2" style={{ minWidth: 0 }}>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="form-select form-select-sm flex-grow-1"
        style={{ minWidth: 0, maxWidth: '100%' }}
      >
        <option value="popularity">Popularité</option>
        <option value="title">Titre</option>
        <option value="date">Date</option>
      </select>

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="form-select form-select-sm flex-shrink-0"
        style={{ width: '90px', minWidth: 0 }}
      >
        <option value="asc">↑</option>
        <option value="desc">↓</option>
      </select>
    </div>
  );
}
