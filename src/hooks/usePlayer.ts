import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateDisplayDuration } from '@/engine/rsvp';
import { updatePosition, updateDocument, getDocument } from '@/db/documents';
import { createSession } from '@/db/sessions';
import { AUTOSAVE_INTERVAL_MS } from '@/utils/constants';
import { hapticLight, hapticMedium, hapticTick } from '@/utils/native';

export function usePlayer() {
  const store = usePlayerStore();
  const setLastDocumentId = useSettingsStore((s) => s.setLastDocumentId);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  // Session tracking
  const sessionStartRef = useRef<{ time: number; position: number } | null>(null);

  const savePosition = useCallback(async () => {
    const { documentId, currentIndex, wpm } = usePlayerStore.getState();
    if (documentId) {
      await updatePosition(documentId, currentIndex, wpm);
    }
  }, []);

  const endSession = useCallback(async () => {
    const sessionStart = sessionStartRef.current;
    if (!sessionStart) return;
    sessionStartRef.current = null;

    const { documentId, currentIndex, wpm } = usePlayerStore.getState();
    if (!documentId) return;

    const now = Date.now();
    const durationMs = now - sessionStart.time;
    const wordsRead = currentIndex - sessionStart.position;

    // Only save sessions that lasted > 1 second and read > 0 words
    if (durationMs > 1000 && wordsRead > 0) {
      const avgWpm = Math.round((wordsRead / durationMs) * 60_000);

      await createSession({
        documentId,
        startedAt: new Date(sessionStart.time).toISOString(),
        endedAt: new Date(now).toISOString(),
        startPosition: sessionStart.position,
        endPosition: currentIndex,
        avgWpm: avgWpm > 0 ? avgWpm : wpm,
        durationMs,
      });

      // Update total reading time on the document
      const currentDoc = await getDocument(documentId);
      if (currentDoc) {
        await updateDocument(documentId, {
          totalTimeMs: currentDoc.totalTimeMs + durationMs,
        });
      }
    }
  }, []);

  // Main rAF loop
  useEffect(() => {
    if (!store.isPlaying || store.totalWords === 0) {
      return;
    }

    // Start a new session
    sessionStartRef.current = {
      time: Date.now(),
      position: usePlayerStore.getState().currentIndex,
    };

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

  // End session and save on pause
  useEffect(() => {
    if (!store.isPlaying && store.documentId) {
      endSession();
      savePosition();
    }
  }, [store.isPlaying, store.documentId, endSession, savePosition]);

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
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Save on beforeunload
  useEffect(() => {
    const handleUnload = () => {
      const { documentId, currentIndex, wpm } = usePlayerStore.getState();
      if (documentId) {
        updatePosition(documentId, currentIndex, wpm);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Update last document ID in settings when a doc is loaded
  useEffect(() => {
    if (store.documentId) {
      setLastDocumentId(store.documentId);
    }
  }, [store.documentId, setLastDocumentId]);

  // Wrap actions with haptic feedback
  const togglePlayPause = useCallback(() => {
    hapticLight();
    store.togglePlayPause();
  }, [store]);

  const rewindSentence = useCallback(() => {
    hapticMedium();
    store.rewindSentence();
  }, [store]);

  const rewindParagraph = useCallback(() => {
    hapticMedium();
    store.rewindParagraph();
  }, [store]);

  const skipSentence = useCallback(() => {
    hapticMedium();
    store.skipSentence();
  }, [store]);

  const skipParagraph = useCallback(() => {
    hapticMedium();
    store.skipParagraph();
  }, [store]);

  const skipWords = useCallback((count: number) => {
    hapticMedium();
    store.skipWords(count);
  }, [store]);

  const adjustWpm = useCallback((delta: number) => {
    hapticTick();
    store.adjustWpm(delta);
  }, [store]);

  return {
    ...store,
    togglePlayPause,
    rewindSentence,
    rewindParagraph,
    skipSentence,
    skipParagraph,
    skipWords,
    adjustWpm,
    currentWord: store.wordArray[store.currentIndex] ?? null,
    progress: store.totalWords > 0 ? store.currentIndex / (store.totalWords - 1) : 0,
    savePosition,
  };
}
