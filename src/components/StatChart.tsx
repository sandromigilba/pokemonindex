import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Radio } from 'lucide-react';
import type { PokemonDetail } from '../utils/api';

interface StatChartProps {
  pokemonList: PokemonDetail[]; // Supports 1 or 2 Pokemon
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'Sp. ATK',
  'special-defense': 'Sp. DEF',
  speed: 'SPD',
};

const STAT_COLORS = [
  { fill: 'rgba(255, 203, 5, 0.35)', stroke: '#FFCB05', text: 'text-[#FFCB05]', nameColor: 'bg-[#FFCB05]' }, // Yellow
  { fill: 'rgba(42, 117, 187, 0.35)', stroke: '#2A75BB', text: 'text-[#2A75BB]', nameColor: 'bg-[#2A75BB]' },  // Blue
];

export const StatChart: React.FC<StatChartProps> = ({ pokemonList }) => {
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');

  // Stats definition mapping
  const statsKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  const MAX_STAT = 200; // Cap for scaling visuals

  // Radar Chart Configurations
  const cx = 150;
  const cy = 150;
  const r = 100;

  // Compute angles for 6 vertices (HP, ATK, DEF, SpA, SpD, SPD)
  const getCoordinates = (statIndex: number, value: number) => {
    const angle = (statIndex * 2 * Math.PI) / 6 - Math.PI / 2; // Offset by -90 deg to put HP on top
    const scale = Math.min(value / MAX_STAT, 1);
    const x = cx + r * scale * Math.cos(angle);
    const y = cy + r * scale * Math.sin(angle);
    return { x, y };
  };

  // Concentric hexagon grid points
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const gridPointsStr = gridLevels.map((level) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      const x = cx + r * level * Math.cos(angle);
      const y = cy + r * level * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  });

  // Render Radar Chart
  const renderRadar = () => {
    return (
      <div className="relative w-full max-w-[320px] mx-auto aspect-square">
        <svg viewBox="0 0 300 300" className="w-full h-full text-slate-400">
          {/* Radial Grid Lines (Hexagons) */}
          {gridPointsStr.map((points, index) => (
            <polygon
              key={index}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="stroke-slate-700/60 dark:stroke-slate-800"
            />
          ))}

          {/* Axis Spoke Lines */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="stroke-slate-700/60 dark:stroke-slate-800"
              />
            );
          })}

          {/* Labels */}
          {statsKeys.map((key, i) => {
            const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
            const labelDist = r + 18;
            const x = cx + labelDist * Math.cos(angle);
            const y = cy + labelDist * Math.sin(angle);
            
            // Adjust anchor based on horizontal position
            let textAnchor: 'inherit' | 'end' | 'middle' | 'start' = 'middle';
            if (Math.cos(angle) > 0.1) textAnchor = 'start';
            if (Math.cos(angle) < -0.1) textAnchor = 'end';

            return (
              <text
                key={key}
                x={x}
                y={y + 4}
                textAnchor={textAnchor}
                fontSize="10px"
                fontWeight="700"
                className="fill-slate-500 dark:fill-slate-400 font-mono"
              >
                {STAT_LABELS[key]}
              </text>
            );
          })}

          {/* Stats Polygons (rendered in reverse order to overlay properly) */}
          {pokemonList.map((pokemon, pIdx) => {
            const points: string[] = [];
            statsKeys.forEach((key, sIdx) => {
              const baseStat = pokemon.stats.find((s) => s.name === key)?.value || 0;
              const coords = getCoordinates(sIdx, baseStat);
              points.push(`${coords.x},${coords.y}`);
            });
            const pointsStr = points.join(' ');
            const colors = STAT_COLORS[pIdx] || STAT_COLORS[0];

            return (
              <motion.polygon
                key={pokemon.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: pIdx * 0.1 }}
                points={pointsStr}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2.5"
                style={{ transformOrigin: '150px 150px' }}
              />
            );
          })}

          {/* Central Origin Dot */}
          <circle cx={cx} cy={cy} r="3" fill="#64748B" />
        </svg>
      </div>
    );
  };

  // Render Bar Chart
  const renderBar = () => {
    return (
      <div className="space-y-4 w-full">
        {statsKeys.map((key) => {
          return (
            <div key={key} className="flex flex-col gap-1 w-full">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider">
                {STAT_LABELS[key]}
              </span>
              
              <div className="flex flex-col gap-2 bg-slate-950/20 dark:bg-slate-950/40 p-2 rounded-xl border border-white/5 w-full">
                {pokemonList.map((pokemon, pIdx) => {
                  const statValue = pokemon.stats.find((s) => s.name === key)?.value || 0;
                  const pct = Math.min((statValue / MAX_STAT) * 100, 100);
                  const colors = STAT_COLORS[pIdx] || STAT_COLORS[0];

                  return (
                    <div key={pokemon.id} className="flex items-center gap-3">
                      {pokemonList.length > 1 && (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${colors.nameColor}`}
                          title={pokemon.name}
                        />
                      )}
                      <div className="flex-1 bg-slate-800/40 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors.stroke }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300 w-8 text-right">
                        {statValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Chart controls */}
      <div className="flex justify-between items-center w-full">
        <h4 className="text-sm font-bold tracking-widest text-slate-400 font-mono uppercase">
          Base Stats
        </h4>
        
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setChartType('radar')}
            className={`p-1.5 rounded-lg transition-all clickable ${
              chartType === 'radar' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg transition-all clickable ${
              chartType === 'bar' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rendering target */}
      <div className="w-full flex items-center justify-center min-h-[300px]">
        {chartType === 'radar' ? renderRadar() : renderBar()}
      </div>

      {/* Legend for comparisons */}
      {pokemonList.length > 1 && (
        <div className="flex gap-4 justify-center flex-wrap">
          {pokemonList.map((pokemon, pIdx) => {
            const colors = STAT_COLORS[pIdx] || STAT_COLORS[0];
            return (
              <div key={pokemon.id} className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-md ${colors.nameColor}`} />
                <span className="text-xs font-semibold font-display capitalize text-slate-300">
                  {pokemon.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default StatChart;
