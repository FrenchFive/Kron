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
      <PageContainer>
        <div className="surface-card empty-state">
          <h2>Document Not Found</h2>
          <p>This entry may have been deleted or moved out of your library.</p>
        </div>
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
    <PageContainer>
      <header className="mb-7 flex items-start gap-3">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <div className="min-w-0">
          <span className="page-kicker mb-3">Document</span>
          <h1 className="page-title truncate">{doc.title}</h1>
        </div>
      </header>

      {/* Metadata */}
      <section className="surface-card mb-5 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="info-badge">{doc.sourceType}</span>
          <span className="info-badge">added {relativeTime(doc.createdAt)}</span>
        </div>
        <div className="space-y-1">
          <p className="meta-text">{formatNumber(doc.wordCount)} words</p>
          {doc.sourceUri && (
            <p className="tiny-meta truncate">{doc.sourceUri}</p>
          )}
        </div>
      </section>

      {/* Progress */}
      <section className="surface-card-flat mb-5 p-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="page-kicker mb-2">Progress</p>
            <p className="font-display text-[32px] font-bold leading-none text-[var(--color-accent)]">{progress}%</p>
          </div>
          <div className="text-right">
            <p className="meta-text">{formatNumber(wordsLeft)} words left</p>
            <p className="tiny-meta">about {timeLeft} min remaining</p>
          </div>
        </div>
        <div className="mb-4 w-full h-[4px] rounded-full bg-[var(--color-progress-track)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
        <section className="surface-card-flat mb-5 p-5">
          <h2 className="section-heading mb-4">Chapters</h2>
          <div>
            {ws.chapters.map((chapter, i) => {
              const nextStart = ws!.chapters[i + 1]?.startIndex ?? ws!.totalWords;
              const chapterWords = nextStart - chapter.startIndex;
              return (
                <button
                  key={i}
                  className="list-row w-full bg-transparent text-left"
                  onClick={() => {
                    updatePosition(doc.id, chapter.startIndex, doc.wpmLastUsed);
                    navigate(`/player/${doc.id}`);
                  }}
                >
                  <div className="flex-1">
                    <span className="block font-serif text-[15px] font-semibold text-[var(--color-text)]">{chapter.title}</span>
                    <span className="tiny-meta">{formatNumber(chapterWords)} words</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <section className="surface-card-flat mb-5 p-5">
          <h2 className="section-heading mb-4">Bookmarks</h2>
          <div>
            {bookmarks.map(bm => (
              <div
                key={bm.id}
                className="list-row justify-between"
              >
                <button
                  className="flex-1 bg-transparent text-left cursor-pointer border-none p-0"
                  onClick={() => {
                    updatePosition(doc.id, bm.position, doc.wpmLastUsed);
                    navigate(`/player/${doc.id}`);
                  }}
                >
                  <span className="block font-serif text-[15px] font-semibold text-[var(--color-text)]">
                    {bm.label || `Bookmark at word ${formatNumber(bm.position)}`}
                  </span>
                  <span className="tiny-meta">jump back into this spot</span>
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
      <section className="surface-card-flat p-5">
        <p className="page-kicker mb-3">Danger Zone</p>
        <Button variant="danger" onClick={handleDelete}>
          Delete document
        </Button>
      </section>
    </PageContainer>
  );
}
