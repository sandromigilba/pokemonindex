import axios from 'axios';

// Base URLs
const POKE_API = 'https://pokeapi.co/api/v2';
const TCG_API = 'https://api.pokemontcg.io/v2';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number; // decimeters
  weight: number; // hectograms
  types: string[];
  stats: { name: string; value: number }[];
  abilities: string[];
  image: string;
  sprite: string;
  moves: string[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  description: string;
  evolutionChainUrl: string;
  genera: string;
}

export interface EvolutionNode {
  name: string;
  id: number;
  image: string;
  minLevel?: number;
  item?: string;
  trigger: string;
}

export interface TCGCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  types: string[];
  rarity: string;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    logo: string;
    symbol: string;
  };
  images: {
    small: string;
    large: string;
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      reverseHoloTrend?: number;
    };
  };
}

// Fetch list of Pokémon with offset and limit
export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const response = await axios.get(`${POKE_API}/pokemon?limit=${limit}&offset=${offset}`);
  const results: PokemonListItem[] = response.data.results;

  // Fetch detail for each Pokémon in parallel
  const details = await Promise.all(
    results.map(async (p) => {
      try {
        return await fetchPokemonDetail(p.name);
      } catch (err) {
        console.error(`Error fetching detail for ${p.name}:`, err);
        return null;
      }
    })
  );

  return {
    next: response.data.next,
    previous: response.data.previous,
    count: response.data.count,
    results: details.filter((d): d is PokemonDetail => d !== null),
  };
};

// Fetch a single Pokémon detail by name or ID
export const fetchPokemonDetail = async (nameOrId: string | number): Promise<PokemonDetail> => {
  const query = typeof nameOrId === 'string' ? nameOrId.toLowerCase().trim() : nameOrId;
  const response = await axios.get(`${POKE_API}/pokemon/${query}`);
  const data = response.data;

  const types = data.types.map((t: any) => t.type.name);
  const stats = data.stats.map((s: any) => ({
    name: s.stat.name,
    value: s.base_stat,
  }));
  const abilities = data.abilities.map((a: any) => a.ability.name);
  
  // Premium official artwork, fallback to home and front_default
  const image = data.sprites.other['official-artwork'].front_default || 
                data.sprites.other.home.front_default || 
                data.sprites.front_default;
  const sprite = data.sprites.front_default;
  const moves = data.moves.map((m: any) => m.move.name);

  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types,
    stats,
    abilities,
    image,
    sprite,
    moves,
  };
};

// Fetch species info (description, evolution chain URL)
export const fetchPokemonSpecies = async (nameOrId: string | number): Promise<PokemonSpecies> => {
  const query = typeof nameOrId === 'string' ? nameOrId.toLowerCase().trim() : nameOrId;
  const response = await axios.get(`${POKE_API}/pokemon-species/${query}`);
  const data = response.data;

  // Extract English description
  const descriptionEntry = data.flavor_text_entries.find(
    (entry: any) => entry.language.name === 'en'
  );
  const description = descriptionEntry 
    ? descriptionEntry.flavor_text.replace(/\f/g, ' ') 
    : 'No description available.';

  // Extract English genus
  const genusEntry = data.genera.find(
    (entry: any) => entry.language.name === 'en'
  );
  const genera = genusEntry ? genusEntry.genus : 'Unknown Pokémon';

  return {
    id: data.id,
    name: data.name,
    description,
    evolutionChainUrl: data.evolution_chain.url,
    genera,
  };
};

