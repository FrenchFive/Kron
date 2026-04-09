import { useNavigate } from 'react-router-dom';
import { Settings, Import } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { useSettingsStore } from '@/store/settingsStore';
import { useDocument, useRecentDocuments } from '@/hooks/useDocuments';
import { estimateReadingTimeMinutes } from '@/utils/time';

export function HomePage() {
  const navigate = useNavigate();
  const lastDocId = useSettingsStore((s) => s.lastDocumentId);
  const lastDoc = useDocument(lastDocId ?? undefined);
  const recentDocs = useRecentDocuments(5);

  const continueDoc = lastDoc && lastDoc.isArchived === 0 ? lastDoc : null;

  return (
    <PageContainer withTabBar>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="page-kicker">Mobile Reading Ritual</span>
          <h1 className="page-logo">Kr<span className="text-[var(--color-accent)]">o</span>n</h1>
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
              <span className="info-badge mb-3">Continue Reading</span>
              <h2 className="section-heading text-[19px]">{continueDoc.title}</h2>
            </div>
            <span className="font-display text-[26px] font-bold text-[var(--color-accent)]">
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
        <button
          className="surface-card flex w-full cursor-pointer items-center justify-center gap-3 p-6 text-center transition-colors duration-150 hover:bg-[var(--color-surface)]"
          onClick={() => navigate('/import')}
        >
          <Import size={22} strokeWidth={1.5} className="text-[var(--color-accent)]" />
          <span className="font-display text-[18px] font-bold text-[var(--color-text)]">Import</span>
        </button>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="section-heading mb-1">Recent</h2>
          <p className="meta-text">Your latest reading sessions and imported documents.</p>
        </div>
        {recentDocs.length === 0 ? (
          <div className="surface-card empty-state">
            <h3>Nothing Here Yet</h3>
            <p>Import something to get started.</p>
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
                    <span className="block truncate font-serif text-[15px] font-semibold text-[var(--color-text)]">
                      {doc.title}
                    </span>
                    <span className="tiny-meta">{progress}% read</span>
                  </div>
                  <span className="font-display shrink-0 text-[20px] font-bold text-[var(--color-accent)]">
                    {progress}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

    </PageContainer>
  );
}
