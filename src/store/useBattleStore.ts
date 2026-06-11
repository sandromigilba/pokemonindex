import { create } from 'zustand';

export interface GameSkill {
  name: string;
  power: number; // multiplier (e.g. 1.0, 1.3, 1.6)
  type: string;  // type matching element
}

export interface GamePokemon {
  id: number;
  name: string;
  level: number;
  exp: number;
  types: string[];
  image: string;
  sprite: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  currentHp: number; // for battles
  skills: GameSkill[];
}

export interface BattleItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  effect: 'heal_50' | 'heal_full' | 'revive' | 'attack_buff' | 'shield';
}

export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface SimulatedOpponent {
  name: string;
  avatar: string;
  rankPoints: number;
  ping: number;
}

export interface BattleStore {
  // Player Stats & Inventory
  coins: number;
  crystals: number;
  arenaPoints: number;
  rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  roster: GamePokemon[];
  activeTeamIds: number[]; // Pokémon IDs in active team (max 3)
  inventory: BattleItem[];
  quests: DailyQuest[];

  // Active Combat State
  battleStatus: 'idle' | 'matchmaking' | 'battle' | 'victory' | 'defeat';
  opponentProfile: SimulatedOpponent | null;
  playerCombatTeam: GamePokemon[]; // copies with current HP
  computerCombatTeam: GamePokemon[];
  playerActiveIndex: number;
  computerActiveIndex: number;
  activeTurn: 'player' | 'computer';
  battleLogs: string[];
  playerShieldActive: boolean;
  computerShieldActive: boolean;
  isAutoBattle: boolean;
  timeRemaining: number;

  // Actions
  addCoins: (amount: number) => void;
  addCrystals: (amount: number) => void;
  setActiveTeam: (ids: number[]) => void;
  buyItem: (itemId: string) => boolean;
  useItemInBattle: (itemId: string, targetSide: 'player' | 'computer') => boolean;
  levelUpPokemon: (pokemonId: number) => boolean;
  evolvePokemon: (pokemonId: number) => boolean;
  claimQuest: (questId: string) => void;
  summonPokemon: (pokemon: GamePokemon) => void;

  // Battle loop actions
  startMatchmaking: (mode: 'ranked' | 'casual' | 'challenge') => void;
  cancelMatchmaking: () => void;
  executePlayerTurn: (skillIndex: number) => void;
  executeComputerTurn: () => void;
  toggleAutoBattle: () => void;
  tickTurnTimer: () => void;
  runAutoTurn: () => void;
  endBattle: (winner: 'player' | 'computer') => void;
  resetBattle: () => void;
  refreshQuests: () => void;
}

