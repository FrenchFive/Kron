import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateDisplayDuration } from '@/engine/rsvp';
import { updatePosition } from '@/db/documents';
import { AUTOSAVE_INTERVAL_MS } from '@/utils/constants';

export function usePlayer() {
  const store = usePlayerStore();
  const settings = useSettingsStore();
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  const savePosition = useCallback(async () => {
    const { documentId, currentIndex, wpm } = usePlayerStore.getState();
    if (documentId) {
      await updatePosition(documentId, currentIndex, wpm);
    }
  }, []);

  // Main rAF loop
  useEffect(() => {
    if (!store.isPlaying || store.totalWords === 0) {
      return;
    }

    lastTickRef.current = performance.now();
    accumulatorRef.current = 0;

    const tick = (now: number) => {
      const { isPlaying, currentIndex, wpm, wordArray, totalWords } = usePlayerStore.getState();

      if (!isPlaying || currentIndex >= totalWords - 1) {
        if (currentIndex >= totalWords - 1) {
          usePlayerStore.getState().pause();
        }
        return;
      }

      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      accumulatorRef.current += delta;

      const currentWord = wordArray[currentIndex];
      if (!currentWord) return;

      const duration = calculateDisplayDuration(wpm, currentWord.pauseMultiplier);

      if (accumulatorRef.current >= duration) {
        accumulatorRef.current -= duration;
        usePlayerStore.getState().advanceWord();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [store.isPlaying, store.totalWords]);

  // Auto-save on pause
  useEffect(() => {
    if (!store.isPlaying && store.documentId) {
      savePosition();
    }
  }, [store.isPlaying, store.documentId, savePosition]);

  // Auto-save interval during playback
  useEffect(() => {
    if (!store.isPlaying || !store.documentId) return;

    const interval = setInterval(() => {
      savePosition();
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [store.isPlaying, store.documentId, savePosition]);

  // Save on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        usePlayerStore.getState().pause();
        savePosition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [savePosition]);

  // Save on beforeunload
  useEffect(() => {
    const handleUnload = () => {
      const { documentId, currentIndex, wpm } = usePlayerStore.getState();
      if (documentId) {
        // Use synchronous-ish approach for beforeunload
        navigator.sendBeacon?.('/noop', JSON.stringify({ documentId, currentIndex, wpm }));
        // Also attempt direct save (may not complete)
        updatePosition(documentId, currentIndex, wpm);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Update last document ID in settings when a doc is loaded
  useEffect(() => {
    if (store.documentId) {
      settings.setLastDocumentId(store.documentId);
    }
  }, [store.documentId, settings]);

  return {
    ...store,
    currentWord: store.wordArray[store.currentIndex] ?? null,
    progress: store.totalWords > 0 ? store.currentIndex / (store.totalWords - 1) : 0,
    savePosition,
  };
}
