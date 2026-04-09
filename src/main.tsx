/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy routes keep feature-level failures from crashing the initial shell.
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then((module) => ({ default: module.LibraryPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then((module) => ({ default: module.StatsPage })));
const PlayerPage = lazy(() => import('./pages/PlayerPage').then((module) => ({ default: module.PlayerPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const ImportUrlPage = lazy(() => import('./pages/ImportUrlPage').then((module) => ({ default: module.ImportUrlPage })));
const RssFeedsPage = lazy(() => import('./pages/RssFeedsPage').then((module) => ({ default: module.RssFeedsPage })));
const DocumentPage = lazy(() => import('./pages/DocumentPage').then((module) => ({ default: module.DocumentPage })));

// Register service worker for PWA (web only, not inside Capacitor)
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — offline caching won't work, but app still functions
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<AppBootstrapFallback />}>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/player/:documentId" element={<PlayerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/import/url" element={<ImportUrlPage />} />
              <Route path="/rss" element={<RssFeedsPage />} />
              <Route path="/document/:id" element={<DocumentPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);

function AppBootstrapFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <span className="font-serif text-[15px] text-[var(--color-text-secondary)]">Loading Kron...</span>
    </div>
  );
}
