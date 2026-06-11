import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Layers, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTCGCards, fetchTCGSets } from '../utils/api';
import { PokemonCardItem } from '../components/PokemonCardItem';
import { TCGCardSkeleton } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';

const RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Holo Rare', 
  'Rare Ultra', 'Rare Rainbow', 'Rare Secret', 
  'Rare Holo V', 'Rare Holo VMAX', 'Illustration Rare', 'Special Illustration Rare'
];

const TCG_TYPES = [
  'Colorless', 'Grass', 'Fire', 'Water', 'Lightning', 
  'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy'
];

export const TCGCards: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // 1. Fetch available sets
  const { data: sets } = useQuery({
    queryKey: ['tcg-sets'],
    queryFn: fetchTCGSets,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // 2. Fetch card query list
  const {
    data: cardsData,
    isLoading: cardsLoading,
  } = useQuery({
    queryKey: ['tcg-cards-query', page, search, selectedSet, selectedRarity, selectedType],
    queryFn: () =>
      fetchTCGCards({
        page,
        pageSize,
        query: search,
        set: selectedSet,
        rarity: selectedRarity,
        type: selectedType,
      }),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 10, // 10 mins
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedSet, selectedRarity, selectedType]);

  const handleNextPage = () => {
    if (cardsData && page * pageSize < cardsData.totalCount) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const totalPages = cardsData ? Math.ceil(cardsData.totalCount / pageSize) : 1;

  return (
    <div className="space-y-8">
      <SEO
        title="Pokémon TCG Card Database"
        description="Search and browse thousands of physical Pokémon trading cards. View real-time market prices and foil arts."
      />

      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold font-display text-white tracking-wide flex items-center gap-2.5">
          <Layers className="w-8 h-8 text-blue-500" />
          <span>Pokémon TCG Database</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl font-sans">
          Look up specific card names, filter by rarity profiles, and inspect live market prices from Cardmarket.
        </p>
      </div>

      {/* Filters Grid */}
      <div className="glass-morphism card-radius p-6 border border-white/5 bg-slate-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name input */}
        <div className="relative group clickable">
          <input
            type="text"
            placeholder="Search card names (e.g. Charizard)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-950/40 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-blue-500 text-slate-100 text-xs transition-all font-sans"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Set selection */}
        <select
          value={selectedSet}
          onChange={(e) => setSelectedSet(e.target.value)}
          className="w-full px-4 py-3 bg-slate-950/40 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-blue-500 text-slate-100 text-xs transition-all font-sans cursor-pointer appearance-none"
        >
          <option value="" className="bg-slate-900 text-slate-400">All Expansion Sets</option>
          {sets?.map((set: any) => (
            <option key={set.id} value={set.id} className="bg-slate-900 text-white">
              {set.name} ({set.series})
            </option>
          ))}
        </select>

        {/* Rarity select */}
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="w-full px-4 py-3 bg-slate-950/40 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-blue-500 text-slate-100 text-xs transition-all font-sans cursor-pointer appearance-none"
        >
          <option value="" className="bg-slate-900 text-slate-400">All Rarities</option>
          {RARITIES.map((rarity) => (
            <option key={rarity} value={rarity} className="bg-slate-900 text-white">
              {rarity}
            </option>
          ))}
        </select>

        {/* Element TCG Type select */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-4 py-3 bg-slate-950/40 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-blue-500 text-slate-100 text-xs transition-all font-sans cursor-pointer appearance-none"
        >
          <option value="" className="bg-slate-900 text-slate-400">All TCG Types</option>
          {TCG_TYPES.map((type) => (
            <option key={type} value={type} className="bg-slate-900 text-white">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Grid content */}
      <div className="min-h-[400px]">
        {cardsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <TCGCardSkeleton key={idx} />
            ))}
          </div>
        ) : !cardsData || cardsData.data.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl flex flex-col items-center justify-center">
            <Eye className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No cards found</h3>
            <p className="text-slate-500 text-sm mt-1">
              Try adjusting your set, type or rarity filter parameters.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {cardsData.data.map((card) => (
                <PokemonCardItem key={card.id} card={card} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-white/5">
              <span className="text-xs font-mono text-slate-500">
                Showing {Math.min((page - 1) * pageSize + 1, cardsData.totalCount)} -{' '}
                {Math.min(page * pageSize, cardsData.totalCount)} of {cardsData.totalCount} cards
              </span>

              <div className="flex items-center gap-4 bg-slate-800/40 border border-white/5 p-1.5 rounded-xl">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 text-[#FFCB05] hover:text-white disabled:text-slate-600 disabled:opacity-50 transition-all clickable"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold text-slate-300">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 text-[#FFCB05] hover:text-white disabled:text-slate-600 disabled:opacity-50 transition-all clickable"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TCGCards;
