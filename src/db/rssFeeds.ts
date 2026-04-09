import { db, type RssFeedRecord } from './database';
import { generateId } from '@/utils/id';

export async function createRssFeed(url: string, title: string): Promise<RssFeedRecord> {
  const feed: RssFeedRecord = {
    id: generateId(),
    url,
    title,
    lastFetchedAt: null,
    refreshIntervalMin: 60,
  };
  await db.rssFeeds.add(feed);
  return feed;
}

export async function getAllRssFeeds(): Promise<RssFeedRecord[]> {
  return db.rssFeeds.toArray();
}

export async function updateRssFeed(id: string, changes: Partial<RssFeedRecord>): Promise<void> {
  await db.rssFeeds.update(id, changes);
}

export async function deleteRssFeed(id: string): Promise<void> {
  await db.rssFeeds.delete(id);
}
