import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { DocumentCard } from '@/components/library/DocumentCard';
import { EmptyLibrary } from '@/components/library/EmptyLibrary';
import { useAllDocuments } from '@/hooks/useDocuments';

type SortMode = 'recent' | 'a-z' | 'progress';

export function LibraryPage() {
  const documents = useAllDocuments();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');

  const filtered = useMemo(() => {
    let docs = documents;

    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q));
    }

    switch (sort) {
      case 'a-z':
        return [...docs].sort((a, b) => a.title.localeCompare(b.title));
      case 'progress':
        return [...docs].sort((a, b) => {
          const pa = a.wordCount > 0 ? a.currentPosition / a.wordCount : 0;
          const pb = b.wordCount > 0 ? b.currentPosition / b.wordCount : 0;
          return pb - pa;
        });
      case 'recent':
      default:
        return docs; // Already sorted by updatedAt desc
    }
  }, [documents, search, sort]);

  const sortOptions: { key: SortMode; label: string }[] = [
    { key: 'recent', label: 'recent' },
    { key: 'a-z', label: 'a-z' },
    { key: 'progress', label: 'progress' },
  ];

  return (
    <PageContainer withTabBar>
      <header className="mb-7">
        <span className="page-kicker mb-3">collection</span>
        <div className="flex items-end justify-between gap-3">
          <h1 className="page-title">library</h1>
          <span className="tiny-meta">{documents.length} docs</span>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder="search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="soft-input pl-11 pr-4"
        />
      </div>

      {/* Sort */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`chip-toggle ${
              sort === key
                ? 'is-active'
                : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(doc => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
