import React from 'react';

export default function PopularityFilter({ value = 'all', onChange }) {
  return (
    <select
      className="form-select form-select-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: '160px' }}
    >
      <option value="all">Toutes popularités</option>
      <option value="top100">Top 10% (très populaires)</option>
      <option value="top300">Top 30% (populaires)</option>
      <option value="top500">Top 50% (modérément)</option>
    </select>
  );
}
