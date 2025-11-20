import React from 'react';

export default function StarfieldBackground() {
  return (
    <div aria-hidden="true" className="starfield" role="presentation">
      <div className="layer layer-1" />
      <div className="layer layer-2" />
      <div className="layer layer-3" />
      {/* subtle orbital overlays */}
      <div className="orbit-overlay" aria-hidden>
        <div className="orbit-circle orbit-small" />
        <div className="orbit-circle orbit-medium" />
        <div className="orbit-circle orbit-large" />
      </div>
    </div>
  );
}
