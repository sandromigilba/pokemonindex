# 🌟 Pokémon Universe 

[![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)](https://github.com/pmndrs/zustand)
[![React Query](https://img.shields.io/badge/React_Query-5.0-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)

**Pokémon Universe** is a premium, state-of-the-art interactive portal and simulated online battle arena built with React 19, TypeScript, and Vite. Integrating both **PokéAPI** and the **Pokémon TCG API**, this application provides a highly polished, responsive, and animated user interface (using Tailwind CSS v4 and Framer Motion) for exploring, comparing, and battling with your favorite Pokémon.

---

## 🚀 Key Features

### 🔍 Pokémon Explorer & Search
*   **Real-time Search:** Instantly look up Pokémon by name or Pokedex ID.
*   **Element Filtering:** Quick filter cards by elements (Fire, Water, Electric, Dragon, and more).
*   **Interactive Details:** View high-resolution official artwork, stats charts, descriptions, abilities, and full learnsets.
*   **Type Strengths & Weaknesses:** Dynamically fetch and display type-matching relations (double damage from, half damage from, no damage from).

### 🃏 Holographic TCG Card Marketplace
*   **TCG Integration:** Search, filter, and load physical trading cards from the official Pokémon TCG API.
*   **Foil Effect Animations:** Features smooth hover and touch-based holographic micro-animations.
*   **Market Price Tracking:** Real-time integration of Cardmarket price statistics (Average Sell Price, Low Price, and Trend Price).
*   **Booster Set Filter:** Explore cards grouped by official TCG expansion sets (e.g., Scarlet & Violet).

### ⚖️ Side-by-Side Compare Tool
*   **Stat Comparison:** Compare combat metrics, radar charts, physical dimensions (height/weight), and base stats for two Pokémon side-by-side.
*   **Zustand Persisted Store:** Conveniently queue up to 2 Pokémon from the details or explorer list to compare.

### ⚔️ Battle Arena (Simulated Online Deck Builder & Battle)
A robust turn-based game featuring:
*   **Matchmaking:** Simulated Ranked, Casual, and Challenge matchmaking modes complete with player avatar, rank points, and simulated ping.
*   **Interactive 3v3 Combat:** Organize a custom roster, choose active combatants, and fight.
*   **Gacha Summoning System:** Use earned coins and crystals to pull/summon new Pokémon ranging from Common, Rare, Epic, to Legendary.
*   **RPG Evolution & Level-Up:** Level up your roster using EXP earned from battles, and trigger direct evolutions once your Pokémon hits level requirements (e.g., Charmander ➔ Charmeleon ➔ Charizard).
*   **Combative Inventory Shop:** Buy battle aids like potions, hyper potions, revives, and energy barriers. Use them in real-time during battles to heal, revive, or deploy damage-absorption shields.
*   **Dynamic Audio Engine:** Plays official, high-quality audio cry effects for every Pokémon during combat moves and summons.
*   **Auto-Battle AI:** Enable automated battle turns with strategic skill selections.
*   **Daily Quests:** Earn gold and crystal achievements by completing tasks (e.g., "Win 2 Ranked Battles", "Deals 600 damage").

### ✨ Extra Details
*   **Pokéball Cursor:** An interactive custom cursor that responds dynamically on desktop hover actions.
*   **Favorites List:** Save your favorite Pokémon locally and access them anytime.
*   **Responsive Layout:** Fully compatible across mobile, tablet, and desktop viewports.

---

## 🛠️ Technology Stack

*   **Frontend Library:** [React 19](https://react.dev/) (functional components, Hooks, Suspense/lazy routes)
*   **Build Tool:** [Vite v8](https://vite.dev/) (blazing-fast Hot Module Replacement)
*   **State Management:** [Zustand v5](https://github.com/pmndrs/zustand) (persisted state utilizing `localStorage` caching)
*   **Asynchronous Queries:** [TanStack React Query v5](https://tanstack.com/query) (handles data caching, parallel fetches, and state synchronization)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@tailwindcss/vite` compiler integration) + Custom Glassmorphism styles
*   **Motion & Animations:** [Framer Motion v12](https://www.framer.com/motion/) (page transitions, card flips, inventory alerts, and health-bar animations)
*   **SEO:** [React Helmet Async](https://github.com/staylor/react-helmet-async) (dynamic meta tags, title injections, and SEO practices)

---

## 📂 Project Structure

```bash
pokemon-verse/
├── public/                 # Static assets (favicons, banners)
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/         # Reusable presentation and layout components
│   │   ├── ErrorBoundary.tsx          # Handles application crash protection
│   │   ├── EvolutionChain.tsx         # Displays recursive evolution nodes
│   │   ├── FloatingPokeballCursor.tsx # Responsive custom Pokéball cursor
│   │   ├── Layout.tsx                 # Site header, footer, navigation & scroll-up
│   │   ├── LoadingSkeleton.tsx        # Grid skeletons for cards and details
│   │   ├── PokemonCard.tsx            # Animated Pokémon card link
│   │   ├── PokemonCardItem.tsx        # Physical Holographic TCG card
│   │   ├── SEO.tsx                    # SEO tags wrapper
│   │   ├── StatChart.tsx              # Base stats progress bar layout
│   │   └── TypeBadge.tsx              # Colored custom type badges
│   ├── pages/              # Application pages / lazy routes
│   │   ├── BattleArena.tsx # Battle Arena, Shop, Summon and Roster editor
│   │   ├── Compare.tsx     # Side-by-side comparison screen
│   │   ├── Detail.tsx      # Comprehensive Pokémon stat overview
│   │   ├── Explorer.tsx    # Scrollable directory & search filters
│   │   ├── Favorites.tsx   # Saved bookmarked roster
│   │   ├── Home.tsx        # App dashboard, element quick filters
│   │   └── TCGCards.tsx    # Holographic card browser marketplace
│   ├── store/              # Zustand global state configurations
│   │   ├── useBattleStore.ts   # Entire turn-based battle & summmons store
│   │   └── usePokemonStore.ts  # Favorites, Compare, and Cursor stores
│   ├── utils/              # Network layer configuration
│   │   └── api.ts          # PokéAPI and TCG API wrappers
│   ├── App.css
│   ├── App.tsx             # Main router configuration & lazy loaders
│   ├── index.css           # Global custom style tokens & Tailwind imports
│   └── main.tsx            # React entry mounting
├── package.json
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite bundle configuration
```

---

## ⚡ Getting Started

### 📋 Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended) and `npm`.

### 🔧 Installation
Clone the repository, navigate to the folder, and install dependencies:
```bash
npm install
```

### 🏃 Running Locally
Start the development server:
```bash
npm run dev
```
By default, the server runs on [http://localhost:5173](http://localhost:5173).

### 📦 Production Build
Build the optimized application bundle for production:
```bash
npm run build
```
Verify the production build locally:
```bash
npm run preview
```

### 🧪 Linting
To check the codebase for syntax or formatting warnings:
```bash
npm run lint
```

---

## ⚔️ Battle Arena Mechanics & Systems

*   **Rarity Multipliers:** Pokémon base stats are multiplied depending on their rarity tier:
    *   **Common:** `1.0x`
    *   **Rare:** `1.2x`
    *   **Epic:** `1.5x`
    *   **Legendary:** `2.0x`
*   **Leveling System:** Winning battles rewards roster Pokémon with EXP. Upon accumulating enough points, you can manually trigger a level-up, boosting health and attack attributes by `10%` per level.
*   **Type Effectiveness Chart:** Integrates a core type-matching matrix inside `useBattleStore.ts` to compute multipliers (`1.5x` Super Effective / `0.7x` Not Very Effective) based on the attacker's skill element type and the opponent's dual-element types.
*   **Inventory Usage:** Items bought in the shop can be clicked during the player's active battle turn to deploy:
    *   *Potion:* Restores 50 HP.
    *   *Hyper Potion:* Restores full HP.
    *   *Revive:* Resurrects a fainted team member to 50% HP.
    *   *Energy Barrier:* Prevents the opponent's next move from dealing damage.

---

## 🌐 API Credits
This project relies on the following free and open databases:
1.  **[PokéAPI](https://pokeapi.co/)**: Used for fetching Pokémon details, sprites, evolution hierarchies, type parameters, move pools, and cry sound effect links.
2.  **[Pokémon TCG API](https://pokemontcg.io/)**: Used to load card illustrations, booster releases, market values, and set expansions.
