import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Compass, Eye, Filter } from 'lucide-react';
import { fetchPokemonDetail } from '../utils/api';
import type { PokemonDetail } from '../utils/api';
import { PokemonCard } from '../components/PokemonCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';

const GENERATIONS = [
  { label: 'All Generations', min: 1, max: 1025 },
  { label: 'Gen 1 (Kanto)', min: 1, max: 151 },
  { label: 'Gen 2 (Johto)', min: 152, max: 251 },
  { label: 'Gen 3 (Hoenn)', min: 252, max: 386 },
  { label: 'Gen 4 (Sinnoh)', min: 387, max: 493 },
  { label: 'Gen 5 (Unova)', min: 494, max: 649 },
  { label: 'Gen 6 (Kalos)', min: 650, max: 721 },
  { label: 'Gen 7 (Alola)', min: 722, max: 809 },
  { label: 'Gen 8 (Galar)', min: 810, max: 905 },
  { label: 'Gen 9 (Paldea)', min: 906, max: 1025 },
];

const TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
  'rock', 'ghost', 'dragon', 'steel', 'fairy', 'dark'
];

export const Explorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const typeParamVal = searchParams.get('type') || '';
  const genParamVal = parseInt(searchParams.get('gen') || '0');

  // Input states
  const [search, setSearch] = useState(searchParamVal);
  const [selectedType, setSelectedType] = useState(typeParamVal);
  const [selectedGenIndex, setSelectedGenIndex] = useState(genParamVal);
  const [limit, setLimit] = useState(20);

  // Intersection Ref for Infinite Scroll
  const loaderRef = useRef<HTMLDivElement>(null);

  // Sync inputs with URL params
  useEffect(() => {
    setSearch(searchParamVal);
    setSelectedType(typeParamVal);
    setSelectedGenIndex(genParamVal);
    setLimit(20); // Reset pagination on filter change
  }, [searchParamVal, typeParamVal, genParamVal]);

  // 1. Fetch All Pokemon list (simple name & url) for local filtering
  const { data: allPokemon, isLoading: namesLoading } = useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: async () => {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
      return response.data.results.map((p: any, idx: number) => ({
        name: p.name,
        id: idx + 1,
        url: p.url,
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // 2. Fetch Pokémon names of the selected type (if filter active)
  const { data: typePokemon, isLoading: typeLoading } = useQuery({
    queryKey: ['type-pokemon', selectedType],
    queryFn: async () => {
      if (!selectedType) return null;
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${selectedType}`);
      return response.data.pokemon.map((p: any) => p.pokemon.name) as string[];
    },
    enabled: !!selectedType,
  });

  // Filter computation
  const filteredList = React.useMemo(() => {
    if (!allPokemon) return [];
    
    let list = [...allPokemon];

    // Filter by type intersection
    if (selectedType && typePokemon) {
      list = list.filter((p) => typePokemon.includes(p.name));
    }

    // Filter by generation
    if (selectedGenIndex > 0) {
      const genRange = GENERATIONS[selectedGenIndex];
      list = list.filter((p) => p.id >= genRange.min && p.id <= genRange.max);
    }

    // Filter by search string
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((p) => p.name.includes(q) || p.id.toString() === q);
    }

    return list;
  }, [allPokemon, typePokemon, selectedType, selectedGenIndex, search]);

  // 3. Paginate the filtered list
  const paginatedList = React.useMemo(() => {
    return filteredList.slice(0, limit);
  }, [filteredList, limit]);

  // 4. Fetch details in parallel for current visible page
  const detailsQuery = useQuery({
    queryKey: ['pokemon-details-page', paginatedList.map((p) => p.name)],
    queryFn: async () => {
      if (paginatedList.length === 0) return [];
      const details = await Promise.all(
        paginatedList.map(async (p) => {
          try {
            return await fetchPokemonDetail(p.name);
          } catch (e) {
            return null;
          }
        })
      );
      return details.filter((d): d is PokemonDetail => d !== null);
    },
    enabled: paginatedList.length > 0,
  });

  const pokemonDetails = detailsQuery.data as PokemonDetail[] | undefined;
  const detailsLoading = detailsQuery.isLoading;

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && limit < filteredList.length) {
          setLimit((prev) => prev + 12);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [filteredList, limit]);

  const updateFilters = (newSearch: string, newType: string, newGenIdx: number) => {
    const params: Record<string, string> = {};
    if (newSearch.trim()) params.search = newSearch.trim();
    if (newType) params.type = newType;
    if (newGenIdx > 0) params.gen = newGenIdx.toString();
    setSearchParams(params);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    updateFilters(e.target.value, selectedType, selectedGenIndex);
  };

  const handleTypeSelect = (type: string) => {
    const nextType = selectedType === type ? '' : type;
    setSelectedType(nextType);
    updateFilters(search, nextType, selectedGenIndex);
  };

  const handleGenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    setSelectedGenIndex(idx);
    updateFilters(search, selectedType, idx);
  };

  const isPageLoading = namesLoading || typeLoading;

  return (
    <div className="space-y-8">
      <SEO
        title="Explore Pokémon Database"
        description="Filter and search across all Pokémon generations and types. View dynamic stats, moves, and models."
      />

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold font-display text-white tracking-wide flex items-center gap-2.5">
          <Compass className="w-8 h-8 text-[#FFCB05]" />
          <span>Pokémon Explorer</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl font-sans">
          Browse, filter, and compare across all 9 generations. Scroll down to trigger infinite index loading.
        </p>
      </div>

      {/* Filter Section */}
      <div className="glass-morphism card-radius p-6 border border-white/5 bg-slate-900/40 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Text Search */}
          <div className="relative flex-1 group clickable">
            <input
              type="text"
              placeholder="Search by name or index..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-[#FFCB05] text-slate-100 transition-all font-sans text-sm"
            />
            <Search className="w-4.5 h-4.5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FFCB05]" />
          </div>

          {/* Generation Filter dropdown */}
          <div className="w-full md:w-64 relative group clickable">
            <select
              value={selectedGenIndex}
              onChange={handleGenChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-[#FFCB05] text-slate-100 transition-all font-sans text-sm appearance-none cursor-pointer"
            >
              {GENERATIONS.map((gen, idx) => (
                <option key={idx} value={idx} className="bg-slate-900 text-white">
                  {gen.label}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Element Type Badges Row */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">
            Filter by Element
          </span>
          <div className="flex flex-wrap gap-2.5">
            {TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`
                    px-3.5 py-1.5 text-xs font-bold capitalize rounded-full transition-all border clickable
                    ${
                      active
                        ? 'bg-[#FFCB05] text-slate-900 border-[#FFCB05] shadow-[0_4px_12px_rgba(255,203,5,0.2)] scale-105'
                        : 'bg-slate-950/20 border-white/5 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }
                  `}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid content */}
      <div className="min-h-[400px]">
        {isPageLoading ? (
          <LoadingGrid count={12} />
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
            <Eye className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No Pokémon found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Try modifying your search text, type filters, or generation ranges.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pokemonDetails ? (
                pokemonDetails.map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))
              ) : (
                <LoadingGrid count={paginatedList.length} />
              )}
              {/* Extra loading cards if details fetching page and list loaded */}
              {detailsLoading && pokemonDetails && pokemonDetails.length < paginatedList.length && (
                <LoadingGrid count={paginatedList.length - pokemonDetails.length} />
              )}
            </div>

            {/* Load more infinite scroll boundary trigger */}
            {limit < filteredList.length && (
              <div
                ref={loaderRef}
                className="w-full py-12 flex justify-center items-center"
              >
                <div className="w-8 h-8 rounded-full border-4 border-t-transparent border-[#FFCB05] animate-spin" />
              </div>
            )}

            {/* Total Indicator */}
            <div className="text-center text-xs font-mono text-slate-500">
              Showing {Math.min(limit, filteredList.length)} of {filteredList.length} Pokémon matches
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Explorer;
