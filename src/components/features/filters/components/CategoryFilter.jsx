import React from 'react';

export default function CategoryFilter({ categories = [], value = '', onChange }) {
  if (!categories || categories.length === 0) return null;

  return (
    <select
      className="form-select form-select-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: '160px' }}
    >
      <option value="">Toutes catégories</option>
      {categories.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
