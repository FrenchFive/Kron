import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PageContainer } from '@/components/layout/PageContainer';
import { db } from '@/db/database';
import { formatNumber, formatDurationLong } from '@/utils/time';

export function StatsPage() {
  const allSessions = useLiveQuery(() => db.sessions.toArray(), [], []);

  const stats = useMemo(() => {
    if (allSessions.length === 0) return null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today stats
    const todaySessions = allSessions.filter(s => new Date(s.startedAt) >= todayStart);
    const todayWords = todaySessions.reduce((sum, s) => sum + (s.endPosition - s.startPosition), 0);
    const todayTimeMs = todaySessions.reduce((sum, s) => sum + s.durationMs, 0);
    const todayAvgWpm = todaySessions.length > 0
      ? Math.round(todaySessions.reduce((sum, s) => sum + s.avgWpm, 0) / todaySessions.length)
      : 0;
    const todayDocs = new Set(todaySessions.map(s => s.documentId)).size;

    // Streak
    const daysWithReading = new Set<string>();
    for (const s of allSessions) {
      const d = new Date(s.startedAt);
      daysWithReading.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    let streak = 0;
    const checkDate = new Date(now);
    // Check if today has reading
    const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (daysWithReading.has(todayKey)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (daysWithReading.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Last 7 days dots
    const last7Days: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      last7Days.push(daysWithReading.has(key));
    }

    // All time
    const totalWords = allSessions.reduce((sum, s) => sum + (s.endPosition - s.startPosition), 0);
    const totalTimeMs = allSessions.reduce((sum, s) => sum + s.durationMs, 0);
    const completedDocs = 0; // Would need to check docs at 100%
    const avgWpm = allSessions.length > 0
      ? Math.round(allSessions.reduce((sum, s) => sum + s.avgWpm, 0) / allSessions.length)
      : 0;
    const timeSavedMs = totalWords > 0 ? ((totalWords / 250) - (totalWords / avgWpm)) * 60_000 : 0;

    return {
      today: { words: todayWords, timeMs: todayTimeMs, avgWpm: todayAvgWpm, docs: todayDocs },
      streak,
      last7Days,
      allTime: { totalWords, totalTimeMs, completedDocs, avgWpm, timeSavedMs },
    };
  }, [allSessions]);

  return (
    <PageContainer withTabBar>
      <header className="mb-8">
        <span className="page-kicker mb-3">reading profile</span>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="page-title">stats</h1>
            <p className="page-subtitle mt-3 max-w-[28ch]">
              A quiet snapshot of your pace, streak, and time spent reading.
            </p>
          </div>
          {stats && (
            <div className="surface-card-flat shrink-0 px-4 py-3 text-right">
              <p className="tiny-meta">sessions</p>
              <p className="section-heading mt-1">{formatNumber(allSessions.length)}</p>
            </div>
          )}
        </div>
      </header>

      {!stats ? (
        <div className="empty-state surface-card-flat">
          <h2>
            no stats yet
          </h2>
          <p>
            start reading to see your progress
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Today */}
          <section className="surface-card p-6">
            <div className="mb-5 text-center">
              <p className="page-kicker mb-3">today</p>
              <p className="font-display text-[40px] font-extrabold text-[var(--color-accent)]">
                {formatNumber(stats.today.words)}
              </p>
              <p className="meta-text mt-2">words today</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat value={formatDurationLong(stats.today.timeMs)} label="time" />
              <MiniStat value={`${stats.today.avgWpm}`} label="wpm" />
              <MiniStat value={`${stats.today.docs}`} label={stats.today.docs === 1 ? 'doc' : 'docs'} />
            </div>
          </section>

          {/* Streak */}
          <section className="surface-card-flat p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="page-kicker mb-2">streak</p>
                <div className="flex items-end gap-3">
                  <span className="font-display text-[40px] font-extrabold leading-none text-[var(--color-accent)]">{stats.streak}</span>
                  <span className="pb-1 font-serif text-[15px] text-[var(--color-text)]">day streak</span>
                </div>
              </div>
              <p className="meta-text max-w-[12ch] text-right">last 7 days</p>
            </div>
            <div className="flex gap-2">
              {stats.last7Days.map((active, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full ${
                    active ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* All time */}
          <section className="surface-card-flat p-6">
            <h2 className="section-heading mb-4">all time</h2>
            <div className="space-y-1">
              <StatRow label="Total words read" value={formatNumber(stats.allTime.totalWords)} />
              <StatRow label="Total reading time" value={formatDurationLong(stats.allTime.totalTimeMs)} />
              <StatRow label="Average WPM" value={`${stats.allTime.avgWpm}`} />
              {stats.allTime.timeSavedMs > 0 && (
                <StatRow label="Time saved vs 250 WPM" value={formatDurationLong(stats.allTime.timeSavedMs)} />
              )}
            </div>
          </section>
        </div>
      )}
    </PageContainer>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-4 text-center">
      <p className="font-serif text-[15px] font-medium text-[var(--color-text)]">{value}</p>
      <p className="tiny-meta mt-1">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-3 last:border-b-0 last:pb-0">
      <span className="font-serif text-[15px] text-[var(--color-text)]">{label}</span>
      <span className="font-serif text-[15px] font-medium text-[var(--color-text)] text-right">{value}</span>
    </div>
  );
}
