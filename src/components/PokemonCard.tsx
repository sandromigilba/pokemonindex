import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Scale, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PokemonDetail } from '../utils/api';
import { usePokemonStore } from '../store/usePokemonStore';
import { TypeBadge } from './TypeBadge';

interface PokemonCardProps {
  pokemon: PokemonDetail;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  const { name, id, types, image } = pokemon;

  // Zustand Store Hooks
  const favorites = usePokemonStore((state) => state.favorites);
  const addFavorite = usePokemonStore((state) => state.addFavorite);
  const removeFavorite = usePokemonStore((state) => state.removeFavorite);
  const compareList = usePokemonStore((state) => state.compareList);
  const addToCompare = usePokemonStore((state) => state.addToCompare);
  const removeFromCompare = usePokemonStore((state) => state.removeFromCompare);

  const isFav = favorites.some((p) => p.name === name);
  const isCompared = compareList.some((p) => p.name === name);

  // Format ID to 4-digit Pokédex style
  const formatPokeId = (num: number) => {
    return `#${num.toString().padStart(4, '0')}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFav) {
      removeFavorite(name);
    } else {
      addFavorite(pokemon);
      
      // Fun visual reward: Pokéball-colored confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFCB05', '#2A75BB', '#EF4444', '#FFFFFF'],
      });
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompared) {
      removeFromCompare(name);
    } else {
      const added = addToCompare(pokemon);
      if (!added) {
        // Trigger alert or state update
        alert('You can only compare up to 2 Pokémon at a time!');
      }
    }
  };

  // Capitalize name helper
  const capName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col glass-morphism card-radius p-5 border border-white/5 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 w-full overflow-hidden h-[340px]"
    >
      {/* Absolute top action items */}
      <div className="flex justify-between items-center z-10 w-full">
        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-300">
          {formatPokeId(id)}
        </span>
        <div className="flex gap-2">
          {/* Compare Toggle */}
          <button
            onClick={handleCompareClick}
            aria-label="Compare Pokemon"
            className={`p-2 rounded-full transition-all duration-200 border ${
              isCompared
                ? 'bg-blue-500/10 border-blue-500/40 text-[#2A75BB]'
                : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {isCompared ? <ShieldCheck className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Favorite Pokemon"
            className={`p-2 rounded-full transition-all duration-200 border ${
              isFav
                ? 'bg-red-500/10 border-red-500/40 text-red-500'
                : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-red-400 hover:bg-slate-800/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main navigation wrap */}
      <Link to={`/pokemon/${name}`} className="flex flex-col items-center flex-1 mt-4">
        {/* Animated Image Container */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full bg-slate-800/20 group-hover:scale-110 transition-transform duration-500" />
          
          <img
            src={image}
            alt={capName}
            className="w-28 h-28 object-contain z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_8px_24px_rgba(255,203,5,0.25)]"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100 group-hover:text-[#FFCB05] transition-colors duration-200">
          {capName}
        </h3>

        {/* Types */}
        <div className="flex gap-2 mt-3 justify-center">
          {types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </Link>
    </motion.div>
  );
};
export default PokemonCard;
