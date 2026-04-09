/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then(m => ({ default: m.StatsPage })));
const PlayerPage = lazy(() => import('./pages/PlayerPage').then(m => ({ default: m.PlayerPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ImportUrlPage = lazy(() => import('./pages/ImportUrlPage').then(m => ({ default: m.ImportUrlPage })));
const RssFeedsPage = lazy(() => import('./pages/RssFeedsPage').then(m => ({ default: m.RssFeedsPage })));
const ImportPage = lazy(() => import('./pages/ImportPage').then(m => ({ default: m.ImportPage })));
const DocumentPage = lazy(() => import('./pages/DocumentPage').then(m => ({ default: m.DocumentPage })));
const EditContentPage = lazy(() => import('./pages/EditContentPage').then(m => ({ default: m.EditContentPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Register service worker for PWA (web only, not inside Capacitor)
if ('serviceWorker' in navigator && !('Capacitor' in window)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — offline caching won't work, but app still functions
    });
  });
}

function PageFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-bg)]">
      <span className="font-serif text-[15px] text-[var(--color-text-secondary)]">Loading...</span>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/player/:documentId" element={<PlayerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/import/url" element={<ImportUrlPage />} />
              <Route path="/rss" element={<RssFeedsPage />} />
              <Route path="/document/:id" element={<DocumentPage />} />
              <Route path="/edit/:id" element={<EditContentPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
