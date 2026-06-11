import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink, DollarSign } from 'lucide-react';
import type { TCGCard } from '../utils/api';

interface PokemonCardItemProps {
  card: TCGCard;
}

export const PokemonCardItem: React.FC<PokemonCardItemProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);

  // 3D Hover Tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return; // Disable tilt on flipped side for usability
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Rotate multipliers
    const rx = ((y - yc) / yc) * -12; // vertical angle (max 12 deg)
    const ry = ((x - xc) / xc) * 12;  // horizontal angle (max 12 deg)
    
    element.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;

    // Shift holographic foil gradient position
    const foil = element.querySelector('.holo-foil') as HTMLDivElement;
    if (foil) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      foil.style.backgroundPosition = `${px}% ${py}%`;
      foil.style.opacity = '0.65';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    element.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const foil = element.querySelector('.holo-foil') as HTMLDivElement;
    if (foil) {
      foil.style.opacity = '0';
    }
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const toggleZoom = () => {
    setZoomActive(!zoomActive);
  };

  const price = card.cardmarket?.prices?.trendPrice || card.cardmarket?.prices?.averageSellPrice;

  return (
    <>
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Card 3D container */}
        <div className="card-container-3d relative w-full aspect-[2.5/3.5] max-w-[280px]">
          {/* Main card model */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={toggleZoom}
            className={`
              w-full h-full pokemon-card-3d relative cursor-pointer
              transition-all duration-300 ease-out preserve-3d
              ${isFlipped ? 'rotate-y-180' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Card Face */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden rounded-[20px] overflow-hidden border border-white/10 shadow-lg"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Holographic foil overlay */}
              <div className="holo-foil" />
              
              {/* Card Image */}
              <img
                src={card.images.small}
                alt={card.name}
                className="w-full h-full object-cover rounded-[20px]"
                loading="lazy"
              />
            </div>

            {/* Back Card Face */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden rounded-[20px] overflow-hidden border border-[#FFCB05]/20 shadow-lg bg-[#0A192F]"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Premium Pokémon Theme card back */}
              <div className="w-full h-full p-6 flex flex-col items-center justify-between border-4 border-[#FFCB05] rounded-[20px]">
                <div className="text-[10px] font-mono tracking-widest text-[#FFCB05] uppercase">
                  Pokémon TCG
                </div>

                {/* Rotating central Pokéball structure */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#2A75BB]/10 border-2 border-dashed border-[#2A75BB]/40 animate-spin" style={{ animationDuration: '10s' }} />
                  <svg className="w-20 h-20 text-[#EF4444]" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#FFCB05" strokeWidth="1" />
                    <path d="M 2.1 12 C 2.5 16.5 6 20.5 10.5 21.6" stroke="#2A75BB" strokeWidth="1" fill="none" />
                    <circle cx="12" cy="12" r="3" fill="#0A192F" stroke="#FFCB05" strokeWidth="1" />
                    <circle cx="12" cy="12" r="1" fill="#FFCB05" />
                    <path d="M 2 12 H 9 M 15 12 H 22" stroke="#FFCB05" strokeWidth="1" />
                  </svg>
                </div>

                <div className="text-center font-display">
                  <div className="text-sm font-bold text-slate-100 uppercase">{card.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{card.set.name}</div>
                  <div className="text-[9px] text-[#FFCB05] mt-1">{card.rarity || 'Common'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="w-full max-w-[280px] px-3 py-2 rounded-2xl glass-morphism border border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">MARKET PRICE</span>
            <span className="text-sm font-bold text-[#FFCB05] flex items-center font-mono">
              <DollarSign className="w-3.5 h-3.5 inline text-emerald-400 mr-0.5" />
              {price ? price.toFixed(2) : 'N/A'}
            </span>
          </div>

          <div className="flex gap-2">
            {/* Flip control */}
            <button
              onClick={toggleFlip}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-[#FFCB05] transition-all border border-white/5 clickable"
              title="Flip Card"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* External marketplace redirect */}
            {card.cardmarket?.url && (
              <a
                href={card.cardmarket.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-blue-400 transition-all border border-white/5 clickable"
                title="View on Cardmarket"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Zoom Modal */}
      <AnimatePresence>
        {zoomActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleZoom}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-9999 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="relative max-w-full max-h-[75vh] aspect-[2.5/3.5] w-[380px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={card.images.large}
                alt={card.name}
                className="w-full h-full object-contain rounded-3xl"
              />
            </motion.div>
            <div className="mt-6 text-center">
              <h2 className="text-xl font-bold font-display text-white">{card.name}</h2>
              <p className="text-sm text-slate-400 mt-1 font-mono">
                {card.set.name} &bull; {card.rarity || 'Rarity Unknown'}
              </p>
              <button
                onClick={toggleZoom}
                className="mt-4 py-2 px-6 card-radius bg-[#FFCB05] hover:bg-[#FFD700] text-slate-900 font-semibold text-sm transition-all clickable"
              >
                Close View
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default PokemonCardItem;
