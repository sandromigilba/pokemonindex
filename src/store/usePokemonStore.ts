import { create } from 'zustand';
import type { PokemonDetail } from '../utils/api';

interface PokemonStore {
  // Favorites State
  favorites: PokemonDetail[];
  addFavorite: (pokemon: PokemonDetail) => void;
  removeFavorite: (pokemonName: string) => void;
  isFavorite: (pokemonName: string) => boolean;
  clearFavorites: () => void;

  // Compare State (Max 2 Pokemon)
  compareList: PokemonDetail[];
  addToCompare: (pokemon: PokemonDetail) => boolean; // Returns true if successful, false if full
  removeFromCompare: (pokemonName: string) => void;
  isInCompare: (pokemonName: string) => boolean;
  clearCompare: () => void;

  // Custom Cursor
  customCursor: boolean;
  toggleCustomCursor: () => void;
}

// Helper to load favorites from localStorage
const getInitialFavorites = (): PokemonDetail[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('poke-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse favorites from localStorage', e);
      return [];
    }
  }
  return [];
};

export const usePokemonStore = create<PokemonStore>((set, get) => ({
  // Favorites state
  favorites: getInitialFavorites(),
  addFavorite: (pokemon) => {
    const current = get().favorites;
    if (current.some((p) => p.name === pokemon.name)) return;
    
    const updated = [...current, pokemon];
    localStorage.setItem('poke-favorites', JSON.stringify(updated));
    set({ favorites: updated });
  },
  removeFavorite: (pokemonName) => {
    const current = get().favorites;
    const updated = current.filter((p) => p.name !== pokemonName);
    localStorage.setItem('poke-favorites', JSON.stringify(updated));
    set({ favorites: updated });
  },
  isFavorite: (pokemonName) => {
    return get().favorites.some((p) => p.name === pokemonName);
  },
  clearFavorites: () => {
    localStorage.removeItem('poke-favorites');
    set({ favorites: [] });
  },

  // Compare state
  compareList: [],
  addToCompare: (pokemon) => {
    const current = get().compareList;
    if (current.some((p) => p.name === pokemon.name)) return false;
    if (current.length >= 2) return false;
    
    set({ compareList: [...current, pokemon] });
    return true;
  },
  removeFromCompare: (pokemonName) => {
    set({ compareList: get().compareList.filter((p) => p.name !== pokemonName) });
  },
  isInCompare: (pokemonName) => {
    return get().compareList.some((p) => p.name === pokemonName);
  },
  clearCompare: () => {
    set({ compareList: [] });
  },

  // Custom Cursor
  customCursor: true,
  toggleCustomCursor: () => {
    set((state) => ({ customCursor: !state.customCursor }));
  },
}));
