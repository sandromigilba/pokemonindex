import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus for smoother navigation
      retry: 1, // Only retry failed requests once
    },
  },
});

// Lazy loaded page routes for code-splitting
const Home = lazy(() => import('./pages/Home'));
const Explorer = lazy(() => import('./pages/Explorer'));
const Detail = lazy(() => import('./pages/Detail'));
const TCGCards = lazy(() => import('./pages/TCGCards'));
const Compare = lazy(() => import('./pages/Compare'));
const Favorites = lazy(() => import('./pages/Favorites'));
const BattleArena = lazy(() => import('./pages/BattleArena'));

// Pokémon-themed loading screen fallback
const LoadingScreen = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4 text-center">
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Outer spinning border ring */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#FFCB05]/20 animate-spin" style={{ animationDuration: '8s' }} />
      {/* Pokéball rotating icon */}
      <svg className="w-10 h-10 text-[#EF4444] rotating-pokeball" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#FFCB05" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" fill="#0A192F" stroke="#FFCB05" strokeWidth="1.8" />
        <path d="M 2 12 H 8.5 M 15.5 12 H 22" stroke="#FFCB05" strokeWidth="1.8" />
        <path d="M 2.1 12 C 2.5 16.5 6 20.5 10.5 21.6" stroke="#2A75BB" strokeWidth="1" fill="none" />
      </svg>
    </div>
    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
      Syncing with PokéAPI...
    </span>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Main Shared Layout wrapper */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="explorer" element={<Explorer />} />
                  <Route path="pokemon/:name" element={<Detail />} />
                  <Route path="tcg-cards" element={<TCGCards />} />
                  <Route path="compare" element={<Compare />} />
                  <Route path="favorites" element={<Favorites />} />
                  <Route path="battle" element={<BattleArena />} />
                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
