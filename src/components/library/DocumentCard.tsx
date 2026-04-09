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
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-4 cursor-pointer transition-transform duration-150"
        style={{ transform: showDelete ? 'translateX(-80px)' : 'translateX(0)' }}
        onClick={() => navigate(`/player/${doc.id}`)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-3">
          <Icon size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-medium text-[16px] text-[var(--color-text)] truncate">
              {doc.title}
            </h3>
            <p className="font-serif text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              {progress}% &middot; {formatNumber(doc.wordCount)} words &middot; {timeLeft} min
            </p>
            {/* Progress bar */}
            <div className="mt-2 w-full h-[3px] rounded-[2px] bg-[var(--color-progress-track)]">
              <div
                className="h-full rounded-[2px] bg-[var(--color-accent)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-serif text-[12px] text-[var(--color-text-secondary)] mt-1.5">
              Last read {relativeTime(doc.updatedAt)}
            </p>
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
