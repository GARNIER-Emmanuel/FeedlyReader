import React from "react";

export default function ReadingTimeFilter({ value, onChange }) {
  return (
    <select
      className="form-select form-select-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: "140px" }}
    >
      <option value="all">Tous</option>
      <option value="5">≤ 5 min</option>
      <option value="10">6–10 min</option>
      <option value="20">11–20 min</option>
      <option value="20plus">20+ min</option>
    </select>
  );
}
