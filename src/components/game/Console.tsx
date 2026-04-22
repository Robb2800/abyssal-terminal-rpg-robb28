import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { ChevronUp, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Skull } from 'lucide-react';
import { ORIGINS } from '@/lib/dictionaries';
import { cn } from "@/lib/utils";
export function Console() {
  const logs = useGameStore(s => s.logs);
  const currentEncounter = useGameStore(s => s.currentEncounter);
  const currentEvent = useGameStore(s => s.currentEvent);
  const isRolling = useGameStore(s => s.isRolling);
  const pos = useGameStore(s => s.position);
  const status = useGameStore(s => s.status);
  const origin = useGameStore(s => s.origin);
  const relicCooldown = useGameStore(s => s.relicCooldown);
  const bossPhase = useGameStore(s => s.bossPhase);
  const attack = useGameStore(s => s.attack);
  const defend = useGameStore(s => s.defend);
  const useRelic = useGameStore(s => s.useRelic);
  const move = useGameStore(s => s.move);
  const searchRoom = useGameStore(s => s.searchRoom);
  const rest = useGameStore(s => s.rest);
  const resolveEvent = useGameStore(s => s.resolveEvent);
  const resolveEnding = useGameStore(s => s.resolveEnding);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  const originData = origin ? ORIGINS[origin] : null;
  return (
    <div className="h-[40%] w-full flex flex-col bg-black p-4 overflow-hidden border-t-2 border-[#39ff14]/10">
      <div className="flex-1 overflow-y-auto mb-4 font-mono text-xs scrollbar-thin">
        {logs.slice(-50).map((log, i) => (
          <div key={i} className="py-0.5"><span className="opacity-20 mr-2">[{i.toString().padStart(3, '0')}]</span>{log}</div>
        ))}
        <div ref={scrollRef} />
      </div>
      {status === 'EVENT' && currentEncounter?.name === 'ABYSSAL OVERSEER' && bossPhase === 3 ? (
        <div className="absolute inset-0 z-20 bg-black/95 flex flex-col p-8 border-2 border-[#39ff14] m-4">
          <h3 className="text-3xl font-black text-glow text-center mb-6 uppercase">FINAL TRANSACTION</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => resolveEnding('THRONE')} className="h-24 bg-black border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black">
              TAKE THE THRONE
            </Button>
            <Button onClick={() => resolveEnding('DESTRUCTION')} className="h-24 bg-black border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black">
              DESTROY CORE
            </Button>
            <Button onClick={() => resolveEnding('ESCAPE')} className="h-24 bg-black border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black">
              TRUE ESCAPE
            </Button>
          </div>
        </div>
      ) : status === 'EVENT' && currentEvent && (
        <div className="absolute inset-0 z-20 bg-black/95 flex flex-col p-8 border-2 border-[#39ff14] m-4 animate-scale-in">
          <h3 className="text-2xl font-black text-glow uppercase text-center mb-4">{currentEvent.title}</h3>
          <p className="flex-1 text-sm leading-relaxed">{currentEvent.prose}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {currentEvent.choices.map(c => (
              <Button key={c.id} onClick={() => resolveEvent(c.id)} className="h-16 bg-black border-2 border-[#39ff14] text-[#39ff14] rounded-none flex flex-col hover:bg-[#39ff14] hover:text-black">
                <span className="font-bold uppercase">{c.text}</span>
                <span className="text-[8px] opacity-60">{c.consequence}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#39ff14]/30">
        {currentEncounter ? (
          <>
            <Button onClick={attack} disabled={isRolling} className="bg-[#39ff14] text-black border-2 border-[#39ff14] rounded-none h-12 font-bold uppercase hover:bg-black hover:text-[#39ff14]">[ ATTACK ]</Button>
            <Button onClick={defend} disabled={isRolling} className="bg-black text-[#39ff14] border-2 border-[#39ff14] rounded-none h-12 font-bold uppercase hover:bg-[#39ff14] hover:text-black">[ DEFEND ]</Button>
            <Button onClick={useRelic} disabled={isRolling || relicCooldown > 0} className={cn("rounded-none h-12 font-bold uppercase border-2", relicCooldown > 0 ? "border-red-900 text-red-900 bg-black/50" : "border-blue-500 text-blue-500 bg-black hover:bg-blue-500 hover:text-white")}>
              {relicCooldown > 0 ? `CD: ${relicCooldown}` : `[ ${originData?.item.toUpperCase() || 'RELIC'} ]`}
            </Button>
            <Button disabled className="bg-black/20 text-[#39ff14]/20 border-2 border-[#39ff14]/10 rounded-none h-12 font-bold uppercase">[ LOCKED ]</Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1 md:col-span-1 border border-[#39ff14]/20 p-1 bg-black/50">
              <div/><Button onClick={() => move(0, -1)} disabled={isRolling || pos.y === 0} className="h-10 bg-black border border-[#39ff14]/50 p-0"><ArrowUp size={14}/></Button><div/>
              <Button onClick={() => move(-1, 0)} disabled={isRolling || pos.x === 0} className="h-10 bg-black border border-[#39ff14]/50 p-0"><ArrowLeft size={14}/></Button>
              <Button onClick={() => move(0, 1)} disabled={isRolling || pos.y === 4} className="h-10 bg-black border border-[#39ff14]/50 p-0"><ArrowDown size={14}/></Button>
              <Button onClick={() => move(1, 0)} disabled={isRolling || pos.x === 4} className="h-10 bg-black border border-[#39ff14]/50 p-0"><ArrowRight size={14}/></Button>
            </div>
            <Button onClick={searchRoom} disabled={isRolling} className="bg-black text-[#39ff14] border-2 border-[#39ff14] rounded-none h-12 font-bold uppercase hover:bg-[#39ff14] hover:text-black">[ SEARCH ]</Button>
            <Button onClick={rest} disabled={isRolling} className="bg-black text-yellow-400 border-2 border-yellow-400 rounded-none h-12 font-bold uppercase hover:bg-yellow-400 hover:text-black">[ REST ]</Button>
            <Button onClick={useRelic} disabled={isRolling || relicCooldown > 0 || origin !== 'collector'} className={cn("rounded-none h-12 font-bold uppercase border-2", origin !== 'collector' ? "opacity-20 cursor-not-allowed" : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white")}>[ RE-ROLL ]</Button>
          </>
        )}
      </div>
    </div>
  );
}