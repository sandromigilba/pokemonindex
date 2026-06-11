import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Shimmer: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-800/60 dark:bg-slate-800/40 rounded-xl ${className}`} />
);

export const PokemonCardSkeleton: React.FC = () => {
  return (
    <div className="glass-morphism card-radius p-5 flex flex-col items-center border border-white/5 relative overflow-hidden h-72">
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/40 animate-pulse" />
      <div className="w-32 h-32 rounded-full bg-slate-800/40 animate-pulse mb-6 mt-4" />
      <div className="w-16 h-4 bg-slate-800/40 animate-pulse rounded-md mb-2" />
      <div className="w-28 h-6 bg-slate-800/40 animate-pulse rounded-md mb-3" />
      <div className="flex gap-2">
        <div className="w-16 h-6 bg-slate-800/40 animate-pulse rounded-full" />
        <div className="w-16 h-6 bg-slate-800/40 animate-pulse rounded-full" />
      </div>
    </div>
  );
};

export const PokemonDetailSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 py-8">
      {/* Visual Section */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-morphism card-radius p-8 flex flex-col items-center border border-white/5 relative overflow-hidden h-[450px]">
          <div className="w-16 h-6 bg-slate-800/40 animate-pulse rounded-md mb-4" />
          <div className="w-48 h-8 bg-slate-800/40 animate-pulse rounded-md mb-8" />
          <div className="w-64 h-64 bg-slate-800/40 animate-pulse rounded-full mb-6" />
        </div>
      </div>
      
      {/* Data Section */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-morphism card-radius p-8 border border-white/5 h-[450px]">
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-10 bg-slate-800/40 animate-pulse rounded-full" />
            <div className="w-24 h-10 bg-slate-800/40 animate-pulse rounded-full" />
            <div className="w-24 h-10 bg-slate-800/40 animate-pulse rounded-full" />
          </div>
          <div className="space-y-4">
            <div className="w-full h-8 bg-slate-800/40 animate-pulse rounded-md" />
            <div className="w-full h-8 bg-slate-800/40 animate-pulse rounded-md" />
            <div className="w-full h-8 bg-slate-800/40 animate-pulse rounded-md" />
            <div className="w-full h-8 bg-slate-800/40 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TCGCardSkeleton: React.FC = () => {
  return (
    <div className="relative aspect-[3/4] rounded-[20px] bg-slate-800/40 animate-pulse border border-white/5 overflow-hidden">
      <div className="absolute inset-x-4 bottom-4 h-12 bg-slate-700/40 rounded-xl" />
    </div>
  );
};

export const LoadingGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
};
