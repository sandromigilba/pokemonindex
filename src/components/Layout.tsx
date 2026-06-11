import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Scale, Compass, Layers, Menu, X, ArrowUp, Swords } from 'lucide-react';
import { usePokemonStore } from '../store/usePokemonStore';
import { FloatingPokeballCursor } from './FloatingPokeballCursor';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);

  // Zustand Store values
  const favoritesCount = usePokemonStore((state) => state.favorites.length);
  const compareCount = usePokemonStore((state) => state.compareList.length);

  // Track window scroll coordinates for scroll-up button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollUp(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/explorer', label: 'Explorer', icon: <Compass className="w-4 h-4" /> },
    { to: '/tcg-cards', label: 'TCG Cards', icon: <Layers className="w-4 h-4" /> },
    { to: '/compare', label: 'Compare', icon: <Scale className="w-4 h-4" />, badge: compareCount > 0 ? compareCount : undefined },
    { to: '/favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" />, badge: favoritesCount > 0 ? favoritesCount : undefined },
    { to: '/battle', label: 'Battle Arena', icon: <Swords className="w-4 h-4" /> },
  ];

  const scrollUpToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A192F] text-slate-100 dark">
      {/* Custom Pokéball Cursor (only desktop) */}
      <FloatingPokeballCursor />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-morphism border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group clickable">
            <div className="relative w-8 h-8 flex items-center justify-center transition-transform duration-500 group-hover:rotate-180">
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full drop-shadow-[0_2px_4px_rgba(255,203,5,0.2)]"
              >
                {/* Upper Half (Red) */}
                <path
                  d="M 12 2 C 6.48 2 2 6.48 2 12 C 2 12.34 2.03 12.67 2.07 13 L 21.93 13 C 21.97 12.67 22 12.34 22 12 C 22 6.48 17.52 2 12 2 Z"
                  fill="#EF4444"
                />
                {/* Bottom Half (White) */}
                <path
                  d="M 2.07 13 C 2.45 17.72 6.38 21.55 11.12 21.93 C 11.41 21.96 11.71 22 12 22 C 17.52 22 22 17.52 22 12 C 22 12.34 21.97 12.01 21.93 11.67 L 2.07 11.67 Z"
                  fill="#F3F4F6"
                />
                {/* Center Line (Black/Slate) */}
                <rect x="1" y="11" width="22" height="2" fill="#1E293B" rx="0.5" />
                {/* Outer Ring */}
                <circle cx="12" cy="12" r="10" fill="none" stroke="#1E293B" strokeWidth="1.5" />
                {/* Center Button Outer */}
                <circle cx="12" cy="12" r="4.5" fill="#1E293B" />
                {/* Center Button Inner */}
                <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-lg tracking-wider text-slate-100 group-hover:text-[#FFCB05] transition-colors duration-200">
              POKÉMON UNIVERSE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-white/5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 clickable
                  ${
                    isActive
                      ? 'bg-slate-800/80 text-[#FFCB05]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
                  }
                `}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="flex items-center justify-center text-[10px] w-4.5 h-4.5 font-bold rounded-full bg-red-500 text-white font-mono animate-pulse">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Action Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/40 border border-white/5 text-slate-300"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-16 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-full bg-[#0A192F] border-b border-white/5 p-6 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between p-3.5 rounded-xl border font-semibold text-sm transition-all
                    ${
                      isActive
                        ? 'bg-slate-800/80 border-[#FFCB05]/30 text-[#FFCB05]'
                        : 'bg-slate-900/20 border-white/5 text-slate-400 hover:text-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="flex items-center justify-center text-[10px] w-5 h-5 font-bold rounded-full bg-red-500 text-white font-mono">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Pages Content Wrap */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <Outlet />
      </main>

      {/* Auto Scroll Up Button */}
      <AnimatePresence>
        {showScrollUp && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 25 }}
            onClick={scrollUpToTop}
            className="fixed bottom-8 right-8 z-40 p-3.5 rounded-full bg-[#FFCB05] hover:bg-[#FFD700] text-slate-950 border border-[#FFCB05]/20 shadow-[0_6px_24px_rgba(255,203,5,0.35)] hover:scale-110 active:scale-95 transition-all clickable"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 mt-16 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm tracking-widest text-[#FFCB05]">
              PÓKEMON UNIVERSE
            </span>
            <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
          </div>

          <div className="text-center sm:text-right text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <span>Powered by</span>
            <a href="https://pokeapi.co" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#FFCB05] transition-colors">PokéAPI</a>
            <span>&</span>
            <a href="https://pokemontcg.io" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">TCG API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Layout;
