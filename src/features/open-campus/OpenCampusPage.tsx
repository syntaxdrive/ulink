import { useState, useCallback, useEffect, useRef } from 'react';
import { Story } from 'inkjs';
import {
  Gamepad2, Trophy, Package, X, Heart, Swords, MapPin,
  ChevronRight, ArrowLeft, Sparkles, Shield, Zap
} from 'lucide-react';
import {
  type ZoneName, ZONES, ASSETS, ZONE_CONFIG,
  COLLECTIBLE_ITEMS, ENEMY_SPAWNS, CAMPUS_SIGNS, type DialogueLine, type EnemyDef
} from './gameData';

type GameScreen = 'map' | 'zone' | 'dialogue' | 'combat' | 'victory';

interface CombatState {
  enemy: EnemyDef;
  enemyHp: number;
  playerHp: number;
  log: string[];
  turn: 'player' | 'enemy' | 'won' | 'lost';
  shakeEnemy: boolean;
  shakePlayer: boolean;
}

const ZONE_ENEMIES: Record<ZoneName, EnemyDef[]> = {
  Library: ENEMY_SPAWNS.filter(e => e.name === 'Instagram Crawler' || e.name === 'Syntax Error'),
  Lab: ENEMY_SPAWNS.filter(e => e.name === 'Assignment Ghost' || e.name === 'NullPointerException'),
  Cafeteria: ENEMY_SPAWNS.filter(e => e.name === 'TikTok Demon'),
  Gym: ENEMY_SPAWNS.filter(e => e.name === 'Netflix Phantom' || e.name === 'Final Exam Wraith'),
  Dorm: ENEMY_SPAWNS.filter(e => e.name === 'Final Exam Wraith' || e.name === 'TikTok Demon'),
};

