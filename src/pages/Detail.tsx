import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Scale, Volume2, ShieldCheck, ShieldAlert, ShoppingBag, Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  fetchPokemonDetail, fetchPokemonSpecies, fetchTypeRelations, fetchTCGCardsByPokemon
} from '../utils/api';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonDetailSkeleton } from '../components/LoadingSkeleton';
import { TypeBadge } from '../components/TypeBadge';
import { StatChart } from '../components/StatChart';
import { EvolutionChain } from '../components/EvolutionChain';
import { PokemonCardItem } from '../components/PokemonCardItem';
import SEO from '../components/SEO';

type TabId = 'overview' | 'stats' | 'evolution' | 'moves' | 'cards';

export const Detail: React.FC = () => {
  const { name = '' } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [moveSearch, setMoveSearch] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Zustand Store
  const favorites = usePokemonStore((state) => state.favorites);
  const addFavorite = usePokemonStore((state) => state.addFavorite);
  const removeFavorite = usePokemonStore((state) => state.removeFavorite);
  const compareList = usePokemonStore((state) => state.compareList);
  const addToCompare = usePokemonStore((state) => state.addToCompare);
  const removeFromCompare = usePokemonStore((state) => state.removeFromCompare);

  // 1. Fetch Pokémon Basic details
  const {
    data: pokemon,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ['pokemon-detail', name],
    queryFn: () => fetchPokemonDetail(name),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  // 2. Fetch species details (description, evolution URL)
  const { data: species } = useQuery({
    queryKey: ['pokemon-species', name],
    queryFn: () => fetchPokemonSpecies(name),
    enabled: !!pokemon,
    staleTime: 1000 * 60 * 30,
  });

  // 3. Fetch weakness damage relationships
  const { data: relations } = useQuery({
    queryKey: ['type-relations', pokemon?.types],
    queryFn: () => fetchTypeRelations(pokemon!.types),
    enabled: !!pokemon,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // 4. Fetch TCG Cards
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['pokemon-tcg-cards', name],
    queryFn: () => fetchTCGCardsByPokemon(name),
    enabled: !!pokemon,
    staleTime: 1000 * 60 * 60,
  });

  const isFav = favorites.some((p) => p.name === pokemon?.name);
  const isCompared = compareList.some((p) => p.name === pokemon?.name);

  if (detailLoading) {
    return <PokemonDetailSkeleton />;
  }

  if (detailError || !pokemon) {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl">
        <h2 className="text-xl font-bold text-slate-400">Pokémon not found</h2>
        <p className="text-slate-500 text-sm mt-1">
          The Pokémon name you specified does not exist in our database.
        </p>
        <Link
          to="/explorer"
          className="mt-6 inline-flex items-center gap-2 py-2.5 px-6 bg-[#FFCB05] text-slate-950 rounded-full font-semibold text-sm transition-all clickable"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explorer
        </Link>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFavorite(pokemon.name);
    } else {
      addFavorite(pokemon);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFCB05', '#2A75BB', '#EF4444', '#FFFFFF'],
      });
    }
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(pokemon.name);
    } else {
      const added = addToCompare(pokemon);
      if (!added) {
        alert('You can only compare up to 2 Pokémon at a time!');
      }
    }
  };

  // Play Pokémon Cry helper
  const playCry = () => {
    // Cries audio template from pokeapi.co/api/v2/cries/
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(cryUrl);
    audioRef.current = audio;
    audio.play().catch(() => {
      // Fallback cry url
      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${pokemon.id}.ogg`;
      const fallbackAudio = new Audio(fallbackUrl);
      audioRef.current = fallbackAudio;
      fallbackAudio.play().catch(() => console.log('Audio cry failed to play'));
    });
  };

  const formatPokeId = (num: number) => {
    return `#${num.toString().padStart(4, '0')}`;
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Base Stats' },
    { id: 'evolution', label: 'Evolution' },
    { id: 'moves', label: 'Moves' },
    { id: 'cards', label: 'Trading Cards' },
  ];

  const capName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <div className="space-y-8">
      <SEO
        title={`${capName} Pokédex Entry`}
        description={species?.description || `View stats, evolution chains, moves, and TCG trading cards for ${capName}.`}
        image={pokemon.image}
      />

      {/* Back navigation & action button bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold font-mono text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest clickable"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex gap-2">
          {/* Compare Toggle */}
          <button
            onClick={handleCompareToggle}
            className={`
              flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-all clickable
              ${
                isCompared
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                  : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }
            `}
          >
            {isCompared ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Comparing</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                <span>Compare</span>
              </>
            )}
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={handleFavoriteToggle}
            className={`
              flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-all clickable
              ${
                isFav
                  ? 'bg-red-500/10 border-red-500/40 text-red-500'
                  : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60'
              }
            `}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Visual Container (Generall static Pokeball artwork display) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-morphism card-radius p-8 flex flex-col items-center border border-white/5 bg-slate-900/40 relative overflow-hidden h-[480px]">
            {/* Pokeball radial blur backdrop */}
            <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-slate-800/10 rounded-full blur-xl" />
            <div className="absolute bottom-[-50px] left-[-30px] w-64 h-64 bg-slate-800/10 rounded-full blur-2xl animate-pulse" />

            {/* Genus descriptor */}
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
              {formatPokeId(pokemon.id)} &bull; {species?.genera || 'Pokémon'}
            </span>

            {/* Title */}
            <h2 className="text-3xl font-black font-display text-white mt-1 uppercase tracking-wide">
              {pokemon.name}
            </h2>

            {/* Type Badges */}
            <div className="flex gap-2.5 mt-3">
              {pokemon.types.map((type) => (
                <TypeBadge key={type} type={type} size="md" />
              ))}
            </div>

            {/* Animated Poke Cry & Visual Sprite */}
            <div className="relative w-56 h-56 flex items-center justify-center my-6 group">
              <div className="absolute inset-0 rounded-full bg-slate-800/20 group-hover:scale-110 transition-transform duration-500" />
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-48 h-48 object-contain z-10 drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)] group-hover:scale-105 transition-transform duration-300"
              />

              {/* Sound play overlay button */}
              <button
                onClick={playCry}
                className="absolute bottom-0 right-0 p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-[#FFCB05] transition-all shadow-md border border-white/5 hover:scale-110 active:scale-95 clickable"
                title="Play Pokemon Sound Cry"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Tabbed Panel Container */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-morphism card-radius p-8 border border-white/5 bg-slate-900/40 min-h-[480px] flex flex-col">
            {/* Linear-style Segmented tabs */}
            <div className="flex overflow-x-auto gap-1 bg-slate-950/30 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 mb-6 scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all clickable
                    ${
                      activeTab === tab.id
                        ? 'bg-slate-800 text-[#FFCB05] shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Rendering Content wrapper */}
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full flex-1 flex flex-col"
                >
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Description */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                          Description
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/10 dark:bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                          {species?.description || 'Loading Pokémon catalog entry...'}
                        </p>
                      </div>

                      {/* Physics (Height, Weight, Abilities) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-950/10 dark:bg-slate-950/20 border border-white/5 text-center">
                          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">Height</span>
                          <p className="text-base font-bold text-slate-200 mt-1 font-mono">
                            {pokemon.height / 10} m
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950/10 dark:bg-slate-950/20 border border-white/5 text-center">
                          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">Weight</span>
                          <p className="text-base font-bold text-slate-200 mt-1 font-mono">
                            {pokemon.weight / 10} kg
                          </p>
                        </div>
                        <div className="p-4 col-span-2 sm:col-span-1 rounded-2xl bg-slate-950/10 dark:bg-slate-950/20 border border-white/5 text-center">
                          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">Abilities</span>
                          <p className="text-xs font-semibold text-slate-200 mt-1 capitalize leading-snug">
                            {pokemon.abilities.map((a) => a.replace('-', ' ')).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Weaknesses Element tags mapping */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <span>Elements Vulnerabilities</span>
                        </h4>
                        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-950/10 dark:bg-slate-950/20 border border-white/5 min-h-[50px]">
                          {relations?.doubleDamageFrom && relations.doubleDamageFrom.length > 0 ? (
                            relations.doubleDamageFrom.map((w) => (
                              <TypeBadge key={w} type={w} size="sm" />
                            ))
                          ) : (
                            <span className="text-xs font-mono text-slate-500">
                              Calculating elemental weak points...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BASE STATS TAB */}
                  {activeTab === 'stats' && (
                    <div className="w-full flex-1">
                      <StatChart pokemonList={[pokemon]} />
                    </div>
                  )}

                  {/* EVOLUTION CHAIN TAB */}
                  {activeTab === 'evolution' && (
                    <div className="w-full flex-1 flex flex-col justify-center">
                      <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest mb-4">
                        Evolution Pathway
                      </h4>
                      {species?.evolutionChainUrl ? (
                        <EvolutionChain
                          url={species.evolutionChainUrl}
                          currentPokemonName={pokemon.name}
                        />
                      ) : (
                        <div className="text-center text-xs font-mono text-slate-500 py-6">
                          Resolving evolution tree...
                        </div>
                      )}
                    </div>
                  )}

                  {/* MOVES TAB (Scrollable filterable) */}
                  {activeTab === 'moves' && (
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="relative group clickable">
                        <input
                          type="text"
                          placeholder="Search moves list..."
                          value={moveSearch}
                          onChange={(e) => setMoveSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 focus:bg-slate-950 focus:outline-none rounded-xl border border-white/5 focus:border-[#FFCB05] text-slate-100 text-xs transition-all font-sans"
                        />
                        <Compass className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      
                      <div className="flex-1 max-h-72 overflow-y-auto bg-slate-950/20 dark:bg-slate-950/40 rounded-2xl border border-white/5 p-4 scrollbar-thin">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {pokemon.moves
                            .filter((m) => m.toLowerCase().includes(moveSearch.toLowerCase().trim()))
                            .map((move) => (
                              <div
                                key={move}
                                className="p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl border border-white/5 text-xs text-slate-300 font-mono capitalize transition-all"
                              >
                                {move.replace('-', ' ')}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TRADING CARDS TAB */}
                  {activeTab === 'cards' && (
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
                          Trading Card Varieties
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {cards ? `${cards.length} cards found` : 'Searching database...'}
                        </span>
                      </div>

                      {cardsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="aspect-[3/4] bg-slate-800/40 animate-pulse rounded-2xl" />
                          ))}
                        </div>
                      ) : !cards || cards.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/10 rounded-2xl border border-white/5">
                          <ShoppingBag className="w-8 h-8 text-slate-600 mb-2" />
                          <span className="text-xs text-slate-500 font-mono">
                            No TCG booster cards found for this Pokémon in the active set database.
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto p-1 scrollbar-thin">
                          {cards.map((card) => (
                            <PokemonCardItem key={card.id} card={card} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Detail;
