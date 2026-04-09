import { db, type ReadingSessionRecord } from './database';
import { generateId } from '@/utils/id';

export async function createSession(
  data: Omit<ReadingSessionRecord, 'id'>
): Promise<ReadingSessionRecord> {
  const session: ReadingSessionRecord = {
    ...data,
    id: generateId(),
  };
  await db.sessions.add(session);
  return session;
}

export async function getSessionsForDocument(documentId: string): Promise<ReadingSessionRecord[]> {
  return db.sessions.where('documentId').equals(documentId).sortBy('startedAt');
}

export async function getAllSessions(): Promise<ReadingSessionRecord[]> {
  return db.sessions.toArray();
}

export async function getTodaySessions(): Promise<ReadingSessionRecord[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  return db.sessions
    .where('startedAt')
    .aboveOrEqual(todayIso)
    .toArray();
}

export async function getSessionsInRange(startDate: string, endDate: string): Promise<ReadingSessionRecord[]> {
  return db.sessions
    .where('startedAt')
    .between(startDate, endDate, true, true)
    .toArray();
}
