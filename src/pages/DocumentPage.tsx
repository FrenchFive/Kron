import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { db } from '@/db/database';
import { updatePosition, deleteDocument } from '@/db/documents';
import { deleteBookmark } from '@/db/bookmarks';
import { relativeTime, estimateReadingTimeMinutes, formatNumber } from '@/utils/time';
import type { WordSequence } from '@/engine/wordSequence';

export function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const doc = useLiveQuery(() => id ? db.documents.get(id) : undefined, [id]);
  const bookmarks = useLiveQuery(
    () => id ? db.bookmarks.where('documentId').equals(id).sortBy('position') : [],
    [id],
    []
  );

  if (!doc) {
    return (
      <PageContainer className="pt-6 pb-24">
        <p className="font-serif text-[var(--color-text-secondary)]">Document not found.</p>
      </PageContainer>
    );
  }

  const progress = doc.wordCount > 0 ? Math.round((doc.currentPosition / doc.wordCount) * 100) : 0;
  const wordsLeft = doc.wordCount - doc.currentPosition;
  const timeLeft = estimateReadingTimeMinutes(wordsLeft, doc.wpmLastUsed || 300);

  let ws: WordSequence | null = null;
  try {
    ws = JSON.parse(doc.wordSequence);
  } catch {
    // Invalid word sequence
  }

  const handleStartOver = async () => {
    await updatePosition(doc.id, 0, doc.wpmLastUsed);
    navigate(`/player/${doc.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('This will delete this document, its bookmarks, and reading history. This cannot be undone.')) {
      await deleteDocument(doc.id);
      navigate('/library');
    }
  };

  return (
    <PageContainer className="pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <h1 className="font-serif font-medium text-[18px] text-[var(--color-text)] truncate">
          {doc.title}
        </h1>
      </div>

      {/* Metadata */}
      <section className="mb-6">
        <span className="inline-block px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] font-serif font-medium text-[11px] uppercase text-[var(--color-text-secondary)] mb-3">
          {doc.sourceType}
        </span>
        <div className="font-serif text-[13px] text-[var(--color-text-secondary)] space-y-1">
          <p>{formatNumber(doc.wordCount)} words</p>
          <p>Added {relativeTime(doc.createdAt)}</p>
          {doc.sourceUri && (
            <p className="truncate">{doc.sourceUri}</p>
          )}
        </div>
      </section>

      {/* Progress */}
      <section className="mb-6">
        <div className="w-full h-[3px] rounded-[2px] bg-[var(--color-progress-track)] mb-2">
          <div
            className="h-full rounded-[2px] bg-[var(--color-accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-serif text-[13px] text-[var(--color-text-secondary)] mb-4">
          {progress}% complete &middot; {formatNumber(wordsLeft)} words left &middot; ~{timeLeft} min
        </p>
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(`/player/${doc.id}`)}>
            Continue reading
          </Button>
          <Button variant="secondary" onClick={handleStartOver}>
            Start over
          </Button>
        </div>
      </section>

      {/* Chapters */}
      {ws && ws.chapters.length > 1 && (
        <section className="mb-6">
          <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-3">chapters</h2>
          <div className="border border-[var(--color-border)] rounded-[4px] overflow-hidden">
            {ws.chapters.map((chapter, i) => {
              const nextStart = ws!.chapters[i + 1]?.startIndex ?? ws!.totalWords;
              const chapterWords = nextStart - chapter.startIndex;
              return (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 bg-transparent cursor-pointer hover:bg-[var(--color-surface)]"
                  onClick={() => {
                    updatePosition(doc.id, chapter.startIndex, doc.wpmLastUsed);
                    navigate(`/player/${doc.id}`);
                  }}
                >
                  <span className="font-serif text-[14px] text-[var(--color-text)]">{chapter.title}</span>
                  <span className="font-serif text-[12px] text-[var(--color-text-secondary)] ml-2">
                    {formatNumber(chapterWords)} words
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <section className="mb-6">
          <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-3">bookmarks</h2>
          <div className="border border-[var(--color-border)] rounded-[4px] overflow-hidden">
            {bookmarks.map(bm => (
              <div
                key={bm.id}
                className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] last:border-b-0"
              >
                <button
                  className="text-left bg-transparent cursor-pointer border-none"
                  onClick={() => {
                    updatePosition(doc.id, bm.position, doc.wpmLastUsed);
                    navigate(`/player/${doc.id}`);
                  }}
                >
                  <span className="font-serif text-[14px] text-[var(--color-text)]">
                    {bm.label || `Bookmark at word ${formatNumber(bm.position)}`}
                  </span>
                </button>
                <Button variant="danger" onClick={() => deleteBookmark(bm.id)}>
                  delete
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Danger zone */}
      <section className="pt-4 border-t border-[var(--color-border)]">
        <Button variant="danger" onClick={handleDelete}>
          Delete document
        </Button>
      </section>
    </PageContainer>
  );
}
