import { db, type BookmarkRecord } from './database';
import { generateId } from '@/utils/id';

export async function createBookmark(
  documentId: string,
  position: number,
  label: string | null = null
): Promise<BookmarkRecord> {
  const bookmark: BookmarkRecord = {
    id: generateId(),
    documentId,
    position,
    label,
    createdAt: new Date().toISOString(),
  };
  await db.bookmarks.add(bookmark);
  return bookmark;
}

export async function getBookmarksForDocument(documentId: string): Promise<BookmarkRecord[]> {
  return db.bookmarks.where('documentId').equals(documentId).sortBy('position');
}

export async function deleteBookmark(id: string): Promise<void> {
  await db.bookmarks.delete(id);
}

export async function isPositionBookmarked(documentId: string, position: number): Promise<boolean> {
  const count = await db.bookmarks
    .where('documentId')
    .equals(documentId)
    .filter(b => b.position === position)
    .count();
  return count > 0;
}
