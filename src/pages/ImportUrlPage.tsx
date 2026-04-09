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
    <PageContainer className="pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <h1 className="font-display font-extrabold text-[26px] lowercase text-[var(--color-text)]">
          import from url
        </h1>
      </div>

      {/* URL Input */}
      <div className="relative mb-4">
        <input
          type="url"
          placeholder="paste a link here..."
          value={url}
          onChange={(e) => { setUrl(e.target.value); setArticle(null); setError(null); }}
          className="w-full pr-10 pl-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] font-serif text-[15px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-secondary)]"
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-transparent border-none cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
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

      {/* Loading */}
      {loading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <p className="font-serif text-[13px] text-[var(--color-text-secondary)]">Extracting article...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3">
          <AlertCircle size={18} strokeWidth={1.5} className="text-[var(--color-text-secondary)] mt-0.5 shrink-0" />
          <p className="font-serif text-[14px] text-[var(--color-text)]">{error}</p>
        </div>
      )}

      {/* Preview */}
      {article && (
        <div className="mt-6">
          <h2 className="font-serif font-bold text-[18px] text-[var(--color-text)] mb-2">
            {article.title}
          </h2>
          <p className="font-serif text-[13px] text-[var(--color-text-secondary)] mb-4">
            {formatNumber(article.wordSequence.totalWords)} words &middot;{' '}
            {estimateReadingTimeMinutes(article.wordSequence.totalWords, defaultWpm)} min read
          </p>
          <p className="font-serif text-[14px] text-[var(--color-text)] leading-relaxed mb-6">
            {article.previewText}
          </p>
          <div className="flex items-center gap-4">
            <Button onClick={() => handleAddToLibrary(false)}>
              Add to library
            </Button>
            <Button variant="secondary" onClick={() => handleAddToLibrary(true)}>
              Read now
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
