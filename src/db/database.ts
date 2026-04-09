import Dexie, { type Table } from 'dexie';

export interface DocumentRecord {
  id: string;
  title: string;
  sourceType: 'paste' | 'url' | 'epub' | 'pdf' | 'txt' | 'docx' | 'html' | 'md' | 'rss';
  sourceUri: string | null;
  wordCount: number;
  currentPosition: number;
  wpmLastUsed: number;
  readingMode: 'sprint';
  totalTimeMs: number;
  wordSequence: string; // JSON-serialized WordSequence
  createdAt: string;
  updatedAt: string;
  isArchived: 0 | 1;
}

export interface BookmarkRecord {
  id: string;
  documentId: string;
  position: number;
  label: string | null;
  createdAt: string;
}

export interface ReadingSessionRecord {
  id: string;
  documentId: string;
  startedAt: string;
  endedAt: string;
  startPosition: number;
  endPosition: number;
  avgWpm: number;
  durationMs: number;
}

export interface RssFeedRecord {
  id: string;
  url: string;
  title: string;
  lastFetchedAt: string | null;
  refreshIntervalMin: number;
}

class ReadFastDB extends Dexie {
  documents!: Table<DocumentRecord>;
  bookmarks!: Table<BookmarkRecord>;
  sessions!: Table<ReadingSessionRecord>;
  rssFeeds!: Table<RssFeedRecord>;

  constructor() {
    super('readfast');
    this.version(1).stores({
      documents: 'id, sourceType, createdAt, updatedAt, isArchived',
      bookmarks: 'id, documentId',
      sessions: 'id, documentId, startedAt',
      rssFeeds: 'id, url',
    });
  }
}

export const db = new ReadFastDB();
