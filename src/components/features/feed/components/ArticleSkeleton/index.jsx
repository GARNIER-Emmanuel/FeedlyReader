import React from 'react';
import '../../styles/Feed.css';

export default function ArticleSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-body p-3">
        <div className="skeleton-title" />
        <div className="skeleton-meta" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
        <div className="skeleton-actions" />
      </div>
    </div>
  );
}
