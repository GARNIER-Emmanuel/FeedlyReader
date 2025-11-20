import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import useFeeds from './useFeeds';

// Small test component to expose hook output
function TestComponent({ feeds, selectedFeed, options }) {
  const { allArticles, sortedArticles, loading } = useFeeds(feeds, selectedFeed, options);
  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="all">{JSON.stringify(allArticles)}</div>
      <div data-testid="sorted">{JSON.stringify(sortedArticles)}</div>
    </div>
  );
}

describe('useFeeds', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('charge et parse les articles, applique recherche et tri', async () => {
    const rss = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Alpha</title>
          <description>First article</description>
          <link>http://example.com/a</link>
          <pubDate>Mon, 01 Jan 2020 00:00:00 GMT</pubDate>
        </item>
        <item>
          <title>Beta</title>
          <description>Second article</description>
          <link>http://example.com/b</link>
          <pubDate>Tue, 02 Jan 2020 00:00:00 GMT</pubDate>
        </item>
      </channel></rss>`;

    // Mock AllOrigins proxy response
    global.fetch.mockResolvedValueOnce({ json: async () => ({ contents: rss }) });

    const feeds = ['http://example.com/feed'];

    const { getByTestId } = render(<TestComponent feeds={feeds} selectedFeed={''} options={{ searchTerm: 'Alpha', sortBy: 'date', sortOrder: 'desc' }} />);

    await waitFor(() => expect(getByTestId('loading').textContent).toBe('false'));

    const all = JSON.parse(getByTestId('all').textContent);
    const sorted = JSON.parse(getByTestId('sorted').textContent);

    expect(all.length).toBe(2);
    // searchTerm 'Alpha' should filter to 1
    expect(sorted.length).toBe(1);
    expect(sorted[0].title).toBe('Alpha');
  });
});
