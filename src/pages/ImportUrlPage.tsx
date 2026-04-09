import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardPaste, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { parseUrl } from '@/parsers/urlParser';
import { createDocument } from '@/db/documents';
import { generateId } from '@/utils/id';
import { useSettingsStore } from '@/store/settingsStore';
import { estimateReadingTimeMinutes, formatNumber } from '@/utils/time';
import type { WordSequence } from '@/engine/wordSequence';
import { getAllWords } from '@/engine/wordSequence';
import { hideKeyboard } from '@/utils/native';

interface ExtractedArticle {
  title: string;
  wordSequence: WordSequence;
  previewText: string;
}

export function ImportUrlPage() {
  const navigate = useNavigate();
  const defaultWpm = useSettingsStore((s) => s.defaultWpm);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<ExtractedArticle | null>(null);

  const handleExtract = async () => {
    if (!url.trim()) return;
    hideKeyboard();
    setLoading(true);
    setError(null);
    setArticle(null);

    try {
      const docId = generateId();
      const result = await parseUrl(url.trim(), docId);
      const allWords = getAllWords(result.wordSequence);
      const preview = allWords.slice(0, 100).map(w => w.text).join(' ') + (allWords.length > 100 ? '...' : '');

      setArticle({
        title: result.title,
        wordSequence: result.wordSequence,
        previewText: preview,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to extract article.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // Clipboard access denied
    }
  };

  const handleAddToLibrary = async (andRead: boolean) => {
    if (!article) return;
    const doc = await createDocument({
      title: article.title,
      sourceType: 'url',
      sourceUri: url.trim(),
      wordCount: article.wordSequence.totalWords,
      wpmLastUsed: defaultWpm,
      wordSequence: JSON.stringify(article.wordSequence),
    });

    if (andRead) {
      navigate(`/player/${doc.id}`);
    } else {
      navigate('/library');
    }
  };

  return (
    <PageContainer>
      <div className="mb-7 flex items-center gap-3">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <div>
          <span className="page-kicker mb-2">Single Article Import</span>
          <h1 className="page-title">Import From URL</h1>
        </div>
      </div>

      <section className="surface-card mb-5 p-5">
        <p className="page-subtitle mb-4 max-w-[30ch]">
          Paste a clean article link and Kron will extract the readable text for you.
        </p>
        <div className="relative mb-4">
          <input
            type="url"
            placeholder="paste a link here..."
            value={url}
            onChange={(e) => { setUrl(e.target.value); setArticle(null); setError(null); }}
            className="soft-input pr-12"
          />
          <button
            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
            onClick={handlePaste}
          >
            <ClipboardPaste size={18} strokeWidth={1.5} />
          </button>
        </div>
        {!article && !loading && !error && (
          <Button onClick={handleExtract} disabled={!url.trim()}>
            Extract article
          </Button>
        )}
      </section>

      {loading && (
        <div className="surface-card-flat mt-5 space-y-3 p-5">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <p className="meta-text">Extracting article...</p>
        </div>
      )}

      {error && (
        <div className="surface-card-flat mt-5 flex items-start gap-3 p-5">
          <AlertCircle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />
          <p className="text-[15px] text-[var(--color-text)]">{error}</p>
        </div>
      )}

      {article && (
        <section className="surface-card mt-5 p-5">
          <span className="info-badge mb-4">preview</span>
          <h2 className="section-heading mb-2 text-[19px]">
            {article.title}
          </h2>
          <p className="meta-text mb-4">
            {formatNumber(article.wordSequence.totalWords)} words &middot;{' '}
            {estimateReadingTimeMinutes(article.wordSequence.totalWords, defaultWpm)} min read
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--color-text)] mb-6">
            {article.previewText}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => handleAddToLibrary(false)}>
              Add to library
            </Button>
            <Button variant="secondary" onClick={() => handleAddToLibrary(true)}>
              Read now
            </Button>
          </div>
        </section>
      )}
    </PageContainer>
  );
}
