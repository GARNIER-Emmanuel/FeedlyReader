import React from 'react';
import NewsCarousel from "../feed/components/NewsCarousel";
import FolderSelector from "../feed/components/FolderSelector";
import Feed from "../feed/components/FeedList";
import ReadActionBar from "./ReadActionBar";
import ArticlePreview from "./ArticlePreview";

export default function ReadView({
  feedsByFolder,
  folders,
  selectedFolder,
  onFolderChange,
  onDeleteFolder,
  onRenameFolder,
  onRandomArticle,
  onDeleteFeed,
  showRandomArticle,
  isRandomLoading,
  onFilterChange,
  themesSectionRef,
}) {
  const refreshAll = () => {
    Object.values(feedsByFolder).flat().forEach(feed => {
      const feedName = typeof feed === 'string' ? new URL(feed).hostname.replace('www.', '') : feed.name;
      const feedUrl = typeof feed === 'string' ? feed : feed.url;
      const cacheKey = `${feedName}-${feedUrl}`;
      localStorage.removeItem(`feed-cache-${cacheKey}`);
    });
    window.location.reload();
  };

  const [selectedArticle, setSelectedArticle] = React.useState(null);
  // Sticky preference for the Read page: default false (non-sticky)
  const [stickyEnabled, setStickyEnabled] = React.useState(() => {
    try {
      const raw = localStorage.getItem('read-sticky-enabled');
      return raw === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSticky = (next) => {
    const newVal = typeof next === 'boolean' ? next : !stickyEnabled;
    setStickyEnabled(newVal);
    try { localStorage.setItem('read-sticky-enabled', newVal ? 'true' : 'false'); } catch (e) {}
  };

  return (
    <>
      <NewsCarousel feeds={Object.values(feedsByFolder).flat()} />
      <ReadActionBar
        onRefreshAll={refreshAll}
        onRandomArticle={onRandomArticle}
        stickyEnabled={stickyEnabled}
        onToggleSticky={toggleSticky}
      />

      <section
        ref={themesSectionRef}
        className={`read-grid read-expanded ${stickyEnabled ? '' : 'no-sticky'}`}
      >
        <div className="read-left">
          {/* left column kept for future controls or metadata (kept intentionally blank for now) */}
        </div>
        <div className="read-center">
          <div className="center-top">
            <FolderSelector
              folders={folders}
              selected={selectedFolder}
              onChange={onFolderChange}
              onDeleteFolder={onDeleteFolder}
              onRenameFolder={onRenameFolder}
              onRandomArticle={onRandomArticle}
            />
          </div>

          <Feed
            feeds={showRandomArticle ? Object.values(feedsByFolder).flat() : feedsByFolder[selectedFolder] || []}
            selectedFolder={selectedFolder}
            onDeleteFeed={onDeleteFeed}
            showRandomArticle={showRandomArticle}
            isRandomLoading={isRandomLoading}
            onFilterChange={onFilterChange}
            onSelectArticle={setSelectedArticle}
            embedded={true}
          />
        </div>
        <div className="read-right">
          <ArticlePreview article={selectedArticle} />
        </div>
      </section>
    </>
  );
}
