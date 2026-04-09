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
    <PageContainer withTabBar>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="page-kicker">mobile reading ritual</span>
          <h1 className="page-logo">KRON</h1>
          <p className="page-subtitle max-w-[28ch]">
            read with focus, import from anywhere, and keep the interface quiet.
          </p>
        </div>
        <IconButton label="Settings" onClick={() => navigate('/settings')}>
          <Settings size={20} strokeWidth={1.5} />
        </IconButton>
      </div>

      {continueDoc && (
        <div
          className="surface-card mb-8 cursor-pointer p-5"
          onClick={() => navigate(`/player/${continueDoc.id}`)}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="info-badge mb-3">continue reading</span>
              <h2 className="section-heading text-[19px]">{continueDoc.title}</h2>
            </div>
            <span className="font-display text-[26px] font-extrabold text-[var(--color-accent)]">
              {continueDoc.wordCount > 0 ? Math.round((continueDoc.currentPosition / continueDoc.wordCount) * 100) : 0}%
            </span>
          </div>
          <div className="mb-2 h-[4px] w-full rounded-full bg-[var(--color-progress-track)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{
                width: `${continueDoc.wordCount > 0 ? Math.round((continueDoc.currentPosition / continueDoc.wordCount) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="meta-text">
            pick up where you left off with about{' '}
            {estimateReadingTimeMinutes(continueDoc.wordCount - continueDoc.currentPosition, continueDoc.wpmLastUsed || 300)} min left.
          </p>
        </div>
      )}

      <section className="mb-8">
        <div className="mb-4">
          <h2 className="section-heading mb-1">import</h2>
          <p className="meta-text">bring in articles, files, feeds, or your own notes.</p>
        </div>
        <div className="surface-card p-5">
          <button
            className="list-row w-full bg-transparent text-left"
            onClick={() => setPasteOpen(true)}
          >
            <ClipboardPaste size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
            <div className="flex-1">
              <span className="block font-serif text-[15px] font-medium text-[var(--color-text)]">Paste text</span>
              <span className="tiny-meta">drop in notes, copied passages, or drafts</span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          </button>

          <FileUploadButton />

          <button
            className="list-row w-full bg-transparent text-left"
            onClick={() => navigate('/import/url')}
          >
            <Link size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
            <div className="flex-1">
              <span className="block font-serif text-[15px] font-medium text-[var(--color-text)]">Import from URL</span>
              <span className="tiny-meta">extract clean text from a single article link</span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          </button>

          <button
            className="list-row w-full bg-transparent text-left"
            onClick={() => navigate('/rss')}
          >
            <Rss size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
            <div className="flex-1">
              <span className="block font-serif text-[15px] font-medium text-[var(--color-text)]">RSS feeds</span>
              <span className="tiny-meta">follow sources and send stories straight to your library</span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="section-heading mb-1">recent</h2>
          <p className="meta-text">your latest reading sessions and imported documents.</p>
        </div>
        {recentDocs.length === 0 ? (
          <div className="surface-card empty-state">
            <h3>nothing here yet</h3>
            <p>import something to get started.</p>
          </div>
        ) : (
          <div className="surface-card p-5">
            {recentDocs.map(doc => {
              const progress = doc.wordCount > 0 ? Math.round((doc.currentPosition / doc.wordCount) * 100) : 0;
              return (
                <button
                  key={doc.id}
                  className="list-row w-full bg-transparent text-left"
                  onClick={() => navigate(`/player/${doc.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-serif text-[15px] font-medium text-[var(--color-text)]">
                      {doc.title}
                    </span>
                    <span className="tiny-meta">{progress}% read</span>
                  </div>
                  <span className="font-display shrink-0 text-[20px] font-extrabold text-[var(--color-accent)]">
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
