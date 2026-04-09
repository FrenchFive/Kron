import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardPaste, Link, Rss, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { PasteTextModal } from '@/components/import/PasteTextModal';
import { FileUploadButton } from '@/components/import/FileUploadButton';

export function ImportPage() {
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);

  return (
    <PageContainer>
      <div className="mb-8 flex items-start gap-3">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <div className="pt-1">
          <span className="page-kicker mb-3">Add Content</span>
          <h1 className="page-title">Import</h1>
        </div>
      </div>

      <div className="surface-card p-5">
        <button
          className="list-row w-full bg-transparent text-left"
          onClick={() => setPasteOpen(true)}
        >
          <ClipboardPaste size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
          <div className="flex-1">
            <span className="block font-serif text-[15px] font-semibold text-[var(--color-text)]">Paste Text</span>
            <span className="tiny-meta">Drop in notes, copied passages, or drafts</span>
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
            <span className="block font-serif text-[15px] font-semibold text-[var(--color-text)]">Import From URL</span>
            <span className="tiny-meta">Extract clean text from a single article link</span>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
        </button>

        <button
          className="list-row w-full bg-transparent text-left"
          onClick={() => navigate('/rss')}
        >
          <Rss size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
          <div className="flex-1">
            <span className="block font-serif text-[15px] font-semibold text-[var(--color-text)]">RSS Feeds</span>
            <span className="tiny-meta">Follow sources and send stories straight to your library</span>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
        </button>
      </div>

      <PasteTextModal isOpen={pasteOpen} onClose={() => setPasteOpen(false)} />
    </PageContainer>
  );
}
