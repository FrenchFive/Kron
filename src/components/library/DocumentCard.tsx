import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FileText, Book, FileType, Globe, Rss, File, MoreVertical } from 'lucide-react';
import type { DocumentRecord } from '@/db/database';
import { deleteDocument, updateDocument } from '@/db/documents';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const Icon = sourceIcons[doc.sourceType] ?? File;
  const progress = doc.wordCount > 0 ? Math.round((doc.currentPosition / doc.wordCount) * 100) : 0;
  const wordsLeft = doc.wordCount - doc.currentPosition;
  const timeLeft = estimateReadingTimeMinutes(wordsLeft, doc.wpmLastUsed || 300);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleRestart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateDocument(doc.id, { currentPosition: 0 });
    setMenuOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDocument(doc.id);
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="surface-card relative cursor-pointer p-4"
        onClick={() => navigate(`/player/${doc.id}`)}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="info-badge">
            <Icon size={12} strokeWidth={1.7} />
            {doc.sourceType}
          </span>
          <div className="flex items-center gap-2">
            <span className="tiny-meta">Last read {relativeTime(doc.updatedAt)}</span>
            <div ref={menuRef} className="relative">
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              >
                <MoreVertical size={16} strokeWidth={1.5} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left font-serif text-[14px] font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
                    onClick={handleRestart}
                  >
                    Restart Progress
                  </button>
                  <div className="border-t border-[var(--color-border)]" />
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left font-serif text-[14px] font-semibold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-accent-subtle)]"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-serif text-[17px] font-semibold text-[var(--color-text)]">
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
    </div>
  );
}
