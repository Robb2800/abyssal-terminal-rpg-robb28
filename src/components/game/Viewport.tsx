import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { MAP_SYMBOLS, ORIGINS, INTENT_TYPES } from '@/lib/dictionaries';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Zap, Target } from 'lucide-react';
export function Viewport() {
  const playerHp = useGameStore(s => s.playerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const mana = useGameStore(s => s.mana);
  const maxMana = useGameStore(s => s.maxMana);
  const strength = useGameStore(s => s.strength);
  const agility = useGameStore(s => s.agility);
  const origin = useGameStore(s => s.origin);
  const inventory = useGameStore(s => s.inventory);
  const currentAscii = useGameStore(s => s.currentAscii);
  const currentEncounter = useGameStore(s => s.currentEncounter);
  const grid = useGameStore(s => s.grid);
  const position = useGameStore(s => s.position);
  const bossPhase = useGameStore(s => s.bossPhase);
  const originData = origin ? ORIGINS[origin] : null;
  return (
    <div className="h-[60%] w-full flex flex-col border-b-2 border-[#39ff14]/50 relative overflow-hidden bg-[#050505]">
      <div className="grid grid-cols-2 md:grid-cols-3 items-center px-6 py-4 border-b border-[#39ff14]/20 text-xs font-bold tracking-widest">
        <div className="space-y-2">
          <div className="flex gap-4 items-center">
            <span className="w-8">HP:</span>
            <div className="w-24 md:w-32 h-2 border border-[#39ff14] p-0.5">
              <div className="h-full bg-[#39ff14]" style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} />
            </div>
            <span className="tabular-nums">{playerHp}/{playerMaxHp}</span>
          </div>
          {originData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-[#39ff14] cursor-help">
                    <Zap size={14} className="animate-pulse" />
                    <span className="text-glow underline underline-offset-4">{originData.item.toUpperCase()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black border-2 border-[#39ff14] text-[#39ff14] font-mono rounded-none">
                  <p className="font-bold">{originData.passive}</p>
                  <p className="text-[10px] opacity-70 mt-1">{originData.active}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="hidden md:flex flex-col items-center gap-1 text-[10px] uppercase">
          <div className="text-[#39ff14] font-bold">{originData?.name || 'UNKNOWN'}</div>
          <div className="flex gap-4">
            <div className="opacity-60">STR: {strength}</div>
            <div className="opacity-60">AGI: {agility}</div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-4">
          <div className="flex flex-col border border-[#39ff14]/30 p-1 bg-black/40 scale-75 md:scale-90 origin-right">
            {grid.map((row, y) => (
              <div key={y} className="flex leading-none">
                {row.map((cell, x) => {
                  const isPlayer = position.x === x && position.y === y;
                  let char = MAP_SYMBOLS.UNEXPLORED;
                  if (isPlayer) char = MAP_SYMBOLS.PLAYER;
                  else if (cell.explored) {
                    if (cell.type === 'boss') char = MAP_SYMBOLS.BOSS;
                    else if (cell.type === 'event') char = MAP_SYMBOLS.EVENT;
                    else if (cell.type === 'treasure') char = MAP_SYMBOLS.TREASURE;
                    else char = MAP_SYMBOLS.EXPLORED;
                  }
                  return (
                    <span key={x} className={cn(
                      "text-[8px] md:text-[10px] p-0.5 font-mono",
                      isPlayer ? "text-white text-glow font-black" : "text-[#39ff14]/40",
                      cell.explored && !isPlayer && "text-[#39ff14]"
                    )}>{char}</span>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="text-right text-xs">
            LOC: <span className="text-glow">[{position.x},{position.y}]</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <pre className="text-[#39ff14] text-[0.6rem] md:text-sm leading-none whitespace-pre text-glow flicker font-mono animate-pulse-slow">
          {currentAscii}
        </pre>
        {currentEncounter && (
          <div className="mt-8 text-center space-y-2 max-w-sm w-full">
            <div className="text-xl font-bold uppercase tracking-widest">{currentEncounter.name}</div>
            {currentEncounter.name === 'ABYSSAL OVERSEER' && (
              <div className="flex justify-center gap-1 mb-1">
                {[1, 2, 3].map(p => (
                  <div key={p} className={cn("w-full h-1.5 border border-[#39ff14]/30", p <= bossPhase ? "bg-[#39ff14]" : "bg-black")} />
                ))}
              </div>
            )}
            <div className="w-full h-2 bg-[#39ff14]/20 border border-[#39ff14]/50 p-0.5">
               <div className="h-full bg-[#39ff14] shadow-[0_0_10px_#39ff14]" style={{ width: `${(currentEncounter.hp / currentEncounter.maxHp) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tighter">
              <span className={cn(INTENT_TYPES[currentEncounter.intent].color, "animate-pulse")}>
                NEXT: [{currentEncounter.nextMove.toUpperCase()}]
              </span>
              <span className="opacity-60">{currentEncounter.revealed ? `HP: ${currentEncounter.hp}/${currentEncounter.maxHp}` : 'HP: ???'}</span>
            </div>
            {currentEncounter.futureMoves && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {currentEncounter.futureMoves.map((m, i) => (
                  <div key={i} className="text-[8px] border border-[#39ff14]/20 p-1 opacity-50 uppercase">{m}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}