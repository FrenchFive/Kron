import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useOrientation } from '@/hooks/useOrientation';
import { useSettingsStore } from '@/store/settingsStore';
import { WordDisplay } from '@/components/player/WordDisplay';
import { PlayerControls } from '@/components/player/PlayerControls';
import { ProgressBar } from '@/components/player/ProgressBar';
import { SpeedIndicator } from '@/components/player/SpeedIndicator';
import { ContextPreview } from '@/components/player/ContextPreview';
import { IconButton } from '@/components/ui/IconButton';
import { getDocument } from '@/db/documents';
import { createBookmark, isPositionBookmarked, getBookmarksForDocument, deleteBookmark } from '@/db/bookmarks';
import { getChapterForIndex } from '@/engine/wordSequence';
import type { WordSequence } from '@/engine/wordSequence';
import { formatDuration, estimateReadingTimeMs } from '@/utils/time';
import { formatNumber } from '@/utils/time';
import { CONTROLS_HIDE_DELAY_MS } from '@/utils/constants';
import { hideStatusBar, showStatusBar, onBackButton, unlockOrientation, lockPortrait } from '@/utils/native';

export function PlayerPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const player = usePlayer();
  const defaultWpm = useSettingsStore((s) => s.defaultWpm);

  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  const [showControls, setShowControls] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Load document + native lifecycle
  useEffect(() => {
    if (!documentId) return;

    hideStatusBar();
    unlockOrientation();

    async function load() {
      const doc = await getDocument(documentId!);
      if (!doc) {
        navigate('/');
        return;
      }

      setDocTitle(doc.title);
      const ws: WordSequence = JSON.parse(doc.wordSequence);
      player.loadDocument(documentId!, ws, doc.currentPosition, doc.wpmLastUsed || defaultWpm);
      setLoading(false);
    }

    load();

    // Android back button: pause, save, go back
    const removeBackListener = onBackButton(() => {
      player.pause();
      player.savePosition();
      navigate(-1);
    });

    return () => {
      showStatusBar();
      lockPortrait();
      removeBackListener();
      player.savePosition();
      player.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // Check bookmark status
  useEffect(() => {
    if (!documentId) return;
    isPositionBookmarked(documentId, player.currentIndex).then(setIsBookmarked);
  }, [documentId, player.currentIndex]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    if (player.isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_DELAY_MS);
    }
  }, [player.isPlaying]);

  useEffect(() => {
    if (player.isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_DELAY_MS);
    } else {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [player.isPlaying]);

  // Show context preview after 2s of pausing
  useEffect(() => {
    if (!player.isPlaying && player.totalWords > 0 && !loading) {
      const timer = setTimeout(() => setShowContext(true), 2000);
      return () => clearTimeout(timer);
    }
    setShowContext(false);
  }, [player.isPlaying, player.totalWords, loading]);

  // Gesture handling
  const handleTap = useCallback(() => {
    if (!showControls) {
      resetHideTimer();
    } else {
      player.togglePlayPause();
      resetHideTimer();
    }
  }, [showControls, player, resetHideTimer]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };

    longPressRef.current = setTimeout(() => {
      player.pause();
      setShowContext(true);
      touchStartRef.current = null;
    }, 500);
  }, [player]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressRef.current) clearTimeout(longPressRef.current);

    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 20 && absDy < 20 && dt < 300) {
      handleTap();
      return;
    }

    if (absDx > absDy && absDx > 50) {
      if (dx < 0) player.rewindSentence();
      else player.skipSentence();
      resetHideTimer();
    } else if (absDy > absDx && absDy > 50) {
      if (dy < 0) player.adjustWpm(50);
      else player.adjustWpm(-50);
      resetHideTimer();
    }
  }, [handleTap, player, resetHideTimer]);

  const handleTouchMove = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  const handleBack = useCallback(async () => {
    await player.savePosition();
    navigate(-1);
  }, [player, navigate]);

  const handleToggleBookmark = useCallback(async () => {
    if (!documentId) return;
    if (isBookmarked) {
      const bookmarks = await getBookmarksForDocument(documentId);
      const bm = bookmarks.find(b => b.position === player.currentIndex);
      if (bm) await deleteBookmark(bm.id);
      setIsBookmarked(false);
    } else {
      await createBookmark(documentId, player.currentIndex);
      setIsBookmarked(true);
    }
  }, [documentId, isBookmarked, player.currentIndex]);

  const handleSeek = useCallback((ratio: number) => {
    const idx = Math.round(ratio * (player.totalWords - 1));
    player.seekTo(idx);
    resetHideTimer();
  }, [player, resetHideTimer]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="font-serif text-[15px] text-[var(--color-text-secondary)]">Loading...</span>
      </div>
    );
  }

  const wordsLeft = player.totalWords - player.currentIndex;
  const timeLeftMs = estimateReadingTimeMs(wordsLeft, player.wpm);
  const chapter = player.wordSequence ? getChapterForIndex(player.wordSequence, player.currentIndex) : null;
  const hasMultipleChapters = (player.wordSequence?.chapters.length ?? 0) > 1;

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[var(--color-bg)] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleTap}
    >
      {/* Word display area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div
          className="w-full"
          style={{
            maxWidth: isLandscape ? '960px' : '720px',
            height: isLandscape ? '80px' : '72px',
          }}
        >
          <WordDisplay word={player.currentWord} landscape={isLandscape} />
        </div>
        {hasMultipleChapters && chapter && (
          <p className="tiny-meta mt-5">
            {chapter.title}
          </p>
        )}
      </div>

      {/* Context preview overlay */}
      {showContext && !player.isPlaying && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <ContextPreview words={player.wordArray} currentIndex={player.currentIndex} />
        </div>
      )}

      {/* Top bar */}
      <div
        className="fixed left-0 right-0 top-0 z-30 transition-opacity duration-150"
        style={{
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          paddingTop: isLandscape
            ? 'calc(8px + env(safe-area-inset-top, 0px))'
            : 'calc(12px + env(safe-area-inset-top, 0px))',
          paddingLeft: isLandscape ? 'env(safe-area-inset-left, 0px)' : undefined,
          paddingRight: isLandscape ? 'env(safe-area-inset-right, 0px)' : undefined,
          backgroundColor: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-between px-4 py-2" style={{ maxWidth: isLandscape ? '960px' : '720px' }}>
          <IconButton label="Back" onClick={handleBack}>
            <ArrowLeft size={20} strokeWidth={1.5} />
          </IconButton>
          <span className="max-w-[220px] truncate font-serif text-[15px] font-semibold text-[var(--color-text)]">
            {docTitle}
          </span>
          <IconButton label="Bookmark" onClick={handleToggleBookmark}>
            {isBookmarked ? (
              <BookmarkCheck size={20} strokeWidth={1.5} />
            ) : (
              <Bookmark size={20} strokeWidth={1.5} />
            )}
          </IconButton>
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 transition-opacity duration-150"
        style={{
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          paddingBottom: isLandscape
            ? 'calc(8px + env(safe-area-inset-bottom, 0px))'
            : 'calc(16px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: isLandscape ? 'env(safe-area-inset-left, 0px)' : undefined,
          paddingRight: isLandscape ? 'env(safe-area-inset-right, 0px)' : undefined,
          backgroundColor: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="mx-auto px-4 pb-2" style={{ maxWidth: isLandscape ? '960px' : '720px' }}>
          {/* Position and time */}
          <div className="mb-2 flex justify-between font-serif text-[13px] text-[var(--color-text-secondary)]">
            <span>word {formatNumber(player.currentIndex + 1)} / {formatNumber(player.totalWords)}</span>
            <span>{formatDuration(timeLeftMs)} left</span>
          </div>

          {/* Progress bar */}
          <ProgressBar progress={player.progress} onSeek={handleSeek} />

          {/* In landscape, combine controls + speed in one row */}
          {isLandscape ? (
            <div className="mt-3 flex items-center justify-center gap-6">
              <SpeedIndicator wpm={player.wpm} onAdjust={(d) => player.adjustWpm(d)} />
              <PlayerControls
                isPlaying={player.isPlaying}
                onTogglePlay={() => player.togglePlayPause()}
                onBack20={() => player.skipWords(-20)}
                onForward20={() => player.skipWords(20)}
              />
              {/* Invisible spacer to keep play button centered */}
              <div style={{ width: '140px' }} />
            </div>
          ) : (
            <>
              {/* Player controls */}
              <div className="mt-4">
                <PlayerControls
                  isPlaying={player.isPlaying}
                  onTogglePlay={() => player.togglePlayPause()}
                  onBack20={() => player.skipWords(-20)}
                  onForward20={() => player.skipWords(20)}
                />
              </div>

              {/* Speed control */}
              <div className="mt-3 flex justify-center">
                <SpeedIndicator wpm={player.wpm} onAdjust={(d) => player.adjustWpm(d)} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
