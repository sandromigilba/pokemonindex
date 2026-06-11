import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Coins, Sparkles, RefreshCw, Trophy, Zap,
  Star, Plus, CheckCircle, Play, Award, ZapOff,
  ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import { useBattleStore, getRarityBonus, EVOLUTION_CHAINS } from '../store/useBattleStore';
import type { GamePokemon } from '../store/useBattleStore';
import { fetchPokemonDetail } from '../utils/api';
import SEO from '../components/SEO';

export const BattleArena: React.FC = () => {
  const store = useBattleStore();
  const [activeTab, setActiveTab] = useState<'arena' | 'roster' | 'shop' | 'quests'>('arena');
  const [summoning, setSummoning] = useState(false);
  const [summonedPokemon, setSummonedPokemon] = useState<GamePokemon | null>(null);
  const [summonError, setSummonError] = useState<string | null>(null);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Turn timer tick handler
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (store.battleStatus === 'battle') {
      timer = setInterval(() => {
        store.tickTurnTimer();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [store.battleStatus, store.timeRemaining]);

  // Auto Battle handler
  useEffect(() => {
    if (store.battleStatus === 'battle' && store.activeTurn === 'player' && store.isAutoBattle) {
      store.runAutoTurn();
    }
  }, [store.battleStatus, store.activeTurn, store.isAutoBattle]);

  // Scroll battle logs to top/bottom automatically on update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // scroll to newest logs at top
    }
  }, [store.battleLogs]);

  // Helper to resolve rarity borders/text colors
  const getRarityStyles = (rarity: GamePokemon['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return {
          border: 'border-amber-500/50 shadow-amber-500/20',
          bg: 'from-amber-500/10 to-yellow-600/10',
          text: 'text-amber-400 font-bold',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black',
        };
      case 'Epic':
        return {
          border: 'border-purple-500/50 shadow-purple-500/20',
          bg: 'from-purple-500/10 to-indigo-600/10',
          text: 'text-purple-400 font-semibold',
          badge: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold',
        };
      case 'Rare':
        return {
          border: 'border-blue-500/50 shadow-blue-500/20',
          bg: 'from-blue-500/10 to-cyan-600/10',
          text: 'text-blue-400 font-semibold',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
        };
      default:
        return {
          border: 'border-slate-700 shadow-slate-900/20',
          bg: 'from-slate-800/20 to-slate-900/20',
          text: 'text-slate-400',
          badge: 'bg-slate-700 text-slate-200',
        };
    }
  };

  // Perform PokéAPI dynamic summoning
  const handleSummon = async () => {
    if (store.coins < 150) {
      setSummonError('Insufficient Poke-Coins! You need 150 coins to summon.');
      return;
    }

    setSummoning(true);
    setSummonError(null);
    setSummonedPokemon(null);

    try {
      // Pick random Gen 1-3 Pokemon ID
      const randomId = Math.floor(Math.random() * 386) + 1;
      const detail = await fetchPokemonDetail(randomId);

      // Map base stats total to derive custom rarity
      const hp = detail.stats.find((s) => s.name === 'hp')?.value || 60;
      const attack = detail.stats.find((s) => s.name === 'attack')?.value || 60;
      const defense = detail.stats.find((s) => s.name === 'defense')?.value || 60;
      const speed = detail.stats.find((s) => s.name === 'speed')?.value || 60;
      
      const bst = hp + attack + defense + speed;

      let rarity: GamePokemon['rarity'] = 'Common';
      if (bst >= 280 && bst < 360) rarity = 'Rare';
      else if (bst >= 360 && bst < 480) rarity = 'Epic';
      else if (bst >= 480) rarity = 'Legendary';

      // Setup skills/moves based on elements
      const primaryType = detail.types[0] || 'normal';
      const skills = [
        { name: 'Tackle', power: 1.0, type: 'normal' },
        { name: detail.moves[0] ? detail.moves[0].replace(/-/g, ' ') : 'Quick Attack', power: 1.3, type: primaryType },
        { name: detail.moves[1] ? detail.moves[1].replace(/-/g, ' ') : 'Special Move', power: 1.7, type: primaryType },
      ];

      const summoned: GamePokemon = {
        id: detail.id,
        name: detail.name.charAt(0).toUpperCase() + detail.name.slice(1),
        level: 1,
        exp: 0,
        types: detail.types,
        image: detail.image,
        sprite: detail.sprite,
        rarity,
        baseStats: { hp, attack, defense, speed },
        currentHp: hp,
        skills,
      };

      store.addCoins(-150);
      store.summonPokemon(summoned);
      setSummonedPokemon(summoned);

      // Update quest upgrade trigger if they summoned
      const updatedQuests = store.quests.map((q) => {
        if (q.id === 'q3' && !q.completed) {
          // Level up or summon counted as collection activity
          return { ...q, current: Math.min(q.target, q.current + 1), completed: q.current + 1 >= q.target };
        }
        return q;
      });
      useBattleStore.setState({ quests: updatedQuests });
    } catch (err) {
      console.error('Summon failed', err);
      setSummonError('Failed to establish connection to PokéAPI. Try again.');
    } finally {
      setSummoning(false);
    }
  };

  // Active team management toggler
  const toggleTeamMember = (pokemonId: number) => {
    const activeTeam = [...store.activeTeamIds];
    if (activeTeam.includes(pokemonId)) {
      // Remove unless it's the last one
      if (activeTeam.length === 1) return;
      const filtered = activeTeam.filter((id) => id !== pokemonId);
      store.setActiveTeam(filtered);
    } else {
      // Add if space permits (max 3)
      if (activeTeam.length >= 3) {
        // Swap out first
        activeTeam.shift();
      }
      activeTeam.push(pokemonId);
      store.setActiveTeam(activeTeam);
    }
  };

  return (
    <>
      <SEO
        title="Pokémon Battle Arena - Pokémon Universe"
        description="Enter the turn-based Pokémon Battle Arena. Match with simulated online opponents, level up, evolve, and buy items."
      />

      <div className="w-full min-h-[80vh] flex flex-col gap-6">
        {/* Header stats dashboard bar */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 rounded-[30px] glass-morphism border border-white/5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#FFCB05]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">POKE-COINS</div>
              <div className="text-lg font-bold font-mono text-slate-100">{store.coins}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">EXP CRYSTALS</div>
              <div className="text-lg font-bold font-mono text-slate-100">{store.crystals}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">ARENA POINTS (AP)</div>
              <div className="text-lg font-bold font-mono text-slate-100">{store.arenaPoints}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFCB05]/10 border border-[#FFCB05]/20 text-[#FFCB05]">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">ARENA RANK</div>
              <div className="text-lg font-bold font-display text-slate-100 tracking-wider">
                {store.rankTier.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Combat Mode overlays & states */}
        {store.battleStatus === 'matchmaking' && (
          <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-6 glass-morphism border border-white/5 rounded-[30px] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/20" />
            
            {/* Spinning Radar circles */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFCB05]/20 animate-spin" style={{ animationDuration: '12s' }} />
              <div className="absolute inset-4 rounded-full border border-dashed border-blue-500/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
              <div className="absolute inset-8 rounded-full border border-slate-700" />
              <Swords className="w-16 h-16 text-[#FFCB05] animate-pulse" />
            </div>

            <div className="text-center z-10">
              <h2 className="text-xl font-bold font-display tracking-widest text-slate-100 uppercase">
                Finding Opponent...
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1.5">
                EST. TIME: &lt; 5s &bull; REGION: SIM_ARENA
              </p>
            </div>

            <button
              onClick={() => store.cancelMatchmaking()}
              className="px-6 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/50 text-red-400 text-sm font-semibold transition-all clickable z-10"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {store.battleStatus === 'battle' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
            {/* Battle Stage Grid */}
            <div className="flex-1 flex flex-col gap-6 p-6 rounded-[30px] bg-slate-950/40 border border-white/5 shadow-2xl relative overflow-hidden">
              {/* Top info overlay */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-400">ARENA DECK BATTLE</span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Turn Indicator Badge */}
                  <div className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold border ${
                    store.activeTurn === 'player'
                      ? 'bg-amber-500/10 border-[#FFCB05]/30 text-[#FFCB05]'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse'
                  }`}>
                    {store.activeTurn === 'player' ? 'YOUR TURN' : 'OPPONENT TURN'}
                  </div>

                  {/* Timer Circular ring */}
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                    <Zap className="w-4 h-4 text-[#FFCB05]" />
                    <span>{store.timeRemaining}s</span>
                  </div>
                </div>
              </div>

              {/* Combatants Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6 min-h-[320px] relative z-10">
                {/* Player Active Pokémon (Left/Bottom) */}
                <div className="flex flex-col items-center gap-4 relative">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-500/5 border border-dashed border-[#FFCB05]/20 animate-spin" style={{ animationDuration: '20s' }} />
                    
                    {/* Active Image with shake animations */}
                    <motion.img
                      animate={store.activeTurn === 'computer' && store.playerShieldActive ? { x: [0, 5, -5, 5, 0] } : {}}
                      src={store.playerCombatTeam[store.playerActiveIndex]?.image}
                      alt={store.playerCombatTeam[store.playerActiveIndex]?.name}
                      className="w-36 h-36 object-contain z-10 filter drop-shadow-[0_8px_16px_rgba(255,203,5,0.15)]"
                    />

                    {/* Energy Shield bubble overlay */}
                    {store.playerShieldActive && (
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-400/80 bg-cyan-400/5 animate-pulse z-20" />
                    )}
                  </div>

                  {/* HP and stats card */}
                  <div className="w-full max-w-[220px] p-3 rounded-2xl glass-morphism border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">
                        {store.playerCombatTeam[store.playerActiveIndex]?.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Lvl {store.playerCombatTeam[store.playerActiveIndex]?.level}
                      </span>
                    </div>

                    {/* HP Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                        style={{
                          width: `${Math.max(0, (store.playerCombatTeam[store.playerActiveIndex]?.currentHp / (store.playerCombatTeam[store.playerActiveIndex]?.baseStats.hp * getRarityBonus(store.playerCombatTeam[store.playerActiveIndex]?.rarity) * (1 + 0.1 * store.playerCombatTeam[store.playerActiveIndex]?.level))) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>HP: {store.playerCombatTeam[store.playerActiveIndex]?.currentHp}</span>
                      <span className="uppercase text-amber-500 font-bold">{store.playerCombatTeam[store.playerActiveIndex]?.rarity}</span>
                    </div>
                  </div>
                </div>

                {/* Computer Active Pokémon (Right/Top) */}
                <div className="flex flex-col items-center gap-4 relative">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-blue-500/5 border border-dashed border-blue-500/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
                    
                    <motion.img
                      src={store.computerCombatTeam[store.computerActiveIndex]?.image}
                      alt={store.computerCombatTeam[store.computerActiveIndex]?.name}
                      className="w-36 h-36 object-contain z-10 filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.15)]"
                    />

                    {/* Energy Shield bubble overlay */}
                    {store.computerShieldActive && (
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-400/80 bg-cyan-400/5 animate-pulse z-20" />
                    )}
                  </div>

                  {/* HP and stats card */}
                  <div className="w-full max-w-[220px] p-3 rounded-2xl glass-morphism border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">
                        {store.computerCombatTeam[store.computerActiveIndex]?.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Lvl {store.computerCombatTeam[store.computerActiveIndex]?.level}
                      </span>
                    </div>

                    {/* HP Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                        style={{
                          width: `${Math.max(0, (store.computerCombatTeam[store.computerActiveIndex]?.currentHp / (store.computerCombatTeam[store.computerActiveIndex]?.baseStats.hp * getRarityBonus(store.computerCombatTeam[store.computerActiveIndex]?.rarity) * (1 + 0.1 * store.computerCombatTeam[store.computerActiveIndex]?.level))) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>HP: {store.computerCombatTeam[store.computerActiveIndex]?.currentHp}</span>
                      <span className="uppercase text-blue-500 font-bold">{store.computerCombatTeam[store.computerActiveIndex]?.rarity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action controller dock */}
              <div className="border-t border-white/5 pt-4 z-10 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-mono">CHOOSE BATTLE ACTION:</span>
                  
                  {/* Mode toggles */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => store.toggleAutoBattle()}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 clickable ${
                        store.isAutoBattle
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {store.isAutoBattle ? <Play className="w-3.5 h-3.5 fill-current" /> : <ZapOff className="w-3.5 h-3.5" />}
                      <span>AUTO BATTLE</span>
                    </button>
                    
                    <button
                      onClick={() => store.resetBattle()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 clickable"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>SURRENDER</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column: Skills list */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Skills / Attacks</div>
                    <div className="grid grid-cols-3 gap-2">
                      {store.playerCombatTeam[store.playerActiveIndex]?.skills.map((skill, index) => (
                        <button
                          key={skill.name}
                          disabled={store.activeTurn !== 'player' || store.isAutoBattle}
                          onClick={() => store.executePlayerTurn(index)}
                          className="py-2.5 px-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-[#FFCB05]/40 hover:bg-slate-700/60 disabled:opacity-40 disabled:pointer-events-none transition-all flex flex-col items-center text-center clickable"
                        >
                          <span className="text-xs font-bold text-slate-200 truncate w-full">{skill.name}</span>
                          <span className="text-[9px] text-[#FFCB05] font-mono mt-0.5">{skill.power}x &bull; {skill.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right column: Battle Items */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Use Battle Items</div>
                    <div className="grid grid-cols-4 gap-2">
                      {store.inventory.map((item) => (
                        <button
                          key={item.id}
                          disabled={store.activeTurn !== 'player' || item.quantity <= 0}
                          onClick={() => store.useItemInBattle(item.id, 'player')}
                          className="py-2 px-1 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/60 disabled:opacity-40 disabled:pointer-events-none transition-all flex flex-col items-center text-center clickable"
                          title={item.description}
                        >
                          <span className="text-[10px] font-bold text-slate-300 truncate w-full">{item.name}</span>
                          <span className="text-[9px] text-blue-400 font-mono mt-0.5">QTY: {item.quantity}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Feed Log side-panel */}
            <div className="w-full lg:w-80 flex flex-col gap-4 p-5 rounded-[30px] bg-slate-950/20 border border-white/5">
              <h3 className="font-display font-extrabold text-sm tracking-wider text-slate-300 flex items-center gap-2 border-b border-white/5 pb-3">
                <BookOpen className="w-4 h-4 text-[#FFCB05]" />
                BATTLE FEED LOG
              </h3>

              <div
                ref={logContainerRef}
                className="flex-1 max-h-[300px] lg:max-h-none overflow-y-auto pr-1 flex flex-col gap-3 font-mono text-xs text-slate-400"
              >
                {store.battleLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-xl border ${
                      index === 0
                        ? 'bg-[#FFCB05]/5 border-[#FFCB05]/20 text-[#FFCB05] font-semibold'
                        : 'bg-slate-900/40 border-white/5'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                {store.battleLogs.length === 0 && (
                  <div className="text-center text-slate-500 py-12">Waiting for first turn...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {(store.battleStatus === 'victory' || store.battleStatus === 'defeat') && (
          <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-8 glass-morphism border border-white/5 rounded-[30px] relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" />
            
            <div className="text-center z-10 max-w-md flex flex-col items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
                store.battleStatus === 'victory'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10 shadow-lg'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {store.battleStatus === 'victory' ? <Award className="w-10 h-10 animate-bounce" /> : <ZapOff className="w-10 h-10" />}
              </div>

              <div>
                <h2 className="text-2xl font-bold font-display tracking-widest text-slate-100 uppercase">
                  {store.battleStatus === 'victory' ? 'YOU WON THE MATCH!' : 'BATTLE DEFEAT'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {store.battleStatus === 'victory'
                    ? 'Your active team earned experience points and currency bonuses!'
                    : 'Train your Pokémon team in the Evolution Lab and try again.'}
                </p>
              </div>

              {/* Rewards Grid */}
              <div className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500">COINS</div>
                  <div className="text-sm font-bold text-[#FFCB05]">
                    +{store.battleStatus === 'victory' ? '150' : '30'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">CRYSTALS</div>
                  <div className="text-sm font-bold text-purple-400">
                    +{store.battleStatus === 'victory' ? 'Chance' : '0'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">ARENA PTS</div>
                  <div className={`text-sm font-bold ${store.battleStatus === 'victory' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {store.battleStatus === 'victory' ? '+25' : '-15'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => store.resetBattle()}
                className="mt-4 px-8 py-3 rounded-xl bg-[#FFCB05] hover:bg-[#FFD700] text-slate-950 font-bold text-sm tracking-widest uppercase transition-all clickable"
              >
                Back to Battle Hub
              </button>
            </div>
          </div>
        )}

        {store.battleStatus === 'idle' && (
          <div className="flex flex-col gap-6">
            {/* Horizontal Sub-tab controller */}
            <div className="flex border-b border-white/5">
              {(['arena', 'roster', 'shop', 'quests'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all clickable ${
                    activeTab === tab
                      ? 'border-[#FFCB05] text-[#FFCB05]'
                      : 'border-transparent text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tab === 'quests' ? 'Daily Quests' : tab === 'roster' ? 'Evolution & Upgrade' : tab}
                </button>
              ))}
            </div>

            {/* Sub-tab views */}
            {activeTab === 'arena' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mode Selectors */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4">
                    <h2 className="font-display font-extrabold text-lg tracking-wider text-slate-200">
                      CHOOSE GAME MODE
                    </h2>
                    <p className="text-xs text-slate-400">
                      Prepare your deck of 3 Pokémon. Test your skills against simulated global players or complete daily arena objectives.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div
                        onClick={() => store.startMatchmaking('ranked')}
                        className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border border-amber-500/10 hover:border-[#FFCB05]/40 transition-all cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
                      >
                        <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Trophy className="w-20 h-20 text-[#FFCB05]" />
                        </div>
                        <h3 className="font-display font-bold text-[#FFCB05] flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          Ranked Arena
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Face balanced opponents, win points to rank up, and claim coins. Defeats deduct rank points.
                        </p>
                        <span className="text-[10px] font-mono text-amber-500 font-bold group-hover:translate-x-2 transition-transform flex items-center gap-1 mt-auto">
                          START RANKED BATTLE <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div
                        onClick={() => store.startMatchmaking('casual')}
                        className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
                      >
                        <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Swords className="w-20 h-20 text-blue-400" />
                        </div>
                        <h3 className="font-display font-bold text-blue-400 flex items-center gap-2">
                          <Swords className="w-5 h-5" />
                          Simulated Online PvP
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Enter matchmaking queue, pair with mock global trainers, and play with real turn latency constraints.
                        </p>
                        <span className="text-[10px] font-mono text-blue-400 font-bold group-hover:translate-x-2 transition-transform flex items-center gap-1 mt-auto">
                          FIND MATCHMAKING MATCH <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Squad Builder */}
                  <div className="p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-slate-200">
                        ACTIVE COMBAT DECK
                      </h3>
                      <span className="text-[10px] font-mono text-[#FFCB05]">
                        {store.activeTeamIds.length} / 3 CHOSEN
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {store.activeTeamIds.map((id) => {
                        const poke = store.roster.find((p) => p.id === id);
                        if (!poke) return null;
                        const styles = getRarityStyles(poke.rarity);
                        return (
                          <div
                            key={poke.id}
                            className={`p-3 rounded-2xl bg-gradient-to-b ${styles.bg} border ${styles.border} flex flex-col items-center gap-2 relative overflow-hidden`}
                          >
                            <img src={poke.image} alt={poke.name} className="w-16 h-16 object-contain" />
                            <div className="text-center">
                              <div className="text-xs font-bold text-slate-200 truncate">{poke.name}</div>
                              <div className="text-[9px] font-mono text-slate-400">Lvl {poke.level} &bull; HP {poke.baseStats.hp}</div>
                            </div>
                            <span className={`absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded font-mono ${styles.badge}`}>
                              {poke.rarity.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                      {store.activeTeamIds.length === 0 && (
                        <div className="col-span-3 text-center text-xs text-slate-500 py-6">
                          No Pokémon chosen! Select elements from roster below.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Leaderboard panel */}
                <div className="p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4">
                  <h3 className="font-display font-extrabold text-sm tracking-wider text-slate-200 flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-[#FFCB05]" />
                    ARENA RANK LEADERBOARD
                  </h3>

                  <div className="flex flex-col gap-3 font-mono text-xs">
                    {[
                      { name: 'Cynthia Elite', ap: 2400, rank: 1 },
                      { name: 'Red Trainer', ap: 1950, rank: 2 },
                      { name: 'Blue Champion', ap: 1800, rank: 3 },
                      { name: 'Ash Pallet', ap: 1450, rank: 4 },
                      { name: 'Your Ranking', ap: store.arenaPoints, rank: store.arenaPoints >= 2400 ? 1 : store.arenaPoints >= 1950 ? 2 : store.arenaPoints >= 1800 ? 3 : store.arenaPoints >= 1450 ? 4 : 5, active: true },
                    ].map((user) => (
                      <div
                        key={user.name}
                        className={`p-3 rounded-2xl border flex items-center justify-between ${
                          user.active
                            ? 'bg-[#FFCB05]/10 border-[#FFCB05]/30 text-[#FFCB05] font-bold'
                            : 'bg-slate-900/40 border-white/5 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold">
                            #{user.rank}
                          </span>
                          <span>{user.name}</span>
                        </div>
                        <span>{user.ap} AP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roster' && (
              <div className="p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="font-display font-extrabold text-lg tracking-wider text-slate-200">
                      TEAM TRAINER & EVOLUTION LAB
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Spend Poke-Coins to level up stats. Evolve elements when they reach level thresholds to unlock premium forms and ultimate attacks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {store.roster.map((poke) => {
                    const styles = getRarityStyles(poke.rarity);
                    const isActive = store.activeTeamIds.includes(poke.id);
                    const lvlUpCost = poke.level * 150;
                    
                    const evolution = EVOLUTION_CHAINS[poke.name.toLowerCase()];
                    const canEvolve = evolution && poke.level >= evolution.level;
                    const evoCrystalsCost = poke.rarity === 'Common' ? 5 : 12;

                    return (
                      <div
                        key={poke.id}
                        className={`p-5 rounded-2xl bg-gradient-to-b ${styles.bg} border ${styles.border} flex flex-col gap-4 relative overflow-hidden`}
                      >
                        {/* Selected overlay tag */}
                        {isActive && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[9px] font-bold py-0.5 px-2 rounded-full shadow">
                            ACTIVE
                          </div>
                        )}

                        <span className={`absolute top-2 right-2 text-[8px] px-2 py-0.5 rounded font-mono ${styles.badge}`}>
                          {poke.rarity.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-4 mt-2">
                          <img src={poke.image} alt={poke.name} className="w-20 h-20 object-contain" />
                          <div className="flex-1 flex flex-col">
                            <span className="font-bold text-slate-100">{poke.name}</span>
                            <span className="text-xs text-slate-400 font-mono mt-0.5">Level {poke.level}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                              EXP: {poke.exp} / {poke.level * 100}
                            </span>
                            
                            {/* EXP progression bar */}
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${Math.min(100, (poke.exp / (poke.level * 100)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Pokemon stats parameters */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-950/40 p-2.5 rounded-xl text-center font-mono text-[10px] text-slate-300">
                          <div>
                            <div className="text-slate-500 text-[8px]">HP</div>
                            <div className="font-bold">{poke.baseStats.hp}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[8px]">ATTACK</div>
                            <div className="font-bold">{poke.baseStats.attack}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[8px]">DEFENSE</div>
                            <div className="font-bold">{poke.baseStats.defense}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[8px]">SPEED</div>
                            <div className="font-bold">{poke.baseStats.speed}</div>
                          </div>
                        </div>

                        {/* Roster actions */}
                        <div className="flex flex-col gap-2 mt-auto">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => toggleTeamMember(poke.id)}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border clickable ${
                                isActive
                                  ? 'bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-900/10'
                                  : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/10'
                              }`}
                            >
                              {isActive ? 'Deselect Deck' : 'Choose Deck'}
                            </button>

                            <button
                              onClick={() => store.levelUpPokemon(poke.id)}
                              disabled={store.coins < lvlUpCost}
                              className="py-2 px-1 rounded-xl bg-slate-800 border border-slate-700 hover:border-[#FFCB05]/40 hover:bg-slate-700 text-xs font-bold text-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all flex flex-col items-center justify-center clickable"
                            >
                              <span>Upgrade Stat</span>
                              <span className="text-[8px] text-amber-500 font-mono font-normal flex items-center gap-0.5 mt-0.5">
                                <Coins className="w-2.5 h-2.5" />
                                {lvlUpCost}
                              </span>
                            </button>
                          </div>

                          {evolution && (
                            <button
                              onClick={() => store.evolvePokemon(poke.id)}
                              disabled={!canEvolve || store.crystals < evoCrystalsCost}
                              className={`w-full py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border clickable ${
                                canEvolve && store.crystals >= evoCrystalsCost
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white hover:brightness-110'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-500 disabled:opacity-50 disabled:pointer-events-none'
                              }`}
                              title={!canEvolve ? `Requires level ${evolution.level} (current: ${poke.level})` : `Costs ${evoCrystalsCost} Crystals`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>EVOLVE ({evolution.next.toUpperCase()})</span>
                              <span className="font-mono text-[9px] font-normal flex items-center gap-0.5 ml-1">
                                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                {evoCrystalsCost}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items Shop */}
                <div className="lg:col-span-2 p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4">
                  <h2 className="font-display font-extrabold text-lg tracking-wider text-slate-200">
                    ITEM SHOP
                  </h2>
                  <p className="text-xs text-slate-400">
                    Stock up on potions and energy barriers to use inside battle rounds when your Pokémon's HP falls low.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {store.inventory.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-4"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-xs text-slate-200">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{item.description}</span>
                          <span className="text-[10px] text-blue-400 font-mono mt-1 font-semibold">
                            IN BAG: {item.quantity}
                          </span>
                        </div>

                        <button
                          onClick={() => store.buyItem(item.id)}
                          disabled={store.coins < item.price}
                          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-slate-500 border border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all flex flex-col items-center justify-center font-bold text-xs text-slate-100 clickable"
                        >
                          <span>Buy</span>
                          <span className="text-[9px] text-[#FFCB05] font-mono font-normal flex items-center gap-0.5 mt-0.5">
                            <Coins className="w-2.5 h-2.5" />
                            {item.price}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summon Summoning Portal */}
                <div className="p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4 items-center text-center justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-[#FFCB05]/10 border border-[#FFCB05]/20 flex items-center justify-center text-[#FFCB05]">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm tracking-wider text-slate-200 mt-2">
                      SUMMON PORTAL
                    </h3>
                    <p className="text-[11px] text-slate-400 max-w-[240px]">
                      Spend 150 Poke-Coins to summon a random Pokémon from the entire PokéAPI database!
                    </p>
                  </div>

                  {/* Summon result overlay */}
                  <AnimatePresence>
                    {summonedPokemon && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="my-4 p-3 rounded-2xl border border-dashed border-[#FFCB05]/30 bg-[#FFCB05]/5 flex flex-col items-center gap-1.5 w-full"
                      >
                        <img src={summonedPokemon.image} alt={summonedPokemon.name} className="w-16 h-16 object-contain" />
                        <span className="text-xs font-bold text-slate-200">Summoned: {summonedPokemon.name}!</span>
                        <span className="text-[9px] font-mono text-amber-500 uppercase">{summonedPokemon.rarity}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {summonError && (
                    <div className="my-2 text-[10px] font-mono text-red-400 bg-red-950/20 p-2 rounded-xl border border-red-900/30 flex items-center gap-1.5 w-full">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-left leading-tight">{summonError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSummon}
                    disabled={summoning || store.coins < 150}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-slate-950 font-black text-xs tracking-widest uppercase disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 clickable"
                  >
                    {summoning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>SUMMONING...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>SUMMON POKÉMON</span>
                        <span className="font-mono font-normal flex items-center gap-0.5 ml-1 text-[10px] text-slate-900">
                          (150c)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'quests' && (
              <div className="p-6 rounded-[30px] bg-slate-950/20 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="font-display font-extrabold text-lg tracking-wider text-slate-200">
                      DAILY QUEST BOARD
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete daily checklist items by fighting, dealing battle damage, or collecting elements to earn coins.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {store.quests.map((quest) => (
                    <div
                      key={quest.id}
                      className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="font-semibold text-xs text-slate-200">{quest.description}</span>
                        
                        {/* Quest progress slider */}
                        <div className="flex items-center gap-3 w-full max-w-sm">
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                              style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {quest.current} / {quest.target}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => store.claimQuest(quest.id)}
                        disabled={!quest.completed || quest.claimed}
                        className={`py-2 px-5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 clickable ${
                          quest.claimed
                            ? 'bg-slate-800/20 border border-slate-800 text-slate-500 disabled:pointer-events-none'
                            : quest.completed
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 disabled:pointer-events-none'
                        }`}
                      >
                        {quest.claimed ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>CLAIMED</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-3.5 h-3.5" />
                            <span>CLAIM {quest.rewardCoins}c</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BattleArena;
