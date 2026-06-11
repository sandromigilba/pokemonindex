import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Compass } from 'lucide-react';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonCard } from '../components/PokemonCard';
import SEO from '../components/SEO';

export const Favorites: React.FC = () => {
  const favorites = usePokemonStore((state) => state.favorites);
  const clearFavorites = usePokemonStore((state) => state.clearFavorites);

  return (
    <div className="space-y-8">
      <SEO
        title="Your Favorite Pokémon"
        description="Browse your personalized bookmarked list of Pokémon, saved offline in your browser."
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold font-display text-white tracking-wide flex items-center gap-2.5">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <span>Favorited Pokémon</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl font-sans">
            Your personal collection of Pokémon, saved locally in your browser storage.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold font-mono text-red-400 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 transition-all clickable"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Favorites</span>
          </button>
        )}
      </div>

      {/* Grid content */}
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl flex flex-col items-center justify-center">
          <Heart className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-400">Your collection is empty</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Start exploring and click the heart icon on any card to add Pokémon here.
          </p>
          <Link
            to="/explorer"
            className="mt-6 inline-flex items-center gap-2 py-2.5 px-6 bg-[#FFCB05] text-slate-950 rounded-full font-semibold text-sm transition-all clickable"
          >
            <Compass className="w-4 h-4" />
            Explore Pokémon
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>

          <div className="text-right text-xs font-mono text-slate-500 pt-4">
            Total of {favorites.length} Pokémon saved offline
          </div>
        </div>
      )}
    </div>
  );
};
export default Favorites;
