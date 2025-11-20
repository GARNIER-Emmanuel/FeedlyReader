import React from 'react';

export default function SourceFilter({ sources = [], value = '', onChange }) {
  // Deduplicate sources
  const uniq = Array.from(new Set(sources.filter(Boolean)));

  return (
    <select
      className="form-select form-select-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: '160px' }}
    >
      <option value="">Tous sources</option>
      {uniq.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