// Initial default roster
const INITIAL_ROSTER: GamePokemon[] = [
  {
    id: 25,
    name: 'Pikachu',
    level: 1,
    exp: 0,
    types: ['electric'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    rarity: 'Common',
    baseStats: { hp: 120, attack: 50, defense: 30, speed: 90 },
    currentHp: 120,
    skills: [
      { name: 'Quick Attack', power: 1.0, type: 'normal' },
      { name: 'Thunder Shock', power: 1.3, type: 'electric' },
      { name: 'Thunderbolt', power: 1.8, type: 'electric' },
    ],
  },
  {
    id: 1,
    name: 'Bulbasaur',
    level: 1,
    exp: 0,
    types: ['grass', 'poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    rarity: 'Common',
    baseStats: { hp: 130, attack: 45, defense: 45, speed: 45 },
    currentHp: 130,
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Vine Whip', power: 1.3, type: 'grass' },
      { name: 'Razor Leaf', power: 1.7, type: 'grass' },
    ],
  },
  {
    id: 4,
    name: 'Charmander',
    level: 1,
    exp: 0,
    types: ['fire'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    rarity: 'Common',
    baseStats: { hp: 110, attack: 52, defense: 35, speed: 65 },
    currentHp: 110,
    skills: [
      { name: 'Scratch', power: 1.0, type: 'normal' },
      { name: 'Ember', power: 1.3, type: 'fire' },
      { name: 'Flame Burst', power: 1.7, type: 'fire' },
    ],
  },
  {
    id: 7,
    name: 'Squirtle',
    level: 1,
    exp: 0,
    types: ['water'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    rarity: 'Common',
    baseStats: { hp: 125, attack: 48, defense: 50, speed: 43 },
    currentHp: 125,
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Water Gun', power: 1.3, type: 'water' },
      { name: 'Water Pulse', power: 1.7, type: 'water' },
    ],
  },
];

// Initial shop items
const INITIAL_SHOP_ITEMS: BattleItem[] = [
  { id: 'pot_50', name: 'Potion', description: 'Restores 50 HP to active Pokémon', price: 100, quantity: 2, effect: 'heal_50' },
  { id: 'pot_full', name: 'Hyper Potion', description: 'Restores full HP to active Pokémon', price: 350, quantity: 0, effect: 'heal_full' },
  { id: 'revive', name: 'Revive', description: 'Revives a fainted Pokémon to 50% HP', price: 500, quantity: 0, effect: 'revive' },
  { id: 'shield_card', name: 'Energy Barrier', description: 'Blocks the next incoming attack', price: 250, quantity: 1, effect: 'shield' },
];

// Initial Daily Quests
const INITIAL_QUESTS: DailyQuest[] = [
  { id: 'q1', description: 'Win 2 Ranked Battles', target: 2, current: 0, rewardCoins: 200, completed: false, claimed: false },
  { id: 'q2', description: 'Deals 600 total damage in battles', target: 600, current: 0, rewardCoins: 150, completed: false, claimed: false },
  { id: 'q3', description: 'Level up any Pokémon once', target: 1, current: 0, rewardCoins: 100, completed: false, claimed: false },
];

// Simple type relation multiplier (attacker vs defender)
const getTypeMultiplier = (attackerType: string, defenderTypes: string[]): number => {
  const chart: { [key: string]: { strong: string[]; weak: string[] } } = {
    fire: { strong: ['grass', 'steel', 'ice', 'bug'], weak: ['water', 'ground', 'rock'] },
    water: { strong: ['fire', 'ground', 'rock'], weak: ['electric', 'grass'] },
    grass: { strong: ['water', 'ground', 'rock'], weak: ['fire', 'poison', 'flying', 'bug'] },
    electric: { strong: ['water', 'flying'], weak: ['ground'] },
    ground: { strong: ['fire', 'electric', 'poison', 'rock', 'steel'], weak: ['water', 'grass', 'ice'] },
    normal: { strong: [], weak: [] },
  };

  let multiplier = 1.0;

  defenderTypes.forEach((defType) => {
    const relations = chart[attackerType.toLowerCase()];
    if (relations) {
      if (relations.strong.includes(defType.toLowerCase())) {
        multiplier *= 1.5; // Super effective
      } else if (relations.weak.includes(defType.toLowerCase())) {
        multiplier *= 0.7; // Not very effective
      }
    }
  });

  return multiplier;
};

// Rarity modifiers
export const getRarityBonus = (rarity: GamePokemon['rarity']): number => {
  switch (rarity) {
    case 'Rare': return 1.2;
    case 'Epic': return 1.5;
    case 'Legendary': return 2.0;
    default: return 1.0; // Common
  }
};

// Evolution chain data helper
export const EVOLUTION_CHAINS: { [key: string]: { next: string; id: number; level: number } } = {
  charmander: { next: 'charmeleon', id: 5, level: 5 },
  charmeleon: { next: 'charizard', id: 6, level: 10 },
  bulbasaur: { next: 'ivysaur', id: 2, level: 5 },
  ivysaur: { next: 'venusaur', id: 3, level: 10 },
  squirtle: { next: 'wartortle', id: 8, level: 5 },
  wartortle: { next: 'blastoise', id: 9, level: 10 },
  pikachu: { next: 'raichu', id: 26, level: 7 },
};

// Fetch mock opponent profiles
const MOCK_OPPONENTS: SimulatedOpponent[] = [
  { name: 'Red Trainer', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/1.png', rankPoints: 1200, ping: 35 },
  { name: 'Blue Champion', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/2.png', rankPoints: 1800, ping: 48 },
  { name: 'Leaf Ranger', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/3.png', rankPoints: 1050, ping: 22 },
  { name: 'Cynthia Elite', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/4.png', rankPoints: 2400, ping: 62 },
  { name: 'Brock Gym', avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/5.png', rankPoints: 950, ping: 15 },
];

// Play Pokemon Cry Sound Effect helper
export const playPokemonCry = (id: number) => {
  if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
    const audio = new Audio(cryUrl);
    audio.play().catch(() => {
      // Fallback legacy URL
      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${id}.ogg`;
      const fallbackAudio = new Audio(fallbackUrl);
      fallbackAudio.play().catch(() => console.log(`Audio cry failed to play for pokemon #${id}`));
    });
  }
};

// Combatant opponent templates database (Rarities: Common, Rare, Epic, Legendary)
export const COMBATANT_TEMPLATES: Omit<GamePokemon, 'currentHp'>[] = [
  // Common
  {
    id: 25,
    name: 'Pikachu',
    level: 1,
    exp: 0,
    types: ['electric'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    rarity: 'Common',
    baseStats: { hp: 120, attack: 50, defense: 30, speed: 90 },
    skills: [
      { name: 'Quick Attack', power: 1.0, type: 'normal' },
      { name: 'Thunder Shock', power: 1.3, type: 'electric' },
      { name: 'Thunderbolt', power: 1.8, type: 'electric' },
    ],
  },
  {
    id: 1,
    name: 'Bulbasaur',
    level: 1,
    exp: 0,
    types: ['grass', 'poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    rarity: 'Common',
    baseStats: { hp: 130, attack: 45, defense: 45, speed: 45 },
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Vine Whip', power: 1.3, type: 'grass' },
      { name: 'Razor Leaf', power: 1.7, type: 'grass' },
    ],
  },
  {
    id: 4,
    name: 'Charmander',
    level: 1,
    exp: 0,
    types: ['fire'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    rarity: 'Common',
    baseStats: { hp: 110, attack: 52, defense: 35, speed: 65 },
    skills: [
      { name: 'Scratch', power: 1.0, type: 'normal' },
      { name: 'Ember', power: 1.3, type: 'fire' },
      { name: 'Flame Burst', power: 1.7, type: 'fire' },
    ],
  },
  {
    id: 7,
    name: 'Squirtle',
    level: 1,
    exp: 0,
    types: ['water'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    rarity: 'Common',
    baseStats: { hp: 125, attack: 48, defense: 50, speed: 43 },
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Water Gun', power: 1.3, type: 'water' },
      { name: 'Water Pulse', power: 1.7, type: 'water' },
    ],
  },
  {
    id: 58,
    name: 'Growlithe',
    level: 1,
    exp: 0,
    types: ['fire'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png',
    rarity: 'Common',
    baseStats: { hp: 120, attack: 48, defense: 35, speed: 60 },
    skills: [
      { name: 'Bite', power: 1.0, type: 'normal' },
      { name: 'Flame Wheel', power: 1.4, type: 'fire' },
    ],
  },
  {
    id: 10,
    name: 'Caterpie',
    level: 1,
    exp: 0,
    types: ['bug'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png',
    rarity: 'Common',
    baseStats: { hp: 105, attack: 35, defense: 30, speed: 45 },
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Bug Bite', power: 1.4, type: 'bug' },
    ],
  },
  {
    id: 19,
    name: 'Rattata',
    level: 1,
    exp: 0,
    types: ['normal'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png',
    rarity: 'Common',
    baseStats: { hp: 100, attack: 56, defense: 35, speed: 72 },
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Quick Attack', power: 1.2, type: 'normal' },
      { name: 'Hyper Fang', power: 1.6, type: 'normal' },
    ],
  },
  {
    id: 16,
    name: 'Pidgey',
    level: 1,
    exp: 0,
    types: ['normal', 'flying'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png',
    rarity: 'Common',
    baseStats: { hp: 115, attack: 45, defense: 40, speed: 56 },
    skills: [
      { name: 'Tackle', power: 1.0, type: 'normal' },
      { name: 'Gust', power: 1.3, type: 'flying' },
    ],
  },

  // Rare
  {
    id: 26,
    name: 'Raichu',
    level: 1,
    exp: 0,
    types: ['electric'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png',
    rarity: 'Rare',
    baseStats: { hp: 140, attack: 68, defense: 40, speed: 100 },
    skills: [
      { name: 'Spark', power: 1.3, type: 'electric' },
      { name: 'Thunder Punch', power: 1.6, type: 'electric' },
      { name: 'Thunder', power: 2.1, type: 'electric' },
    ],
  },
  {
    id: 2,
    name: 'Ivysaur',
    level: 1,
    exp: 0,
    types: ['grass', 'poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
    rarity: 'Rare',
    baseStats: { hp: 150, attack: 60, defense: 55, speed: 60 },
    skills: [
      { name: 'Razor Leaf', power: 1.4, type: 'grass' },
      { name: 'Seed Bomb', power: 1.7, type: 'grass' },
    ],
  },
  {
    id: 5,
    name: 'Charmeleon',
    level: 1,
    exp: 0,
    types: ['fire'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png',
    rarity: 'Rare',
    baseStats: { hp: 138, attack: 64, defense: 45, speed: 80 },
    skills: [
      { name: 'Fire Fang', power: 1.4, type: 'fire' },
      { name: 'Flamethrower', power: 1.8, type: 'fire' },
    ],
  },
  {
    id: 8,
    name: 'Wartortle',
    level: 1,
    exp: 0,
    types: ['water'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png',
    rarity: 'Rare',
    baseStats: { hp: 145, attack: 58, defense: 65, speed: 58 },
    skills: [
      { name: 'Water Pulse', power: 1.4, type: 'water' },
      { name: 'Aqua Tail', power: 1.8, type: 'water' },
    ],
  },
  {
    id: 64,
    name: 'Kadabra',
    level: 1,
    exp: 0,
    types: ['psychic'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png',
    rarity: 'Rare',
    baseStats: { hp: 115, attack: 65, defense: 25, speed: 105 },
    skills: [
      { name: 'Confusion', power: 1.2, type: 'psychic' },
      { name: 'Psybeam', power: 1.5, type: 'psychic' },
    ],
  },
  {
    id: 22,
    name: 'Fearow',
    level: 1,
    exp: 0,
    types: ['normal', 'flying'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png',
    rarity: 'Rare',
    baseStats: { hp: 130, attack: 55, defense: 45, speed: 85 },
    skills: [
      { name: 'Peck', power: 1.1, type: 'flying' },
      { name: 'Aerial Ace', power: 1.4, type: 'flying' },
    ],
  },
  {
    id: 67,
    name: 'Machoke',
    level: 1,
    exp: 0,
    types: ['fighting'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/67.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png',
    rarity: 'Rare',
    baseStats: { hp: 150, attack: 70, defense: 50, speed: 50 },
    skills: [
      { name: 'Low Kick', power: 1.1, type: 'fighting' },
      { name: 'Submission', power: 1.5, type: 'fighting' },
    ],
  },
  {
    id: 93,
    name: 'Haunter',
    level: 1,
    exp: 0,
    types: ['ghost', 'poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png',
    rarity: 'Rare',
    baseStats: { hp: 120, attack: 65, defense: 30, speed: 95 },
    skills: [
      { name: 'Lick', power: 1.0, type: 'ghost' },
      { name: 'Shadow Punch', power: 1.4, type: 'ghost' },
    ],
  },

  // Epic
  {
    id: 3,
    name: 'Venusaur',
    level: 1,
    exp: 0,
    types: ['grass', 'poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
    rarity: 'Epic',
    baseStats: { hp: 170, attack: 82, defense: 83, speed: 80 },
    skills: [
      { name: 'Mega Drain', power: 1.4, type: 'grass' },
      { name: 'Solar Beam', power: 2.2, type: 'grass' },
    ],
  },
  {
    id: 6,
    name: 'Charizard',
    level: 1,
    exp: 0,
    types: ['fire', 'flying'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    rarity: 'Epic',
    baseStats: { hp: 168, attack: 84, defense: 78, speed: 100 },
    skills: [
      { name: 'Air Slash', power: 1.4, type: 'flying' },
      { name: 'Fire Blast', power: 2.2, type: 'fire' },
    ],
  },
  {
    id: 9,
    name: 'Blastoise',
    level: 1,
    exp: 0,
    types: ['water'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
    rarity: 'Epic',
    baseStats: { hp: 179, attack: 83, defense: 100, speed: 78 },
    skills: [
      { name: 'Bite', power: 1.4, type: 'normal' },
      { name: 'Hydro Pump', power: 2.2, type: 'water' },
    ],
  },
  {
    id: 94,
    name: 'Gengar',
    level: 1,
    exp: 0,
    types: ['ghost', 'poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    rarity: 'Epic',
    baseStats: { hp: 150, attack: 85, defense: 60, speed: 110 },
    skills: [
      { name: 'Shadow Ball', power: 2.0, type: 'ghost' },
      { name: 'Dark Pulse', power: 1.5, type: 'dark' },
    ],
  },
  {
    id: 143,
    name: 'Snorlax',
    level: 1,
    exp: 0,
    types: ['normal'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png',
    rarity: 'Epic',
    baseStats: { hp: 250, attack: 90, defense: 65, speed: 30 },
    skills: [
      { name: 'Body Slam', power: 1.4, type: 'normal' },
      { name: 'Giga Impact', power: 2.1, type: 'normal' },
    ],
  },

  // Legendary
  {
    id: 150,
    name: 'Mewtwo',
    level: 1,
    exp: 0,
    types: ['psychic'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    rarity: 'Legendary',
    baseStats: { hp: 200, attack: 110, defense: 90, speed: 130 },
    skills: [
      { name: 'Psychic Cut', power: 1.3, type: 'psychic' },
      { name: 'Psystrike', power: 2.1, type: 'psychic' },
    ],
  },
  {
    id: 249,
    name: 'Lugia',
    level: 1,
    exp: 0,
    types: ['psychic', 'flying'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png',
    rarity: 'Legendary',
    baseStats: { hp: 210, attack: 90, defense: 130, speed: 110 },
    skills: [
      { name: 'Aeroblast', power: 2.0, type: 'flying' },
      { name: 'Psychic', power: 1.6, type: 'psychic' },
    ],
  },
  {
    id: 384,
    name: 'Rayquaza',
    level: 1,
    exp: 0,
    types: ['dragon', 'flying'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png',
    rarity: 'Legendary',
    baseStats: { hp: 205, attack: 120, defense: 90, speed: 115 },
    skills: [
      { name: 'Dragon Claw', power: 1.4, type: 'dragon' },
      { name: 'Outrage', power: 2.2, type: 'dragon' },
    ],
  },
];

export const useBattleStore = create<BattleStore>((set, get) => {
  // Local storage cache loaders
  const loadStoredState = () => {
    if (typeof window !== 'undefined') {
      try {
        const coins = localStorage.getItem('battle-coins');
        const crystals = localStorage.getItem('battle-crystals');
        const points = localStorage.getItem('battle-ap');
        const roster = localStorage.getItem('battle-roster');
        const team = localStorage.getItem('battle-team');
        const inventory = localStorage.getItem('battle-inventory');
        const quests = localStorage.getItem('battle-quests');

        return {
          coins: coins ? parseInt(coins) : 500,
          crystals: crystals ? parseInt(crystals) : 10,
          arenaPoints: points ? parseInt(points) : 100,
          roster: roster ? JSON.parse(roster) : INITIAL_ROSTER,
          activeTeamIds: team ? JSON.parse(team) : [25, 1, 4],
          inventory: inventory ? JSON.parse(inventory) : INITIAL_SHOP_ITEMS,
          quests: quests ? JSON.parse(quests) : INITIAL_QUESTS,
        };
      } catch (e) {
        console.error('Failed loading battle state', e);
      }
    }
    return {
      coins: 500,
      crystals: 10,
      arenaPoints: 100,
      roster: INITIAL_ROSTER,
      activeTeamIds: [25, 1, 4],
      inventory: INITIAL_SHOP_ITEMS,
      quests: INITIAL_QUESTS,
    };
  };

  const stored = loadStoredState();

  // Helper to persist state fields
  const persist = (fields: Partial<BattleStore>) => {
    if (typeof window !== 'undefined') {
      if (fields.coins !== undefined) localStorage.setItem('battle-coins', fields.coins.toString());
      if (fields.crystals !== undefined) localStorage.setItem('battle-crystals', fields.crystals.toString());
      if (fields.arenaPoints !== undefined) localStorage.setItem('battle-ap', fields.arenaPoints.toString());
      if (fields.roster !== undefined) localStorage.setItem('battle-roster', JSON.stringify(fields.roster));
      if (fields.activeTeamIds !== undefined) localStorage.setItem('battle-team', JSON.stringify(fields.activeTeamIds));
      if (fields.inventory !== undefined) localStorage.setItem('battle-inventory', JSON.stringify(fields.inventory));
      if (fields.quests !== undefined) localStorage.setItem('battle-quests', JSON.stringify(fields.quests));
    }
  };

  const resolveRank = (points: number): BattleStore['rankTier'] => {
    if (points >= 2000) return 'Master';
    if (points >= 1500) return 'Diamond';
    if (points >= 1000) return 'Platinum';
    if (points >= 600) return 'Gold';
    if (points >= 300) return 'Silver';
    return 'Bronze';
  };

  return {
    ...stored,
    rankTier: resolveRank(stored.arenaPoints),

    // Active Combat State Initializers
    battleStatus: 'idle',
    opponentProfile: null,
    playerCombatTeam: [],
    computerCombatTeam: [],
    playerActiveIndex: 0,
    computerActiveIndex: 0,
    activeTurn: 'player',
    battleLogs: [],
    playerShieldActive: false,
    computerShieldActive: false,
    isAutoBattle: false,
    timeRemaining: 20,

    addCoins: (amount) => {
      const updated = get().coins + amount;
      persist({ coins: updated });
      set({ coins: updated });
    },

    addCrystals: (amount) => {
      const updated = get().crystals + amount;
      persist({ crystals: updated });
      set({ crystals: updated });
    },

    setActiveTeam: (ids) => {
      persist({ activeTeamIds: ids });
      set({ activeTeamIds: ids });
    },

    buyItem: (itemId) => {
      const state = get();
      const item = state.inventory.find((i) => i.id === itemId);
      if (!item || state.coins < item.price) return false;

      const updatedCoins = state.coins - item.price;
      const updatedInventory = state.inventory.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      );

      persist({ coins: updatedCoins, inventory: updatedInventory });
      set({ coins: updatedCoins, inventory: updatedInventory });
      return true;
    },

    useItemInBattle: (itemId, targetSide) => {
      const state = get();
      if (state.battleStatus !== 'battle') return false;

      const itemIndex = state.inventory.findIndex((i) => i.id === itemId && i.quantity > 0);
      if (itemIndex === -1) return false;

      const item = state.inventory[itemIndex];
      const team = targetSide === 'player' ? [...state.playerCombatTeam] : [...state.computerCombatTeam];
      const activeIdx = targetSide === 'player' ? state.playerActiveIndex : state.computerActiveIndex;
      const activePoke = team[activeIdx];

      if (!activePoke) return false;

      let logMessage = '';

      switch (item.effect) {
        case 'heal_50':
          activePoke.currentHp = Math.min(
            Math.floor(activePoke.baseStats.hp * getRarityBonus(activePoke.rarity) * (1 + 0.1 * activePoke.level)),
            activePoke.currentHp + 50
          );
          logMessage = `${activePoke.name} was healed by 50 HP using ${item.name}!`;
          break;
        case 'heal_full':
          activePoke.currentHp = Math.floor(
            activePoke.baseStats.hp * getRarityBonus(activePoke.rarity) * (1 + 0.1 * activePoke.level)
          );
          logMessage = `${activePoke.name} was fully healed using ${item.name}!`;
          break;
        case 'revive':
          const faintedIdx = team.findIndex((p) => p.currentHp <= 0);
          if (faintedIdx === -1) return false; // None fainted
          const maxHp = Math.floor(
            team[faintedIdx].baseStats.hp * getRarityBonus(team[faintedIdx].rarity) * (1 + 0.1 * team[faintedIdx].level)
          );
          team[faintedIdx].currentHp = Math.floor(maxHp * 0.5);
          logMessage = `${team[faintedIdx].name} was revived to 50% HP using ${item.name}!`;
          break;
        case 'shield':
          if (targetSide === 'player') {
            set({ playerShieldActive: true });
          } else {
            set({ computerShieldActive: true });
          }
          logMessage = `${targetSide === 'player' ? 'Player' : 'Opponent'} deployed an Energy Barrier!`;
          break;
        default:
          return false;
      }

      // Consume item quantity
      const updatedInventory = state.inventory.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );

      persist({ inventory: updatedInventory });

      set((prev) => ({
        inventory: updatedInventory,
        playerCombatTeam: targetSide === 'player' ? team : prev.playerCombatTeam,
        computerCombatTeam: targetSide === 'computer' ? team : prev.computerCombatTeam,
        battleLogs: [logMessage, ...prev.battleLogs],
        activeTurn: prev.activeTurn === 'player' ? 'computer' : 'player',
        timeRemaining: 20,
      }));

      // Trigger computer turn after item usage if it is now computer's turn
      if (get().activeTurn === 'computer') {
        setTimeout(() => {
          get().executeComputerTurn();
        }, 1200);
      }

      return true;
    },

    levelUpPokemon: (pokemonId) => {
      const state = get();
      const pokemon = state.roster.find((p) => p.id === pokemonId);
      if (!pokemon) return false;

      const cost = pokemon.level * 150;
      if (state.coins < cost) return false;

      const updatedCoins = state.coins - cost;
      const updatedRoster = state.roster.map((p) => {
        if (p.id === pokemonId) {
          const nextLevel = p.level + 1;
          return {
            ...p,
            level: nextLevel,
          };
        }
        return p;
      });

      // Daily Quest upgrade trigger
      const updatedQuests = state.quests.map((q) => {
        if (q.id === 'q3' && !q.completed) {
          const count = q.current + 1;
          return { ...q, current: count, completed: count >= q.target };
        }
        return q;
      });

      persist({ coins: updatedCoins, roster: updatedRoster, quests: updatedQuests });
      set({ coins: updatedCoins, roster: updatedRoster, quests: updatedQuests });
      return true;
    },

    evolvePokemon: (pokemonId) => {
      const state = get();
      const pokemon = state.roster.find((p) => p.id === pokemonId);
      if (!pokemon) return false;

      const key = pokemon.name.toLowerCase();
      const evolution = EVOLUTION_CHAINS[key];

      // Must meet level threshold
      if (!evolution || pokemon.level < evolution.level) return false;

      // Crystals cost
      const costCrystals = pokemon.rarity === 'Common' ? 5 : 12;
      if (state.crystals < costCrystals) return false;

      const nextName = evolution.next.charAt(0).toUpperCase() + evolution.next.slice(1);
      
      // Play Pokemon cry of evolved form
      playPokemonCry(evolution.id);

      const updatedRoster = state.roster.map((p) => {
        if (p.id === pokemonId) {
          // Upgrade base stats and tier rarity
          const nextRarity = p.rarity === 'Common' ? 'Rare' : 'Epic';
          return {
            ...p,
            id: evolution.id,
            name: nextName,
            rarity: nextRarity as GamePokemon['rarity'],
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolution.id}.png`,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`,
            baseStats: {
              hp: Math.floor(p.baseStats.hp * 1.3),
              attack: Math.floor(p.baseStats.attack * 1.35),
              defense: Math.floor(p.baseStats.defense * 1.3),
              speed: Math.floor(p.baseStats.speed * 1.15),
            },
            skills: [
              ...p.skills.slice(0, 2),
              {
                name: p.types[0] === 'electric' ? 'Thunder' : p.types[0] === 'fire' ? 'Fire Blast' : p.types[0] === 'water' ? 'Hydro Pump' : 'Solar Beam',
                power: 2.2,
                type: p.types[0],
              },
            ],
          };
        }
        return p;
      });

      const updatedCrystals = state.crystals - costCrystals;
      persist({ crystals: updatedCrystals, roster: updatedRoster });
      set({ crystals: updatedCrystals, roster: updatedRoster });
      return true;
    },

    claimQuest: (questId) => {
      const state = get();
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return;

      const updatedCoins = state.coins + quest.rewardCoins;
      const updatedQuests = state.quests.map((q) =>
        q.id === questId ? { ...q, claimed: true } : q
      );

      persist({ coins: updatedCoins, quests: updatedQuests });
      set({ coins: updatedCoins, quests: updatedQuests });
    },

    summonPokemon: (pokemon) => {
      const state = get();
      
      // Play Pokemon cry of summoned form
      playPokemonCry(pokemon.id);

      if (state.roster.some((p) => p.id === pokemon.id)) {
        // Refund coins if duplicate
        const refund = pokemon.rarity === 'Legendary' ? 400 : pokemon.rarity === 'Epic' ? 250 : 100;
        const updatedCoins = state.coins + refund;
        persist({ coins: updatedCoins });
        set({ coins: updatedCoins });
        return;
      }

      const updatedRoster = [...state.roster, pokemon];
      persist({ roster: updatedRoster });
      set({ roster: updatedRoster });
    },

    // Combat engine matchmaking
    startMatchmaking: (_mode) => {
      set({ battleStatus: 'matchmaking', battleLogs: [] });

      // Simulate network pairing delay
      setTimeout(() => {
        const state = get();
        if (state.battleStatus !== 'matchmaking') return; // Cancelled

        // Get 3 player active pokemons
        const pTeam = state.activeTeamIds
          .map((id) => state.roster.find((p) => p.id === id))
          .filter((p): p is GamePokemon => p !== undefined)
          .map((p) => ({ ...p, currentHp: Math.floor(p.baseStats.hp * getRarityBonus(p.rarity) * (1 + 0.1 * p.level)) }));

        if (pTeam.length === 0) {
          set({ battleStatus: 'idle', battleLogs: ['Error: Roster active team invalid'] });
          return;
        }

        // Generate computer team matching element rarities
        const computerOpponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
        
        // Generate computer team matching element rarities dynamically
        const playerIds = pTeam.map((p) => p.id);
        const cTeam = pTeam.map((pMember) => {
          // Filter templates by matching rarity, and exclude player active elements to avoid duplicates
          const candidates = COMBATANT_TEMPLATES.filter(
            (t) => t.rarity === pMember.rarity && !playerIds.includes(t.id)
          );
          
          // Select a random template
          const chosenTemplate = candidates.length > 0 
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : COMBATANT_TEMPLATES.find((t) => t.rarity === pMember.rarity) || COMBATANT_TEMPLATES[0];

          const level = pMember.level;
          const levelMultiplier = 1 + 0.1 * level;
          const rarityMul = getRarityBonus(chosenTemplate.rarity);
          const maxHp = Math.floor(chosenTemplate.baseStats.hp * rarityMul * levelMultiplier);

          return {
            ...chosenTemplate,
            level,
            currentHp: maxHp,
          } as GamePokemon;
        });

        // Determine who goes first based on Speed of active elements
        const pSpeed = pTeam[0].baseStats.speed * (1 + 0.05 * pTeam[0].level);
        const cSpeed = cTeam[0].baseStats.speed * (1 + 0.05 * cTeam[0].level);
        const starter: BattleStore['activeTurn'] = pSpeed >= cSpeed ? 'player' : 'computer';

        set({
          battleStatus: 'battle',
          opponentProfile: computerOpponent,
          playerCombatTeam: pTeam,
          computerCombatTeam: cTeam,
          playerActiveIndex: 0,
          computerActiveIndex: 0,
          activeTurn: starter,
          battleLogs: [`Battle started! Facing ${computerOpponent.name}.`, `${starter === 'player' ? pTeam[0].name : cTeam[0].name} speed gives them initiative!`],
          playerShieldActive: false,
          computerShieldActive: false,
          timeRemaining: 20,
        });

        // If computer goes first, execute its turn
        if (starter === 'computer') {
          setTimeout(() => {
            get().executeComputerTurn();
          }, 1500);
        }
      }, 3000);
    },

    cancelMatchmaking: () => {
      set({ battleStatus: 'idle', opponentProfile: null });
    },

    executePlayerTurn: (skillIndex) => {
      const state = get();
      if (state.battleStatus !== 'battle' || state.activeTurn !== 'player') return;

      const pPoke = state.playerCombatTeam[state.playerActiveIndex];
      const cPoke = state.computerCombatTeam[state.computerActiveIndex];
      if (!pPoke || !cPoke) return;

      const skill = pPoke.skills[skillIndex] || pPoke.skills[0];

      // Play Pokemon cry on attack!
      playPokemonCry(pPoke.id);

      // Resolve damage calculations
      const levelMul = 1 + 0.08 * pPoke.level;
      const rarityMul = getRarityBonus(pPoke.rarity);
      const attackPower = pPoke.baseStats.attack * rarityMul * levelMul;

      const defLevelMul = 1 + 0.05 * cPoke.level;
      const defRarityMul = getRarityBonus(cPoke.rarity);
      const defenseVal = cPoke.baseStats.defense * defRarityMul * defLevelMul;

      const typeMul = getTypeMultiplier(skill.type, cPoke.types);

      let finalDamage = Math.max(10, Math.floor(attackPower * skill.power * typeMul - defenseVal * 0.4));

      // Apply barrier / shield
      if (state.computerShieldActive) {
        finalDamage = 0;
        set({ computerShieldActive: false });
      }

      // Apply damage to computer active
      const updatedCpuTeam = state.computerCombatTeam.map((p, idx) => {
        if (idx === state.computerActiveIndex) {
          return { ...p, currentHp: Math.max(0, p.currentHp - finalDamage) };
        }
        return p;
      });

      const effectivenessText = typeMul > 1.2 ? ' It was super effective!' : typeMul < 0.8 ? ' It was not very effective...' : '';
      const shieldText = finalDamage === 0 ? ' (Shield Blocked!)' : '';
      const log = `${pPoke.name} used ${skill.name}! Deals ${finalDamage} damage.${effectivenessText}${shieldText}`;

      // Update damage quest progression
      const updatedQuests = state.quests.map((q) => {
        if (q.id === 'q2' && !q.completed) {
          const count = q.current + finalDamage;
          return { ...q, current: count, completed: count >= q.target };
        }
        return q;
      });

      set((prev) => ({
        computerCombatTeam: updatedCpuTeam,
        battleLogs: [log, ...prev.battleLogs],
        quests: updatedQuests,
      }));

      persist({ quests: updatedQuests });

      // Check KO
      const currentCpuActive = updatedCpuTeam[state.computerActiveIndex];
      if (currentCpuActive.currentHp <= 0) {
        const nextAliveIdx = updatedCpuTeam.findIndex((p) => p.currentHp > 0);
        if (nextAliveIdx === -1) {
          // All computer fainted
          setTimeout(() => {
            get().endBattle('player');
          }, 1000);
          return;
        } else {
          // Switch to next computer pokemon
          const switchLog = `${currentCpuActive.name} fainted! Opponent sends out ${updatedCpuTeam[nextAliveIdx].name}.`;
          set((prev) => ({
            computerActiveIndex: nextAliveIdx,
            battleLogs: [switchLog, ...prev.battleLogs],
            activeTurn: 'computer',
            timeRemaining: 20,
          }));

          setTimeout(() => {
            get().executeComputerTurn();
          }, 1500);
          return;
        }
      }

      // Proceed to computer turn
      set({ activeTurn: 'computer', timeRemaining: 20 });
      setTimeout(() => {
        get().executeComputerTurn();
      }, 1500);
    },

    executeComputerTurn: () => {
      const state = get();
      if (state.battleStatus !== 'battle' || state.activeTurn !== 'computer') return;

      const cPoke = state.computerCombatTeam[state.computerActiveIndex];
      const pPoke = state.playerCombatTeam[state.playerActiveIndex];
      if (!cPoke || !pPoke) return;

      // Smart AI Routine:
      // 1. Swap check: If counter-typed (takes high damage or does low damage) and has another alive teammate that holds type advantage against active player
      const needsSwap = getTypeMultiplier(pPoke.types[0] || 'normal', cPoke.types) > 1.2 || getTypeMultiplier(cPoke.types[0] || 'normal', pPoke.types) < 0.8;
      
      if (needsSwap && Math.random() < 0.4) {
        const potentialSwapIdx = state.computerCombatTeam.findIndex((p, idx) => {
          return idx !== state.computerActiveIndex && p.currentHp > 0 && getTypeMultiplier(p.types[0] || 'normal', pPoke.types) >= 1.3;
        });

        if (potentialSwapIdx !== -1) {
          const swapLog = `Opponent swaps ${cPoke.name} out for ${state.computerCombatTeam[potentialSwapIdx].name}!`;
          set((prev) => ({
            computerActiveIndex: potentialSwapIdx,
            battleLogs: [swapLog, ...prev.battleLogs],
            activeTurn: 'player',
            timeRemaining: 20,
          }));
          return;
        }
      }

      // 2. Heal check: If HP is low (< 30%) and has potion in mock items list, heal!
      const maxHp = Math.floor(cPoke.baseStats.hp * getRarityBonus(cPoke.rarity) * (1 + 0.1 * cPoke.level));
      const isHpLow = cPoke.currentHp / maxHp < 0.3;

      if (isHpLow && Math.random() < 0.5) {
        cPoke.currentHp = Math.min(maxHp, cPoke.currentHp + 50);
        const healLog = `Opponent used a Potion on ${cPoke.name}! Restored 50 HP.`;
        set((prev) => ({
          battleLogs: [healLog, ...prev.battleLogs],
          activeTurn: 'player',
          timeRemaining: 20,
        }));
        return;
      }

      // 3. Attack check: Pick the strongest move (or type effective move)
      let bestSkillIndex = 0;
      let maxDamageEst = 0;

      cPoke.skills.forEach((skill, idx) => {
        const estTypeMul = getTypeMultiplier(skill.type, pPoke.types);
        const estDmg = skill.power * estTypeMul;
        if (estDmg > maxDamageEst) {
          maxDamageEst = estDmg;
          bestSkillIndex = idx;
        }
      });

      const skill = cPoke.skills[bestSkillIndex] || cPoke.skills[0];

      // Play Pokemon cry on attack!
      playPokemonCry(cPoke.id);

      // Resolve damage calculations
      const levelMul = 1 + 0.08 * cPoke.level;
      const rarityMul = getRarityBonus(cPoke.rarity);
      const attackPower = cPoke.baseStats.attack * rarityMul * levelMul;

      const defLevelMul = 1 + 0.05 * pPoke.level;
      const defRarityMul = getRarityBonus(pPoke.rarity);
      const defenseVal = pPoke.baseStats.defense * defRarityMul * defLevelMul;

      const typeMul = getTypeMultiplier(skill.type, pPoke.types);

      let finalDamage = Math.max(10, Math.floor(attackPower * skill.power * typeMul - defenseVal * 0.4));

      // Apply player barrier / shield
      if (state.playerShieldActive) {
        finalDamage = 0;
        set({ playerShieldActive: false });
      }

      // Apply damage to player active
      const updatedPlayerTeam = state.playerCombatTeam.map((p, idx) => {
        if (idx === state.playerActiveIndex) {
          return { ...p, currentHp: Math.max(0, p.currentHp - finalDamage) };
        }
        return p;
      });

      const effectivenessText = typeMul > 1.2 ? ' It was super effective!' : typeMul < 0.8 ? ' It was not very effective...' : '';
      const shieldText = finalDamage === 0 ? ' (Barrier Blocked!)' : '';
      const log = `Opponent's ${cPoke.name} used ${skill.name}! Deals ${finalDamage} damage.${effectivenessText}${shieldText}`;

      set((prev) => ({
        playerCombatTeam: updatedPlayerTeam,
        battleLogs: [log, ...prev.battleLogs],
      }));

      // Check KO
      const currentPlayerActive = updatedPlayerTeam[state.playerActiveIndex];
      if (currentPlayerActive.currentHp <= 0) {
        const nextAliveIdx = updatedPlayerTeam.findIndex((p) => p.currentHp > 0);
        if (nextAliveIdx === -1) {
          // All player fainted
          setTimeout(() => {
            get().endBattle('computer');
          }, 1000);
          return;
        } else {
          // Switch to next player pokemon
          const switchLog = `Your ${currentPlayerActive.name} fainted! Go, ${updatedPlayerTeam[nextAliveIdx].name}!`;
          set((prev) => ({
            playerActiveIndex: nextAliveIdx,
            battleLogs: [switchLog, ...prev.battleLogs],
            activeTurn: 'player',
            timeRemaining: 20,
          }));
          return;
        }
      }

      // Return turn to player
      set({ activeTurn: 'player', timeRemaining: 20 });
    },

    toggleAutoBattle: () => {
      const state = get();
      const nextVal = !state.isAutoBattle;
      set({ isAutoBattle: nextVal });

      if (nextVal && state.battleStatus === 'battle' && state.activeTurn === 'player') {
        get().runAutoTurn();
      }
    },

    tickTurnTimer: () => {
      const state = get();
      if (state.battleStatus !== 'battle') return;

      if (state.timeRemaining <= 1) {
        // Timer expired, auto-select a random move for player if player's turn
        if (state.activeTurn === 'player') {
          const activePoke = state.playerCombatTeam[state.playerActiveIndex];
          const randomIdx = Math.floor(Math.random() * (activePoke?.skills.length || 1));
          get().executePlayerTurn(randomIdx);
        }
      } else {
        set((prev) => ({ timeRemaining: prev.timeRemaining - 1 }));
      }
    },

    runAutoTurn: () => {
      const state = get();
      if (state.battleStatus !== 'battle' || state.activeTurn !== 'player') return;

      const activePoke = state.playerCombatTeam[state.playerActiveIndex];
      if (!activePoke) return;

      // Select strongest move automatically
      let bestSkillIndex = 0;
      let maxDmg = 0;
      const cPoke = state.computerCombatTeam[state.computerActiveIndex];

      activePoke.skills.forEach((skill, idx) => {
        const mul = getTypeMultiplier(skill.type, cPoke?.types || []);
        const score = skill.power * mul;
        if (score > maxDmg) {
          maxDmg = score;
          bestSkillIndex = idx;
        }
      });

      setTimeout(() => {
        get().executePlayerTurn(bestSkillIndex);
      }, 1000);
    },

    endBattle: (winner) => {
      const state = get();
      const isVictory = winner === 'player';

      const log = isVictory
        ? 'Victory! You defeated the opponent and earned rewards!'
        : 'Defeat! The opponent team overpowered your squad.';

      // Add coins & crystals on victory
      const rewardCoins = isVictory ? 150 : 30;
      const rewardCrystals = isVictory && Math.random() < 0.3 ? 1 : 0;
      const apChange = isVictory ? 25 : -15;

      const nextCoins = state.coins + rewardCoins;
      const nextCrystals = state.crystals + rewardCrystals;
      const nextAp = Math.max(0, state.arenaPoints + apChange);
      const nextRank = resolveRank(nextAp);

      // Distribute EXP to active roster pokemons
      const updatedRoster = state.roster.map((poke) => {
        if (state.activeTeamIds.includes(poke.id)) {
          const addExp = isVictory ? 50 : 15;
          const nextExp = poke.exp + addExp;
          const levelUpRequired = poke.level * 100;
          if (nextExp >= levelUpRequired) {
            return {
              ...poke,
              exp: nextExp - levelUpRequired,
              level: poke.level + 1,
            };
          }
          return { ...poke, exp: nextExp };
        }
        return poke;
      });

      // Update Ranked Battle quest progression
      const updatedQuests = state.quests.map((q) => {
        if (q.id === 'q1' && isVictory && !q.completed) {
          const count = q.current + 1;
          return { ...q, current: count, completed: count >= q.target };
        }
        return q;
      });

      persist({
        coins: nextCoins,
        crystals: nextCrystals,
        arenaPoints: nextAp,
        roster: updatedRoster,
        quests: updatedQuests,
      });

      set({
        battleStatus: isVictory ? 'victory' : 'defeat',
        coins: nextCoins,
        crystals: nextCrystals,
        arenaPoints: nextAp,
        rankTier: nextRank,
        roster: updatedRoster,
        quests: updatedQuests,
        battleLogs: [log, ...state.battleLogs],
      });
    },

    resetBattle: () => {
      set({
        battleStatus: 'idle',
        opponentProfile: null,
        playerCombatTeam: [],
        computerCombatTeam: [],
        playerActiveIndex: 0,
        computerActiveIndex: 0,
        battleLogs: [],
        isAutoBattle: false,
      });
    },

    refreshQuests: () => {
      const refreshed = INITIAL_QUESTS.map((q) => ({
        ...q,
        current: 0,
        completed: false,
        claimed: false,
      }));
      persist({ quests: refreshed });
      set({ quests: refreshed });
    },
  };
});
