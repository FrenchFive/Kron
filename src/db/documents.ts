import { db, type DocumentRecord } from './database';
import { generateId } from '@/utils/id';

export async function createDocument(
  data: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'currentPosition' | 'totalTimeMs' | 'readingMode'>
): Promise<DocumentRecord> {
  const now = new Date().toISOString();
  const doc: DocumentRecord = {
    ...data,
    id: generateId(),
    currentPosition: 0,
    totalTimeMs: 0,
    readingMode: 'sprint',
    isArchived: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.documents.add(doc);
  return doc;
}

export async function getDocument(id: string): Promise<DocumentRecord | undefined> {
  return db.documents.get(id);
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  return db.documents
    .where('isArchived')
    .equals(0)
    .reverse()
    .sortBy('updatedAt');
}

export async function getRecentDocuments(limit: number): Promise<DocumentRecord[]> {
  const docs = await getAllDocuments();
  return docs.slice(0, limit);
}

export async function updateDocument(id: string, changes: Partial<DocumentRecord>): Promise<void> {
  await db.documents.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function updatePosition(id: string, position: number, wpm: number): Promise<void> {
  await updateDocument(id, { currentPosition: position, wpmLastUsed: wpm });
}

export async function archiveDocument(id: string): Promise<void> {
  await updateDocument(id, { isArchived: 1 });
}

export async function deleteDocument(id: string): Promise<void> {
  await db.transaction('rw', [db.documents, db.bookmarks, db.sessions], async () => {
    await db.bookmarks.where('documentId').equals(id).delete();
    await db.sessions.where('documentId').equals(id).delete();
    await db.documents.delete(id);
  });
}
