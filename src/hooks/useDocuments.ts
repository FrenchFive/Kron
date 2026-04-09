import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { DocumentRecord } from '@/db/database';

export function useAllDocuments(): DocumentRecord[] {
  return useLiveQuery(
    () => db.documents
      .where('isArchived')
      .equals(0)
      .reverse()
      .sortBy('updatedAt'),
    [],
    []
  );
}

export function useRecentDocuments(limit: number): DocumentRecord[] {
  const all = useAllDocuments();
  return all.slice(0, limit);
}

export function useDocument(id: string | undefined): DocumentRecord | undefined {
  return useLiveQuery(
    () => id ? db.documents.get(id) : undefined,
    [id],
    undefined
  );
}
