import React from 'react';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
}

export const typeColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  normal: {
    bg: 'bg-stone-500/10 dark:bg-stone-500/20',
    text: 'text-stone-600 dark:text-stone-300',
    border: 'border-stone-400/20 dark:border-stone-500/30',
    glow: 'shadow-stone-500/10',
  },
  fire: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-400/20 dark:border-red-500/30',
    glow: 'shadow-red-500/10',
  },
  water: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-400/20 dark:border-blue-500/30',
    glow: 'shadow-blue-500/10',
  },
  grass: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-400/20 dark:border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
  },
  electric: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-400/20 dark:border-yellow-500/30',
    glow: 'shadow-yellow-500/10',
  },
  ice: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-400/20 dark:border-cyan-500/30',
    glow: 'shadow-cyan-500/10',
  },
  fighting: {
    bg: 'bg-orange-600/10 dark:bg-orange-600/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20 dark:border-orange-600/30',
    glow: 'shadow-orange-600/10',
  },
  poison: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-400/20 dark:border-purple-500/30',
    glow: 'shadow-purple-500/10',
  },
  ground: {
    bg: 'bg-amber-600/10 dark:bg-amber-600/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 dark:border-amber-600/30',
    glow: 'shadow-amber-600/10',
  },
  flying: {
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-400/20 dark:border-sky-500/30',
    glow: 'shadow-sky-500/10',
  },
  psychic: {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-400/20 dark:border-pink-500/30',
    glow: 'shadow-pink-500/10',
  },
  bug: {
    bg: 'bg-lime-500/10 dark:bg-lime-500/20',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-400/20 dark:border-lime-500/30',
    glow: 'shadow-lime-500/10',
  },
  rock: {
    bg: 'bg-yellow-700/10 dark:bg-yellow-700/20',
    text: 'text-yellow-700 dark:text-yellow-500',
    border: 'border-yellow-600/20 dark:border-yellow-700/30',
    glow: 'shadow-yellow-700/10',
  },
  ghost: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-400/20 dark:border-indigo-500/30',
    glow: 'shadow-indigo-500/10',
  },
  dragon: {
    bg: 'bg-violet-600/10 dark:bg-violet-600/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20 dark:border-violet-600/30',
    glow: 'shadow-violet-600/10',
  },
  steel: {
    bg: 'bg-slate-400/10 dark:bg-slate-400/20',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-300/20 dark:border-slate-400/30',
    glow: 'shadow-slate-400/10',
  },
  fairy: {
    bg: 'bg-fuchsia-400/10 dark:bg-fuchsia-400/20',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    border: 'border-fuchsia-300/20 dark:border-fuchsia-400/30',
    glow: 'shadow-fuchsia-400/10',
  },
  dark: {
    bg: 'bg-zinc-800/10 dark:bg-zinc-800/20',
    text: 'text-zinc-600 dark:text-zinc-300',
    border: 'border-zinc-500/20 dark:border-zinc-800/30',
    glow: 'shadow-zinc-800/10',
  },
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  size = 'md',
  clickable = false,
  onClick,
}) => {
  const normType = type.toLowerCase();
  const themeColors = typeColors[normType] || typeColors.normal;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 border',
    md: 'text-xs px-3.5 py-1 border',
    lg: 'text-sm px-5 py-1.5 border-[1.5px]',
  };

  const Component = clickable ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-semibold tracking-wide capitalize
        rounded-full transition-all duration-200 border-solid
        ${themeColors.bg} ${themeColors.text} ${themeColors.border} ${themeColors.glow}
        ${sizeClasses[size]}
        ${clickable ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm hover:shadow-md' : ''}
      `}
      type={clickable ? 'button' : undefined}
    >
      {type}
    </Component>
  );
};
export default TypeBadge;
