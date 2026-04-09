import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { db } from '@/db/database';
import { createRssFeed, deleteRssFeed, updateRssFeed } from '@/db/rssFeeds';
import { parseRssFeed, type RssArticle } from '@/parsers/rssParser';
import { parseUrl } from '@/parsers/urlParser';
import { createDocument } from '@/db/documents';
import { generateId } from '@/utils/id';
import { useSettingsStore } from '@/store/settingsStore';
import { relativeTime } from '@/utils/time';
import { hideKeyboard } from '@/utils/native';

export function RssFeedsPage() {
  const navigate = useNavigate();
  const defaultWpm = useSettingsStore((s) => s.defaultWpm);
  const feeds = useLiveQuery(() => db.rssFeeds.toArray(), [], []);

  const [feedUrl, setFeedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFeed, setExpandedFeed] = useState<string | null>(null);
  const [feedArticles, setFeedArticles] = useState<Record<string, RssArticle[]>>({});
  const [importingArticle, setImportingArticle] = useState<string | null>(null);

  const handleAddFeed = async () => {
    if (!feedUrl.trim()) return;
    hideKeyboard();
    setLoading(true);
    setError(null);
    try {
      const result = await parseRssFeed(feedUrl.trim());
      const feed = await createRssFeed(feedUrl.trim(), result.feedTitle);
      await updateRssFeed(feed.id, { lastFetchedAt: new Date().toISOString() });
      setFeedArticles(prev => ({ ...prev, [feed.id]: result.articles }));
      setFeedUrl('');
    } catch {
      setError('Failed to fetch RSS feed. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeed = useCallback(async (feedId: string, url: string) => {
    if (expandedFeed === feedId) {
      setExpandedFeed(null);
      return;
    }
    setExpandedFeed(feedId);
    if (!feedArticles[feedId]) {
      try {
        const result = await parseRssFeed(url);
        setFeedArticles(prev => ({ ...prev, [feedId]: result.articles }));
        await updateRssFeed(feedId, { lastFetchedAt: new Date().toISOString() });
      } catch {
        // Silently fail — show empty list
      }
    }
  }, [expandedFeed, feedArticles]);

  const handleImportArticle = async (article: RssArticle) => {
    if (!article.link) return;
    setImportingArticle(article.link);
    try {
      const docId = generateId();
      const result = await parseUrl(article.link, docId);

      const doc = await createDocument({
        title: result.title,
        sourceType: 'rss',
        sourceUri: article.link,
        wordCount: result.wordSequence.totalWords,
        wpmLastUsed: defaultWpm,
        wordSequence: JSON.stringify(result.wordSequence),
      });

      navigate(`/player/${doc.id}`);
    } catch {
      setError(`Failed to import "${article.title}".`);
    } finally {
      setImportingArticle(null);
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    await deleteRssFeed(feedId);
    setFeedArticles(prev => {
      const next = { ...prev };
      delete next[feedId];
      return next;
    });
  };

  return (
    <PageContainer>
      <div className="mb-8 flex items-start gap-3">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <div className="pt-1">
          <span className="page-kicker mb-3">feeds</span>
          <h1 className="page-title">rss feeds</h1>
          <p className="page-subtitle mt-3 max-w-[30ch]">
            Track sources you trust and send articles into your reading queue.
          </p>
        </div>
      </div>

      <section className="surface-card p-5 mb-5">
        <div className="mb-4">
          <h2 className="section-heading mb-1">add a feed</h2>
          <p className="meta-text">Paste a feed URL and KRON will keep it ready to import.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            placeholder="RSS feed URL..."
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            className="soft-input flex-1"
          />
          <Button onClick={handleAddFeed} disabled={!feedUrl.trim() || loading} className="sm:self-start">
            {loading ? 'Adding...' : 'Add feed'}
          </Button>
        </div>
      </section>

      {error && (
        <div className="surface-card-flat mb-5 p-4">
          <p className="font-serif text-[15px] text-[var(--color-text)]">{error}</p>
        </div>
      )}

      {feeds.length === 0 ? (
        <div className="surface-card empty-state">
          <h2>no feeds yet</h2>
          <p>add an RSS feed URL to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feeds.map(feed => (
            <div key={feed.id} className="surface-card-flat overflow-hidden">
              <div className="flex cursor-pointer items-center justify-between gap-4 p-5" onClick={() => handleToggleFeed(feed.id, feed.url)}>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-[17px] font-medium text-[var(--color-text)]">{feed.title}</h3>
                  <p className="meta-text mt-1">
                    {feedArticles[feed.id]?.length ?? '?'} articles
                    {feed.lastFetchedAt && ` · last fetched ${relativeTime(feed.lastFetchedAt)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteFeed(feed.id); }}>
                    delete
                  </Button>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                    {expandedFeed === feed.id ? (
                      <ChevronUp size={18} strokeWidth={1.5} />
                    ) : (
                      <ChevronDown size={18} strokeWidth={1.5} />
                    )}
                  </span>
                </div>
              </div>
              {expandedFeed === feed.id && (
                <div className="border-t border-[var(--color-border)] px-5 py-2">
                  {(feedArticles[feed.id] ?? []).length === 0 ? (
                    <p className="meta-text py-4">No articles available right now.</p>
                  ) : (
                    (feedArticles[feed.id] ?? []).map(article => (
                      <button
                        key={article.link}
                        className="list-row w-full bg-transparent text-left disabled:opacity-50"
                        onClick={() => handleImportArticle(article)}
                        disabled={importingArticle === article.link}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="block truncate font-serif text-[15px] font-medium text-[var(--color-text)]">
                            {importingArticle === article.link ? 'Importing...' : article.title}
                          </span>
                          {article.pubDate && (
                            <span className="tiny-meta">{relativeTime(article.pubDate)}</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
