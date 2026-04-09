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
    <PageContainer className="pt-6 pb-24">
      <h1 className="font-display font-extrabold text-[26px] lowercase text-[var(--color-text)] mb-6">
        library
      </h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder="search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] font-serif text-[15px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-secondary)]"
        />
      </div>

      {/* Sort */}
      <div className="flex gap-3 mb-4">
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`font-serif text-[13px] bg-transparent border-none cursor-pointer transition-colors duration-150 ${
              sort === key
                ? 'font-bold text-[var(--color-text)]'
                : 'font-normal text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
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
