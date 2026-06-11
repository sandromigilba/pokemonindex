import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Flame, Droplets, Zap, ChevronRight, Trophy } from 'lucide-react';
import { fetchPokemonDetail, fetchTCGCards } from '../utils/api';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonCardItem } from '../components/PokemonCardItem';
import { LoadingGrid, TCGCardSkeleton } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';

const TRENDING_NAMES = ['pikachu', 'charizard', 'gengar', 'mewtwo', 'greninja', 'lucario'];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Trending Pokémon Details
  const { data: trendingPokemon, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-pokemon'],
    queryFn: async () => {
      const details = await Promise.all(
        TRENDING_NAMES.map((name) => fetchPokemonDetail(name))
      );
      return details;
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  // 2. Fetch Latest TCG Cards
  const { data: latestCards, isLoading: cardsLoading } = useQuery({
    queryKey: ['latest-tcg-cards'],
    queryFn: () => fetchTCGCards({ page: 1, pageSize: 4, set: 'sv1' }), // Scarlet & Violet Base Set
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explorer?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickCollections = [
    { name: 'Fire Type', type: 'fire', icon: <Flame className="w-5 h-5 text-red-500" />, bg: 'bg-red-500/10 border-red-500/20' },
    { name: 'Water Type', type: 'water', icon: <Droplets className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-500/10 border-blue-500/20' },
    { name: 'Electric Type', type: 'electric', icon: <Zap className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { name: 'Dragon Type', type: 'dragon', icon: <Trophy className="w-5 h-5 text-violet-500" />, bg: 'bg-violet-500/10 border-violet-500/20' },
  ];

  return (
    <div className="space-y-16">
      <SEO
        title="Explore the Pokémon Universe"
        description="A premium Pokémon portal featuring real-time statistics, evolutions, moves, and holographic TCG physical cards."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden card-radius glass-morphism border border-white/5 py-20 px-8 text-center flex flex-col items-center justify-center min-h-[460px] bg-gradient-to-b from-slate-900/60 to-slate-950/40">
        {/* Background Banner Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-55 z-0 pointer-events-none" 
          style={{ backgroundImage: 'url("/pokemon_banner_bg.png")' }}
        />
        {/* Dark overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/10 z-0 pointer-events-none" />

        {/* Content Container */}
        <div className="z-10 relative flex flex-col items-center max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-tight tracking-tight text-white max-w-4xl">
            The Ultimate Portal for <br />
            <span className="bg-gradient-to-r from-[#FFCB05] via-amber-400 to-[#2A75BB] bg-clip-text text-transparent">
              Pokémon Explorers
            </span>
          </h1>
          {/* Responsive Height Spacer (Taller on Desktop) */}
          <div className="h-6 md:h-16 w-full" />
          <p className="mt-4 text-slate-300 max-w-xl text-sm sm:text-base leading-relaxed">
            Deep-dive into real-time statistics, evolutionary chains, type synergies, and live trading card values from our premium database.
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 w-full max-w-lg relative clickable group">
            <input
              type="text"
              placeholder="Search Pokemon by name or ID (e.g. Charizard, 25)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-4 bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-950 text-white rounded-2xl border border-white/10 focus:border-[#FFCB05] focus:outline-none transition-all shadow-md focus:shadow-[0_0_20px_rgba(255,203,5,0.15)] text-sm font-sans"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FFCB05] transition-colors" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FFCB05] hover:bg-[#FFD700] text-slate-950 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Explore
            </button>
          </form>
        </div>
      </section>

      {/* Featured Collections Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-white tracking-wide flex items-center gap-2">
          Featured Elements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickCollections.map((col, idx) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/explorer?type=${col.type}`)}
              className={`
                flex flex-col items-center justify-center p-6 card-radius border cursor-pointer hover:scale-[1.03] hover:shadow-md transition-all clickable
                ${col.bg}
              `}
            >
              <div className="p-3 bg-slate-950/40 rounded-full border border-white/5 mb-3">
                {col.icon}
              </div>
              <span className="font-semibold text-sm text-slate-300 group-hover:text-white font-display">
                {col.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Pokémon */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
              Trending Pokémon
            </h2>
            <p className="text-xs text-slate-400 font-mono">POPULAR PICKS IN THE REGION</p>
          </div>
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FFCB05] hover:text-[#FFD700] transition-colors font-mono uppercase tracking-wider clickable"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {trendingLoading ? (
          <LoadingGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {trendingPokemon?.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Cards Showcase */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
              Latest Pokémon Cards
            </h2>
            <p className="text-xs text-slate-400 font-mono">SCARLET & VIOLET BOOSTER DROPS</p>
          </div>
          <button
            onClick={() => navigate('/tcg-cards')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider clickable"
          >
            <span>Browse Cards</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {cardsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <TCGCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latestCards?.data.map((card) => (
              <PokemonCardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
