import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import { fetchEvolutionChain } from '../utils/api';
import { Shimmer } from './LoadingSkeleton';

interface EvolutionChainProps {
  url: string;
  currentPokemonName: string;
}

export const EvolutionChain: React.FC<EvolutionChainProps> = ({ url, currentPokemonName }) => {
  const {
    data: chain,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['evolution-chain', url],
    queryFn: () => fetchEvolutionChain(url),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center gap-6 py-6 overflow-x-auto">
        <Shimmer className="w-20 h-20 rounded-full" />
        <Shimmer className="w-12 h-4" />
        <Shimmer className="w-20 h-20 rounded-full" />
        <Shimmer className="w-12 h-4" />
        <Shimmer className="w-20 h-20 rounded-full" />
      </div>
    );
  }

  if (isError || !chain || chain.length <= 1) {
    return (
      <div className="text-center text-sm font-semibold text-slate-500 py-6">
        No evolution chain found or this Pokémon does not evolve.
      </div>
    );
  }

  return (
    <div className="w-full py-6 overflow-x-auto">
      <div className="flex items-center justify-center gap-4 md:gap-8 min-w-max px-4">
        {chain.map((node, index) => {
          const isActive = node.name === currentPokemonName;
          const capName = node.name.charAt(0).toUpperCase() + node.name.slice(1);

          return (
            <React.Fragment key={node.id}>
              {/* Evolution Step Arrow (only render between nodes) */}
              {index > 0 && (
                <div className="flex flex-col items-center justify-center min-w-[60px]">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center gap-1 text-slate-500"
                  >
                    {/* Evolution criteria details */}
                    {node.trigger === 'level-up' && node.minLevel && (
                      <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-800/40 py-0.5 px-2 rounded-full border border-white/5">
                        Lv.{node.minLevel}
                      </span>
                    )}
                    {node.trigger === 'use-item' && node.item && (
                      <span className="text-[9px] font-bold font-mono text-amber-400 bg-amber-500/10 py-0.5 px-2 rounded-full border border-amber-500/20 max-w-[80px] truncate capitalize" title={node.item.replace('-', ' ')}>
                        {node.item.replace('-', ' ')}
                      </span>
                    )}
                    {node.trigger === 'trade' && (
                      <span className="text-[10px] font-bold font-mono text-cyan-400 bg-cyan-500/10 py-0.5 px-2 rounded-full border border-cyan-500/20">
                        Trade
                      </span>
                    )}
                    {!node.minLevel && !node.item && node.trigger !== 'trade' && (
                      <Zap className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500 animate-pulse" />
                    )}

                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-slate-500/70" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Pokémon Form Node */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: index * 0.1 }}
                className="relative flex flex-col items-center"
              >
                <Link
                  to={`/pokemon/${node.name}`}
                  className={`
                    flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 clickable
                    ${
                      isActive
                        ? 'bg-[#FFCB05]/10 border-[#FFCB05] shadow-[0_0_15px_rgba(255,203,5,0.15)]'
                        : 'bg-slate-800/20 border-white/5 hover:border-slate-700 hover:bg-slate-800/50'
                    }
                  `}
                >
                  {/* Sprite image */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <img
                      src={node.image}
                      alt={capName}
                      className="w-14 h-14 md:w-16 md:h-16 object-contain z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                      onError={(e) => {
                        // Fallback image if high res fails
                        e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${node.id}.png`;
                      }}
                      loading="lazy"
                    />
                  </div>

                  <span
                    className={`
                      text-xs font-bold font-display mt-2 capitalize
                      ${isActive ? 'text-[#FFCB05]' : 'text-slate-400 group-hover:text-slate-200'}
                    `}
                  >
                    {node.name}
                  </span>
                </Link>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default EvolutionChain;
