import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { StatsPage } from './pages/StatsPage';
import { PlayerPage } from './pages/PlayerPage';
import { SettingsPage } from './pages/SettingsPage';
import { ImportUrlPage } from './pages/ImportUrlPage';
import { RssFeedsPage } from './pages/RssFeedsPage';
import { DocumentPage } from './pages/DocumentPage';
import './index.css';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </StrictMode>
);
