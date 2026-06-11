import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Scale, Trash2, Search, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { fetchPokemonDetail } from '../utils/api';
import { usePokemonStore } from '../store/usePokemonStore';
import { StatChart } from '../components/StatChart';
import { TypeBadge } from '../components/TypeBadge';
import SEO from '../components/SEO';

export const Compare: React.FC = () => {
  const compareList = usePokemonStore((state) => state.compareList);
  const removeFromCompare = usePokemonStore((state) => state.removeFromCompare);
  const addToCompare = usePokemonStore((state) => state.addToCompare);
  const clearCompare = usePokemonStore((state) => state.clearCompare);

  // Search autocomplete states
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch all Pokémon names for autocompleting selectors
  const { data: allNames } = useQuery({
    queryKey: ['compare-autocomplete-names'],
    queryFn: async () => {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
      return response.data.results.map((p: any) => p.name) as string[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const autocompleteList = React.useMemo(() => {
    if (!allNames || !searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return allNames
      .filter((name) => name.includes(q) && !compareList.some((p) => p.name === name))
      .slice(0, 5);
  }, [allNames, searchTerm, compareList]);

  const handleAddPokemon = async (name: string) => {
    try {
      setIsSearching(true);
      const detail = await fetchPokemonDetail(name);
      const added = addToCompare(detail);
      if (added) {
        setSearchTerm('');
      } else {
        alert('You can only compare up to 2 Pokémon at a time!');
      }
    } catch (e) {
      console.error('Failed to add Pokémon to comparison list', e);
    } finally {
      setIsSearching(false);
    }
  };

  const getCommonMoves = () => {
    if (compareList.length < 2) return [];
    const movesA = compareList[0].moves;
    const movesB = compareList[1].moves;
    return movesA.filter((move) => movesB.includes(move));
  };

  const commonMoves = getCommonMoves();

  return (
    <div className="space-y-8">
      <SEO
        title="Compare Pokémon Stats"
        description="Compare stats, types, moves, weight, and heights of two Pokémon side-by-side with overlapping radar graphs."
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold font-display text-white tracking-wide flex items-center gap-2.5">
            <Scale className="w-8 h-8 text-[#FFCB05]" />
            <span>Compare Pokémon</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl font-sans">
            Add exactly two Pokémon to compare their traits and overlay stats charts.
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold font-mono text-red-400 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 transition-all clickable"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Compare List</span>
          </button>
        )}
      </div>

      {/* Add Pokémon Inline Search Bar (if slot available) */}
      {compareList.length < 2 && (
        <div className="glass-morphism card-radius p-6 border border-white/5 bg-slate-900/40 relative">
          <h3 className="text-sm font-bold tracking-wider font-mono text-slate-400 uppercase mb-3">
            Add Pokémon to comparison ({compareList.length}/2)
          </h3>
          <div className="relative group clickable max-w-lg">
            <input
              type="text"
              placeholder="Search by name or ID (e.g. Venusaur)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950/40 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-[#FFCB05] text-slate-100 text-xs transition-all font-sans"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Autocomplete Suggestions Drawer */}
          {autocompleteList.length > 0 && (
            <div className="absolute left-6 right-6 max-w-lg mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-20">
              {autocompleteList.map((name) => (
                <button
                  key={name}
                  onClick={() => handleAddPokemon(name)}
                  className="w-full text-left px-5 py-3 hover:bg-slate-800 text-slate-200 text-xs font-mono capitalize border-b border-white/5 last:border-b-0 flex justify-between items-center transition-all clickable"
                >
                  <span>{name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          )}
          {isSearching && (
            <div className="mt-3 text-xs font-mono text-slate-400 animate-pulse">
              Retrieving Pokémon stats...
            </div>
          )}
        </div>
      )}

      {/* Comparison Workspace */}
      {compareList.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl flex flex-col items-center justify-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-400">Comparison is empty</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Search above or visit the{' '}
            <Link to="/explorer" className="text-[#FFCB05] hover:underline">
              Explorer
            </Link>{' '}
            to select Pokémon to compare.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Side-by-Side details cards */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Render selected pokemon */}
            {compareList.map((pokemon, index) => {
              const capName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
              return (
                <div
                  key={pokemon.id}
                  className="relative glass-morphism card-radius p-6 border border-white/5 bg-slate-900/40 flex flex-col items-center text-center overflow-hidden"
                >
                  {/* Remove control */}
                  <button
                    onClick={() => removeFromCompare(pokemon.name)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all clickable"
                    title="Remove Pokémon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">
                    POKÉMON {index + 1}
                  </span>

                  <h3 className="text-2xl font-black font-display text-white mt-2 uppercase tracking-wide">
                    {capName}
                  </h3>

                  <div className="flex gap-2.5 mt-2 justify-center">
                    {pokemon.types.map((type) => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>

                  <div className="relative w-36 h-36 flex items-center justify-center my-6">
                    <div className="absolute inset-0 rounded-full bg-slate-800/10 blur-sm" />
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="w-28 h-28 object-contain z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                    />
                  </div>

                  {/* Physics details */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-3 bg-slate-950/20 rounded-xl border border-white/5">
                      <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Height</span>
                      <p className="text-xs font-bold text-slate-200 mt-0.5 font-mono">
                        {pokemon.height / 10} m
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950/20 rounded-xl border border-white/5">
                      <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Weight</span>
                      <p className="text-xs font-bold text-slate-200 mt-0.5 font-mono">
                        {pokemon.weight / 10} kg
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 w-full p-3 bg-slate-950/20 rounded-xl border border-white/5">
                    <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">Abilities</span>
                    <p className="text-xs font-semibold text-slate-300 mt-1 capitalize leading-snug">
                      {pokemon.abilities.map((a) => a.replace('-', ' ')).join(', ')}
                    </p>
                  </div>

                  <Link
                    to={`/pokemon/${pokemon.name}`}
                    className="mt-6 inline-flex items-center gap-1.5 py-2 px-5 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-full transition-all border border-white/5 clickable"
                  >
                    <span>Inspect Entry</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}

            {/* Empty block if only 1 added */}
            {compareList.length === 1 && (
              <div className="glass-morphism card-radius p-6 border border-white/5 border-dashed bg-slate-950/10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <Scale className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                <span className="text-xs font-mono text-slate-500">
                  Waiting to add Pokémon 2...
                </span>
              </div>
            )}
          </div>

          {/* Right stats chart display panel */}
          <div className="lg:col-span-5">
            <div className="glass-morphism card-radius p-8 border border-white/5 bg-slate-900/40">
              <StatChart pokemonList={compareList} />
            </div>
          </div>
        </div>
      )}

      {/* Shared moves section */}
      {compareList.length === 2 && (
        <div className="glass-morphism card-radius p-6 border border-white/5 bg-slate-900/40">
          <h3 className="text-sm font-bold tracking-wider font-mono text-slate-400 uppercase mb-4">
            Shared Moveset overlap ({commonMoves.length})
          </h3>
          {commonMoves.length === 0 ? (
            <span className="text-xs font-mono text-slate-500">
              These two Pokémon share no common attacks.
            </span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {commonMoves.map((move) => (
                <div
                  key={move}
                  className="py-1 px-3 bg-slate-950/20 border border-white/5 rounded-lg text-xs font-mono text-slate-300 capitalize"
                >
                  {move.replace('-', ' ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Compare;
