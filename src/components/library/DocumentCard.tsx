import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { FileText, Book, FileType, Globe, Rss, File } from 'lucide-react';
import type { DocumentRecord } from '@/db/database';
import { deleteDocument } from '@/db/documents';
import { relativeTime, estimateReadingTimeMinutes, formatNumber } from '@/utils/time';

const sourceIcons: Record<string, typeof FileText> = {
  txt: FileText,
  epub: Book,
  pdf: FileType,
  url: Globe,
  rss: Rss,
  paste: FileText,
  html: Globe,
  md: FileText,
  docx: File,
};

interface DocumentCardProps {
  doc: DocumentRecord;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const touchStartX = useRef<number>(0);

  const Icon = sourceIcons[doc.sourceType] ?? File;
  const progress = doc.wordCount > 0 ? Math.round((doc.currentPosition / doc.wordCount) * 100) : 0;
  const wordsLeft = doc.wordCount - doc.currentPosition;
  const timeLeft = estimateReadingTimeMinutes(wordsLeft, doc.wpmLastUsed || 300);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -80) {
      setShowDelete(true);
    } else if (dx > 40) {
      setShowDelete(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDocument(doc.id);
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="surface-card relative cursor-pointer p-4 transition-transform duration-150"
        style={{ transform: showDelete ? 'translateX(-80px)' : 'translateX(0)' }}
        onClick={() => navigate(`/player/${doc.id}`)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="info-badge">
            <Icon size={12} strokeWidth={1.7} />
            {doc.sourceType}
          </span>
          <span className="tiny-meta">last read {relativeTime(doc.updatedAt)}</span>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-serif text-[17px] font-medium text-[var(--color-text)]">
              {doc.title}
            </h3>
            <p className="meta-text mt-1">
              {formatNumber(doc.wordCount)} words &middot; {timeLeft} min left
            </p>
            <div className="mt-4 w-full h-[4px] rounded-full bg-[var(--color-progress-track)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="tiny-meta">{progress}% complete</p>
              <p className="tiny-meta">{formatNumber(wordsLeft)} words left</p>
            </div>
          </div>
        </div>
      </div>
      {/* Delete button revealed on swipe */}
      {showDelete && (
        <button
          className="absolute right-0 top-0 bottom-0 w-[80px] bg-transparent flex items-center justify-center cursor-pointer border-none"
          onClick={handleDelete}
        >
          <span className="font-serif text-[14px] text-[var(--color-danger)] font-medium">delete</span>
        </button>
      )}
    </div>
  );
}
