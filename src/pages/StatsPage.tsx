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
    <PageContainer className="pt-6 pb-24">
      <h1 className="font-display font-extrabold text-[26px] lowercase text-[var(--color-text)] mb-6">
        stats
      </h1>

      {!stats ? (
        <div className="text-center py-16">
          <h2 className="font-display font-extrabold text-[28px] lowercase text-[var(--color-text)] mb-2">
            no stats yet
          </h2>
          <p className="font-serif text-[var(--color-text-secondary)] text-[15px]">
            start reading to see your progress
          </p>
        </div>
      ) : (
        <>
          {/* Today */}
          <section className="mb-8">
            <div className="text-center mb-4">
              <p className="font-display font-extrabold text-[40px] text-[var(--color-accent)]">
                {formatNumber(stats.today.words)}
              </p>
              <p className="font-serif text-[14px] text-[var(--color-text-secondary)]">words today</p>
            </div>
            <div className="flex justify-center gap-8">
              <MiniStat value={formatDurationLong(stats.today.timeMs)} label="time" />
              <MiniStat value={`${stats.today.avgWpm}`} label="wpm" />
              <MiniStat value={`${stats.today.docs}`} label={stats.today.docs === 1 ? 'doc' : 'docs'} />
            </div>
          </section>

          {/* Streak */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display font-extrabold text-[24px] text-[var(--color-accent)]">{stats.streak}</span>
              <span className="font-serif text-[15px] text-[var(--color-text)]">day streak</span>
            </div>
            <div className="flex gap-2">
              {stats.last7Days.map((active, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    active ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* All time */}
          <section>
            <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-3">all time</h2>
            <div className="space-y-3">
              <StatRow label="Total words read" value={formatNumber(stats.allTime.totalWords)} />
              <StatRow label="Total reading time" value={formatDurationLong(stats.allTime.totalTimeMs)} />
              <StatRow label="Average WPM" value={`${stats.allTime.avgWpm}`} />
              {stats.allTime.timeSavedMs > 0 && (
                <StatRow label="Time saved vs 250 WPM" value={formatDurationLong(stats.allTime.timeSavedMs)} />
              )}
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif font-bold text-[15px] text-[var(--color-text)]">{value}</p>
      <p className="font-serif text-[12px] text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
      <span className="font-serif text-[15px] text-[var(--color-text)]">{label}</span>
      <span className="font-serif text-[15px] text-[var(--color-text)]">{value}</span>
    </div>
  );
}