export default function OpenCampusPage() {
  const [screen, setScreen] = useState<GameScreen>('map');
  const [currentZone, setCurrentZone] = useState<ZoneName | null>(null);
  const [xp, setXp] = useState(0);
  const [hp, setHp] = useState(5);
  const [maxHp] = useState(5);
  const [inventory, setInventory] = useState<string[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  // Derived Ink state
  const [routerFound, setRouterFound] = useState(false);
  const [cryptoStopped, setCryptoStopped] = useState(false);
  const [energyDrink, setEnergyDrink] = useState(false);
  const [passwordKnown, setPasswordKnown] = useState(false);
  const [dejiStopped, setDejiStopped] = useState(false);

  const completedCount = [routerFound, cryptoStopped, energyDrink, passwordKnown, dejiStopped].filter(Boolean).length;
  const allComplete = completedCount === 5;

  // Ink Story Ref
  const storyRef = useRef<InstanceType<typeof Story> | null>(null);
  
  // Dialogue UI
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [choices, setChoices] = useState<{text: string, index: number}[]>([]);

  // Combat
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [pendingInkCombat, setPendingInkCombat] = useState(false);

  // Toast
  const [toast, setToast] = useState<{msg: string, type: 'item'|'xp'|'damage'} | null>(null);

  const showToast = useCallback((msg: string, type: 'item'|'xp'|'damage') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 1. Initial Load of the Ink Story
  useEffect(() => {
    fetch('/stories/wifi_outage.json')
      .then(r => r.text())
      .then(json => {
        storyRef.current = new Story(json);
      })
      .catch(e => console.error("Failed to load ink story:", e));
  }, []);

  // Update React states from Ink variables
  const syncInkVariables = useCallback(() => {
    const s = storyRef.current;
    if (!s) return;
    setRouterFound(!!s.variablesState['router_found']);
    setCryptoStopped(!!s.variablesState['crypto_stopped']);
    setEnergyDrink(!!s.variablesState['energy_drink']);
    setPasswordKnown(!!s.variablesState['password_known']);
    setDejiStopped(!!s.variablesState['deji_stopped']);
  }, []);

  // 2. Play Ink lines until a choice
  const pullInkLines = useCallback(() => {
    if (!storyRef.current) return;
    const s = storyRef.current;
    
    const lines: DialogueLine[] = [];
    let shouldCombat = false;

    while (s.canContinue) {
      const text = s.Continue()?.trim();
      
      const tags = s.currentTags || [];
      tags.forEach(t => {
        if (t.startsWith('xp_')) {
          const val = parseInt(t.split('_')[1]);
          setXp(x => x + val);
          showToast(`+${val} XP!`, 'xp');
        } else if (t.startsWith('hp_')) {
          const val = parseInt(t.split('_')[1]);
          setHp(h => Math.max(0, Math.min(maxHp, h + val)));
          if (val < 0) showToast(`Ouch! ${val} HP`, 'damage');
        } else if (t.startsWith('item_')) {
          const item = t.split('_').slice(1).join(' ');
          setInventory(prev => [...prev, item]);
          showToast(`Got item: ${item}`, 'item');
        } else if (t.startsWith('trigger_combat_')) {
          shouldCombat = true;
        }
      });

      syncInkVariables();

      if (text) {
        let speaker = 'System';
        let content = text;
        const match = text.match(/^([^:]+):\s*(.*)$/);
        if (match) {
          speaker = match[1].trim();
          content = match[2].trim();
        } else if (text.startsWith('(') && text.endsWith(')')) {
          speaker = 'System';
        } else {
          speaker = 'System';
        }
        lines.push({ speaker, text: content });
      }
    }

    if (lines.length > 0) {
      setDialogueLines(lines);
      setDialogueIdx(0);
      setChoices([]);
    }

    if (shouldCombat) {
      setPendingInkCombat(true);
    } else if (lines.length === 0 && s.currentChoices.length > 0) {
      setChoices(s.currentChoices.map(c => ({ text: c.text, index: c.index })));
    } else if (lines.length === 0 && s.currentChoices.length === 0) {
      // Scene over
      if (allComplete) {
        setScreen('victory');
      } else {
        setScreen('zone');
      }
    }
  }, [maxHp, showToast, syncInkVariables, allComplete]);

  // Next Line or Choices
  const handleAdvanceDialogue = useCallback(() => {
    if (dialogueIdx < dialogueLines.length - 1) {
      setDialogueIdx(i => i + 1);
    } else {
      // End of this chunk of lines
      if (pendingInkCombat && currentZone) {
        setPendingInkCombat(false);
        startCombat(currentZone);
        return;
      }
      
      if (!storyRef.current) return;
      const s = storyRef.current;
      if (s.currentChoices.length > 0) {
        setChoices(s.currentChoices.map(c => ({ text: c.text, index: c.index })));
      } else {
        // No choices? Pull more text or end
        if (s.canContinue) pullInkLines();
        else {
           if (dejiStopped && passwordKnown && energyDrink && cryptoStopped && routerFound) {
               setScreen('victory');
           } else {
               setScreen('zone');
           }
        }
      }
    }
  }, [dialogueIdx, dialogueLines.length, pendingInkCombat, currentZone, pullInkLines, dejiStopped, passwordKnown, energyDrink, cryptoStopped, routerFound]);

  const handleChoice = useCallback((idx: number) => {
    if (!storyRef.current) return;
    storyRef.current.ChooseChoiceIndex(idx);
    setChoices([]);
    setDialogueLines([]);
    pullInkLines();
  }, [pullInkLines]);

  // Space/Enter advancement
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (screen === 'dialogue' && choices.length === 0 && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleAdvanceDialogue();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, choices.length, handleAdvanceDialogue]);


  const enterZone = useCallback((zone: ZoneName) => {
    setCurrentZone(zone);
    setScreen('zone');
  }, []);

  const startDialogue = useCallback((zone: ZoneName) => {
    if (!storyRef.current) return;
    // Jump to the knot named by the zone (lowercase)
    storyRef.current.ChoosePathString(zone.toLowerCase());
    pullInkLines();
    setScreen('dialogue');
  }, [pullInkLines]);

  const startCombat = useCallback((zone: ZoneName) => {
    const enemies = ZONE_ENEMIES[zone] || ENEMY_SPAWNS.slice(0, 1);
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    setCombat({
      enemy,
      enemyHp: enemy.hp,
      playerHp: hp,
      log: [`⚔️ A wild ${enemy.name} appeared!`],
      turn: 'player',
      shakeEnemy: false,
      shakePlayer: false,
    });
    setScreen('combat');
  }, [hp]);

  const combatAttack = useCallback(() => {
    if (!combat || combat.turn !== 'player') return;
    const dmg = 1 + Math.floor(Math.random() * 2);
    const newEnemyHp = Math.max(0, combat.enemyHp - dmg);
    const log = [...combat.log, `🗡️ You hit ${combat.enemy.name} for ${dmg} damage!`];

    setCombat({ ...combat, enemyHp: newEnemyHp, log, turn: 'enemy', shakeEnemy: true, shakePlayer: false });

    if (newEnemyHp <= 0) {
      setTimeout(() => {
        setCombat(prev => prev ? { ...prev, turn: 'won', log: [...prev.log, `💀 ${combat.enemy.name} defeated!`], shakeEnemy: false } : null);
        setXp(x => x + 15);
        setEnemiesDefeated(k => k + 1);
        showToast(`Defeated ${combat.enemy.name}! +15 XP`, 'xp');
      }, 600);
    } else {
      setTimeout(() => {
        const eDmg = Math.random() > 0.4 ? 1 : 0;
        const newPlayerHp = Math.max(0, (combat.playerHp) - eDmg);
        const elog = eDmg > 0 ? `👾 ${combat.enemy.name} hits you for ${eDmg}!` : `💨 ${combat.enemy.name} missed!`;
        setCombat(prev => prev ? {
          ...prev, playerHp: newPlayerHp, log: [...prev.log, elog],
          turn: newPlayerHp <= 0 ? 'lost' : 'player', shakeEnemy: false, shakePlayer: eDmg > 0,
        } : null);
        if (eDmg > 0) setHp(h => Math.max(0, h - eDmg));
      }, 800);
    }
  }, [combat, showToast]);

  const combatDodge = useCallback(() => {
    if (!combat || combat.turn !== 'player') return;
    const dodged = Math.random() > 0.3;
    if (dodged) {
      setCombat({ ...combat, log: [...combat.log, '💨 You dodge and heal 1 HP!'], turn: 'enemy', shakeEnemy: false, shakePlayer: false });
      setHp(h => Math.min(maxHp, h + 1));
      setTimeout(() => {
        const eDmg = Math.random() > 0.6 ? 1 : 0;
        const elog = eDmg > 0 ? `👾 ${combat.enemy.name} hits you for ${eDmg}!` : `💨 ${combat.enemy.name} missed!`;
        setCombat(prev => prev ? { ...prev, playerHp: Math.max(0, prev.playerHp - eDmg), log: [...prev.log, elog], turn: 'player', shakePlayer: eDmg > 0 } : null);
        if (eDmg > 0) setHp(h => Math.max(0, h - eDmg));
      }, 800);
    } else {
      setCombat({ ...combat, log: [...combat.log, '😬 Dodge failed!'], turn: 'enemy', shakePlayer: false, shakeEnemy: false });
      setTimeout(() => {
        setCombat(prev => prev ? { ...prev, playerHp: Math.max(0, prev.playerHp - 1), log: [...prev.log, `👾 ${combat.enemy.name} hits you for 1!`], turn: prev.playerHp - 1 <= 0 ? 'lost' : 'player', shakePlayer: true } : null);
        setHp(h => Math.max(0, h - 1));
      }, 800);
    }
  }, [combat, maxHp]);

  const exitCombat = useCallback(() => {
    setCombat(null);
    // If we won via ink trigger, we bounce right back to dialogue!
    if (dialogueLines.length === 0 && (!storyRef.current?.currentChoices.length)) {
        pullInkLines();
        if (dialogueLines.length > 0 || choices.length > 0) {
            setScreen('dialogue');
            return;
        }
    }
    setScreen(currentZone ? 'zone' : 'map');
  }, [currentZone, dialogueLines.length, choices.length, pullInkLines]);

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 pb-28">
      {/* Header */}
      <header className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-500" />
              The Great WiFi Outage
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              An interactive campus adventure powered by Ink — Your choices matter!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowInventory(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5" /> {inventory.length}
            </button>
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold">
              <Swords className="w-3.5 h-3.5" /> {enemiesDefeated}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" /> {xp} XP
            </span>
            <span className="flex items-center gap-0.5 px-3 py-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-xs font-bold">
              {Array.from({ length: maxHp }).map((_, i) => (
                <Heart key={i} className={`w-3.5 h-3.5 ${i < hp ? 'text-red-500 fill-red-500' : 'text-zinc-300 dark:text-zinc-600'}`} />
              ))}
            </span>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-2xl border animate-bounce ${toast.type === 'damage' ? 'bg-red-600 border-red-400' : toast.type === 'item' ? 'bg-indigo-600 border-indigo-400' : 'bg-yellow-600 border-yellow-400'}`}>
          {toast.msg}
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowInventory(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white"><Package className="w-5 h-5 text-indigo-500" /> Inventory</h2>
              <button onClick={() => setShowInventory(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {inventory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No items yet. Keep exploring!</p>
            ) : (
              <div className="space-y-2">
                {inventory.map((item, i) => {
                  const def = COLLECTIBLE_ITEMS.find(ci => item.includes(ci.name));
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                      <span className="text-2xl">{def?.emoji || '📦'}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{def?.name || item}</div>
                        <div className="text-xs text-slate-500 dark:text-zinc-400">{def?.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAP SCREEN ─────────────────────────────────────────────────────── */}
      {screen === 'map' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl">
            <img src={ASSETS.campusMap} alt="Campus Map" className="w-full h-64 md:h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">UniLink Campus — Choose a building to explore</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-red-400 font-bold animate-pulse">📵 WiFi Status: OFFLINE</span>
                {allComplete && <span className="text-xs text-emerald-400 font-bold">✅ WiFi Status: RESTORED!</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ZONES.map(zone => {
              const cfg = ZONE_CONFIG[zone];
              let isComplete = false;
              if (zone === 'Library') isComplete = routerFound;
              if (zone === 'Lab') isComplete = cryptoStopped;
              if (zone === 'Cafeteria') isComplete = energyDrink;
              if (zone === 'Gym') isComplete = passwordKnown;
              if (zone === 'Dorm') isComplete = dejiStopped;
              
              return (
                <button
                  key={zone}
                  onClick={() => enterZone(zone)}
                  className={`relative text-left rounded-2xl border p-4 transition-all duration-300 group overflow-hidden ${
                    isComplete
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:shadow-lg hover:scale-[1.02]'
                      : 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 hover:shadow-lg hover:scale-[1.02] hover:border-yellow-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-slate-900 dark:text-white">{zone}</div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                         {isComplete ? 'Resolved! Nothing left to do here.' : 'Someone here might know why the WiFi is down.'}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isComplete ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                          : 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {isComplete ? '✅ Complete' : '⭐ Active Zone'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mt-1 transition-colors" />
                  </div>
                </button>
              );
            })}

            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 p-4 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="text-xs font-bold text-slate-500 dark:text-zinc-500 mb-2">📋 Campus Bulletin Board</div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed italic">
                {CAMPUS_SIGNS[Math.floor(Math.random() * CAMPUS_SIGNS.length)]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ZONE SCREEN ────────────────────────────────────────────────────── */}
      {screen === 'zone' && currentZone && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => { setScreen('map'); setCurrentZone(null); }} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Campus Map
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg">
              <div className={`h-3 bg-gradient-to-r ${ZONE_CONFIG[currentZone].gradient}`} />
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div className="shrink-0">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl ring-2 ring-slate-200 dark:ring-zinc-700">
                      <img src={ASSETS.npcs[currentZone]} alt="NPC" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{ZONE_CONFIG[currentZone].emoji}</span>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentZone}</h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startDialogue(currentZone)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        💬 Talk / Explore
                      </button>
                      <button
                        onClick={() => startCombat(currentZone)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        ⚔️ Grinding (Fight Monsters)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white dark:border-zinc-700 shadow-md">
                    <img src={ASSETS.player} alt="You" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">You (Freshman)</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">WiFi Restoration Hero</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg py-1.5">
                    <div className="text-sm font-black text-yellow-700 dark:text-yellow-300">{xp}</div>
                    <div className="text-[9px] text-yellow-600/70">XP</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg py-1.5">
                    <div className="text-sm font-black text-red-700 dark:text-red-300">{enemiesDefeated}</div>
                    <div className="text-[9px] text-red-600/70">Kills</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DIALOGUE SCREEN ────────────────────────────────────────────────── */}
      {screen === 'dialogue' && currentZone && dialogueLines.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl">
            <div className={`px-6 py-3 bg-gradient-to-r ${ZONE_CONFIG[currentZone].gradient} text-white flex items-center gap-2`}>
              <span className="text-lg">{ZONE_CONFIG[currentZone].emoji}</span>
              <span className="font-black text-sm">{currentZone}</span>
            </div>

            <div className="p-6">
              <div className="flex items-end justify-center gap-6 mb-6">
                <div className={`transition-all duration-300 ${dialogueLines[dialogueIdx]?.speaker === 'You' ? 'scale-110 opacity-100' : 'scale-95 opacity-60'}`}>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-emerald-400 shadow-xl">
                    <img src={ASSETS.player} alt="You" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center text-xs font-bold text-slate-900 dark:text-white mt-1">You</div>
                </div>
                <div className={`transition-all duration-300 ${dialogueLines[dialogueIdx]?.speaker !== 'You' && dialogueLines[dialogueIdx]?.speaker !== 'System' ? 'scale-110 opacity-100' : 'scale-95 opacity-60'}`}>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-xl">
                    <img src={ASSETS.npcs[currentZone]} alt="NPC" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center text-xs font-bold text-slate-900 dark:text-white mt-1">{dialogueLines[dialogueIdx]?.speaker}</div>
                </div>
              </div>

              {/* Dialogue Bubble */}
              {choices.length === 0 ? (
                <div onClick={handleAdvanceDialogue} className="cursor-pointer bg-slate-50 dark:bg-zinc-800 rounded-2xl p-5 border border-slate-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors relative min-h-[140px]">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0">💬</span>
                    <div className="flex-1">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        {dialogueLines[dialogueIdx]?.speaker}
                      </div>
                      <div className="text-sm md:text-lg text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                        {dialogueLines[dialogueIdx]?.text}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 text-[10px] text-emerald-500 font-mono animate-pulse">
                    ▼ Click or Space
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-5 border border-slate-200 dark:border-zinc-700 mb-6">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        {dialogueLines[dialogueIdx]?.speaker}
                      </div>
                      <div className="text-sm md:text-lg text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                        {dialogueLines[dialogueIdx]?.text}
                      </div>
                  </div>
                  {choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(c.index)}
                      className="w-full text-left px-5 py-4 rounded-xl border border-slate-300 dark:border-zinc-600 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-3 group"
                    >
                      <span className="text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity">➔</span>
                      {c.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COMBAT SCREEN ──────────────────────────────────────────────────── */}
      {screen === 'combat' && combat && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-2xl border border-red-300 dark:border-red-900 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl">
            <div className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white flex items-center gap-2">
              <Swords className="w-4 h-4" />
              <span className="font-black text-sm">⚔️ Combat!</span>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className={`text-center transition-transform duration-200 ${combat.shakePlayer ? 'animate-pulse scale-95' : ''}`}>
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-emerald-400 shadow-lg mx-auto">
                    <img src={ASSETS.player} alt="You" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">You</div>
                </div>

                <div className="text-3xl font-black text-red-500 animate-pulse">⚡VS⚡</div>

                <div className={`text-center transition-transform duration-200 ${combat.shakeEnemy ? 'animate-pulse scale-95' : ''}`}>
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-red-100 dark:bg-red-900/30 border-4 border-red-400 shadow-lg mx-auto flex items-center justify-center">
                    <span className="text-5xl">👾</span>
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">{combat.enemy.name}</div>
                  <div className="w-24 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1 mx-auto">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${(combat.enemyHp / combat.enemy.hp) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 border border-slate-100 dark:border-zinc-700 h-28 overflow-y-auto mb-4 font-mono text-sm shadow-inner flex flex-col-reverse">
                {[...combat.log].reverse().map((line, i) => (
                  <div key={i} className={`py-1 ${i === 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-zinc-500 opacity-80'}`}>
                    {line}
                  </div>
                ))}
              </div>

              {combat.turn === 'player' && (
                <div className="flex gap-3 justify-center">
                  <button onClick={combatAttack} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg hover:scale-105 transition-all">
                    <Zap className="w-4 h-4" /> Attack
                  </button>
                  <button onClick={combatDodge} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg hover:scale-105 transition-all">
                    <Shield className="w-4 h-4" /> Dodge & Heal
                  </button>
                </div>
              )}
              {combat.turn === 'enemy' && (
                <div className="text-center text-sm text-slate-500 animate-pulse font-medium">Enemy is attacking...</div>
              )}
              {(combat.turn === 'won' || combat.turn === 'lost') && (
                <div className="text-center space-y-3">
                  <div className={`text-xl font-black ${combat.turn === 'won' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {combat.turn === 'won' ? '🎉 Victory! +15 XP' : '💀 Defeated...'}
                  </div>
                  <button onClick={exitCombat} className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-lg hover:scale-105 transition-all">
                    Continue Adventure
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VICTORY SCREEN ─────────────────────────────────────────────────── */}
      {screen === 'victory' && (
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-50 duration-700">
          <div className="rounded-2xl border border-yellow-300 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-8 shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-3xl font-black text-yellow-700 dark:text-yellow-300 mb-2">WiFi Restored!</h2>
            <p className="text-sm text-yellow-700/80 dark:text-yellow-300/80 mb-6 max-w-md mx-auto leading-relaxed">
              You saved UniLink Campus from The Great WiFi Outage of 2026! Students can finally stop reading books. The internet rejoices!
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/60 dark:bg-zinc-800/60 rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-black text-yellow-700 dark:text-yellow-300">{xp}</div>
                <div className="text-xs text-yellow-600/70 font-bold uppercase tracking-wider mt-1">Total XP</div>
              </div>
              <div className="bg-white/60 dark:bg-zinc-800/60 rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-black text-red-600 dark:text-red-400">{enemiesDefeated}</div>
                <div className="text-xs text-red-600/70 font-bold uppercase tracking-wider mt-1">Monsters Slain</div>
              </div>
              <div className="bg-white/60 dark:bg-zinc-800/60 rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{inventory.length}</div>
                <div className="text-xs text-indigo-600/70 font-bold uppercase tracking-wider mt-1">Items Collected</div>
              </div>
            </div>
            <button
              onClick={() => setScreen('map')}
              className="px-8 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-lg hover:scale-105 transition-all text-lg"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Return to Campus Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
