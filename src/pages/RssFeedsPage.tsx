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
    <PageContainer className="pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <h1 className="font-display font-extrabold text-[26px] lowercase text-[var(--color-text)]">
          rss feeds
        </h1>
      </div>

      {/* Add feed */}
      <div className="flex gap-2 mb-6">
        <input
          type="url"
          placeholder="RSS feed URL..."
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] font-serif text-[15px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-secondary)]"
        />
        <Button onClick={handleAddFeed} disabled={!feedUrl.trim() || loading}>
          {loading ? '...' : 'Add'}
        </Button>
      </div>

      {error && (
        <p className="mb-4 font-serif text-[14px] text-[var(--color-text)]">{error}</p>
      )}

      {/* Feed list */}
      {feeds.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="font-display font-extrabold text-[28px] lowercase text-[var(--color-text)] mb-2">
            no feeds yet
          </h2>
          <p className="font-serif text-[var(--color-text-secondary)] text-[15px]">
            add an RSS feed URL to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feeds.map(feed => (
            <div key={feed.id} className="border border-[var(--color-border)] rounded-[4px] overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => handleToggleFeed(feed.id, feed.url)}>
                <div>
                  <h3 className="font-serif font-medium text-[16px] text-[var(--color-text)]">{feed.title}</h3>
                  <p className="font-serif text-[12px] text-[var(--color-text-secondary)]">
                    {feedArticles[feed.id]?.length ?? '?'} articles
                    {feed.lastFetchedAt && ` · last fetched ${relativeTime(feed.lastFetchedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteFeed(feed.id); }}>
                    delete
                  </Button>
                  {expandedFeed === feed.id ? (
                    <ChevronUp size={18} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
                  ) : (
                    <ChevronDown size={18} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
                  )}
                </div>
              </div>
              {expandedFeed === feed.id && (
                <div className="border-t border-[var(--color-border)]">
                  {(feedArticles[feed.id] ?? []).map(article => (
                    <button
                      key={article.link}
                      className="w-full text-left px-4 py-3 border-b border-[var(--color-border)] bg-transparent cursor-pointer hover:bg-[var(--color-surface)] disabled:opacity-50"
                      onClick={() => handleImportArticle(article)}
                      disabled={importingArticle === article.link}
                    >
                      <span className="font-serif text-[14px] text-[var(--color-text)] block">
                        {importingArticle === article.link ? 'Importing...' : article.title}
                      </span>
                      {article.pubDate && (
                        <span className="font-serif text-[11px] text-[var(--color-text-secondary)]">
                          {relativeTime(article.pubDate)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