// Recursively traverse evolution chain
const parseEvolutionChain = async (chainNode: any): Promise<EvolutionNode[]> => {
  const nodes: EvolutionNode[] = [];
  const name = chainNode.species.name;
  
  // Extract ID from species URL: https://pokeapi.co/api/v2/pokemon-species/{id}/
  const urlParts = chainNode.species.url.split('/');
  const id = parseInt(urlParts[urlParts.length - 2]);
  
  // Fetch sprite for this evolved form
  let image = '';
  try {
    // Optimized: get sprite from high-res artwork url template to avoid heavy API nesting
    image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  } catch (err) {
    image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  const evolutionDetails = chainNode.evolution_details[0];
  let minLevel = undefined;
  let item = undefined;
  let trigger = 'level-up';

  if (evolutionDetails) {
    minLevel = evolutionDetails.min_level;
    item = evolutionDetails.item?.name;
    trigger = evolutionDetails.trigger.name;
  }

  nodes.push({
    name,
    id,
    image,
    minLevel,
    item,
    trigger,
  });

  if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
    for (const subChain of chainNode.evolves_to) {
      const subNodes = await parseEvolutionChain(subChain);
      nodes.push(...subNodes);
    }
  }

  return nodes;
};

// Fetch evolution chain details
export const fetchEvolutionChain = async (url: string): Promise<EvolutionNode[]> => {
  const response = await axios.get(url);
  const chain = response.data.chain;
  return await parseEvolutionChain(chain);
};

// Fetch Type weaknesses & strengths
export interface TypeRelations {
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
}

export const fetchTypeRelations = async (typeNames: string[]): Promise<TypeRelations> => {
  const doubleDamageFrom = new Set<string>();
  const halfDamageFrom = new Set<string>();
  const noDamageFrom = new Set<string>();

  await Promise.all(
    typeNames.map(async (name) => {
      try {
        const response = await axios.get(`${POKE_API}/type/${name.toLowerCase()}`);
        const damageRelations = response.data.damage_relations;

        damageRelations.double_damage_from.forEach((t: any) => doubleDamageFrom.add(t.name));
        damageRelations.half_damage_from.forEach((t: any) => halfDamageFrom.add(t.name));
        damageRelations.no_damage_from.forEach((t: any) => noDamageFrom.add(t.name));
      } catch (err) {
        console.error(`Error fetching type relations for ${name}:`, err);
      }
    })
  );

  // Eliminate overlap (e.g. if a dual-type is double weak and half weak, it resolves based on standard rules.
  // Here we return unique values for mapping weaknesses)
  return {
    doubleDamageFrom: Array.from(doubleDamageFrom),
    halfDamageFrom: Array.from(halfDamageFrom),
    noDamageFrom: Array.from(noDamageFrom),
  };
};

// Pokémon TCG API: Fetch cards by Pokemon Name
export const fetchTCGCardsByPokemon = async (pokemonName: string): Promise<TCGCard[]> => {
  try {
    const response = await axios.get(`${TCG_API}/cards?q=name:"${pokemonName}"&pageSize=15`);
    return response.data.data || [];
  } catch (err) {
    console.error(`Error fetching TCG cards for ${pokemonName}:`, err);
    return [];
  }
};

// Pokémon TCG API: Search Cards with filter sets, rarities and types
export const fetchTCGCards = async (params: {
  page?: number;
  pageSize?: number;
  query?: string;
  set?: string;
  rarity?: string;
  type?: string;
}) => {
  const { page = 1, pageSize = 20, query, set, rarity, type } = params;
  let queryStr = '';

  const terms: string[] = [];
  if (query) terms.push(`name:"*${query}*"`);
  if (set) terms.push(`set.id:"${set}"`);
  if (rarity) terms.push(`rarity:"${rarity}"`);
  if (type) terms.push(`types:"${type}"`);

  if (terms.length > 0) {
    queryStr = `q=${terms.join(' ')}`;
  }

  const url = `${TCG_API}/cards?page=${page}&pageSize=${pageSize}${queryStr ? `&${queryStr}` : ''}`;
  const response = await axios.get(url);

  return {
    data: response.data.data as TCGCard[],
    page: response.data.page,
    pageSize: response.data.pageSize,
    count: response.data.count,
    totalCount: response.data.totalCount,
  };
};

// Pokémon TCG API: Fetch available sets
export const fetchTCGSets = async () => {
  try {
    const response = await axios.get(`${TCG_API}/sets?orderBy=releaseDate`);
    return response.data.data || [];
  } catch (err) {
    console.error('Error fetching TCG sets:', err);
    return [];
  }
};
