import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ClipboardPaste, Link, Rss, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { PasteTextModal } from '@/components/import/PasteTextModal';
import { FileUploadButton } from '@/components/import/FileUploadButton';
import { useSettingsStore } from '@/store/settingsStore';
import { useDocument, useRecentDocuments } from '@/hooks/useDocuments';
import { estimateReadingTimeMinutes } from '@/utils/time';

export function HomePage() {
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);
  const lastDocId = useSettingsStore((s) => s.lastDocumentId);
  const lastDoc = useDocument(lastDocId ?? undefined);
  const recentDocs = useRecentDocuments(5);

  const continueDoc = lastDoc && lastDoc.isArchived === 0 ? lastDoc : null;

  return (
    <PageContainer className="pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-extrabold text-[32px] uppercase tracking-[0.08em] text-[var(--color-accent)]">
          READFAST
        </h1>
        <IconButton label="Settings" onClick={() => navigate('/settings')}>
          <Settings size={20} strokeWidth={1.5} />
        </IconButton>
      </div>

      {/* Continue Reading */}
      {continueDoc && (
        <div
          className="border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] rounded-[4px] p-4 mb-6 cursor-pointer bg-[var(--color-surface)]"
          onClick={() => navigate(`/player/${continueDoc.id}`)}
        >
          <h3 className="font-serif font-medium text-[18px] text-[var(--color-text)] mb-2">
            {continueDoc.title}
          </h3>
          <div className="w-full h-[3px] rounded-[2px] bg-[var(--color-progress-track)] mb-1.5">
            <div
              className="h-full rounded-[2px] bg-[var(--color-accent)]"
              style={{
                width: `${continueDoc.wordCount > 0 ? Math.round((continueDoc.currentPosition / continueDoc.wordCount) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="font-serif text-[13px] text-[var(--color-text-secondary)]">
            {continueDoc.wordCount > 0 ? Math.round((continueDoc.currentPosition / continueDoc.wordCount) * 100) : 0}% &middot;{' '}
            {estimateReadingTimeMinutes(continueDoc.wordCount - continueDoc.currentPosition, continueDoc.wpmLastUsed || 300)} min left
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-2">
          import
        </h2>
        <div>
          <button
            className="w-full flex items-center gap-4 py-4 border-b border-[var(--color-border)] bg-transparent cursor-pointer text-left"
            onClick={() => setPasteOpen(true)}
          >
            <ClipboardPaste size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="font-serif text-[15px] text-[var(--color-text)] flex-1">Paste text</span>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          </button>

          <FileUploadButton />

          <button
            className="w-full flex items-center gap-4 py-4 border-b border-[var(--color-border)] bg-transparent cursor-pointer text-left"
            onClick={() => navigate('/import/url')}
          >
            <Link size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="font-serif text-[15px] text-[var(--color-text)] flex-1">Import from URL</span>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          </button>

          <button
            className="w-full flex items-center gap-4 py-4 border-b border-[var(--color-border)] bg-transparent cursor-pointer text-left"
            onClick={() => navigate('/rss')}
          >
            <Rss size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="font-serif text-[15px] text-[var(--color-text)] flex-1">RSS feeds</span>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>
      </section>

      {/* Recent */}
      <section>
        <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-2">
          recent
        </h2>
        {recentDocs.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="font-display font-extrabold text-[28px] lowercase text-[var(--color-text)] mb-2">
              nothing here yet
            </h3>
            <p className="font-serif text-[var(--color-text-secondary)] text-[15px]">
              import something to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {recentDocs.map(doc => {
              const progress = doc.wordCount > 0 ? Math.round((doc.currentPosition / doc.wordCount) * 100) : 0;
              return (
                <button
                  key={doc.id}
                  className="w-full flex items-center gap-3 py-3 border-b border-[var(--color-border)] bg-transparent cursor-pointer text-left"
                  onClick={() => navigate(`/player/${doc.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-serif text-[15px] text-[var(--color-text)] truncate block">
                      {doc.title}
                    </span>
                  </div>
                  <span className="font-serif text-[12px] text-[var(--color-text-secondary)] shrink-0">
                    {progress}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <PasteTextModal isOpen={pasteOpen} onClose={() => setPasteOpen(false)} />
    </PageContainer>
  );
}
