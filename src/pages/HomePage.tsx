import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { CrtOverlay } from '@/components/game/CrtOverlay';
import { Viewport } from '@/components/game/Viewport';
import { Console } from '@/components/game/Console';
import { DiceOverlay } from '@/components/game/DiceOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ORIGINS, OriginType, ASCII_ART, ENDINGS } from '@/lib/dictionaries';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const status = useGameStore(s => s.status);
  const themeInput = useGameStore(s => s.themeInput);
  const setThemeInput = useGameStore(s => s.setThemeInput);
  const startGame = useGameStore(s => s.startGame);
  const selectOrigin = useGameStore(s => s.selectOrigin);
  const reset = useGameStore(s => s.reset);
  const roomsCleared = useGameStore(s => s.roomsCleared);
  const killCount = useGameStore(s => s.killCount);
  const activeEnding = useGameStore(s => s.activeEnding);
  return (
    <div className="min-h-screen h-screen flex flex-col bg-black text-[#39ff14] font-mono selection:bg-[#39ff14] selection:text-black overflow-hidden relative">
      <CrtOverlay />
      <DiceOverlay />
      <AnimatePresence mode="wait">
        {status === 'START' && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 z-10 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-glow flicker">ABYSSAL<br />TERMINAL</h1>
              <p className="text-lg opacity-80 uppercase tracking-widest font-bold animate-pulse">Grid Protocol v1.5.2</p>
            </div>
            <div className="max-w-md w-full space-y-6">
              <Input value={themeInput} onChange={(e) => setThemeInput(e.target.value)} placeholder="e.g. HAUNTED LIBRARY" className="bg-black border-2 border-[#39ff14] text-[#39ff14] placeholder:text-[#39ff14]/30 rounded-none h-12 text-center text-xl uppercase font-bold" onKeyDown={(e) => e.key === 'Enter' && startGame()} autoFocus />
              <Button onClick={startGame} className="w-full bg-[#39ff14] text-black hover:bg-black hover:text-[#39ff14] border-2 border-[#39ff14] rounded-none h-16 text-xl font-black transition-all hover:scale-[1.02]">[ INITIALIZE SYSTEM ]</Button>
            </div>
          </motion.div>
        )}
        {status === 'ORIGIN_SELECT' && (
          <motion.div key="origin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 z-10 space-y-12">
            <h2 className="text-4xl font-black text-glow uppercase tracking-tighter">SELECT ORIGIN</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
              {(Object.keys(ORIGINS) as OriginType[]).map((key, i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="border-2 border-[#39ff14]/50 p-6 flex flex-col items-center text-center space-y-4 hover:border-[#39ff14] hover:bg-[#39ff14]/5 group cursor-pointer transition-all" onClick={() => selectOrigin(key)}>
                  <h3 className="text-2xl font-black uppercase text-glow">{ORIGINS[key].name}</h3>
                  <p className="text-xs opacity-70 italic">"{ORIGINS[key].desc}"</p>
                  <div className="pt-4 text-[10px] uppercase font-bold text-[#39ff14]">
                    <div className="opacity-60">RELIC: {ORIGINS[key].item}</div>
                    <div className="text-white mt-2 leading-tight">{ORIGINS[key].passive}</div>
                  </div>
                  <Button className="mt-4 w-full bg-[#39ff14] text-black rounded-none font-bold">SELECT</Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {(status === 'PLAYING' || status === 'EVENT') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full"><Viewport /><Console /></motion.div>
        )}
        {status === 'VICTORY' && activeEnding && (
          <motion.div key="victory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center space-y-8">
            <div className="space-y-4">
              <pre className="text-[#39ff14] text-[0.4rem] md:text-xs leading-none whitespace-pre text-glow flicker font-mono mb-8">{ENDINGS[activeEnding].ascii}</pre>
              <h2 className="text-5xl font-black text-glow uppercase tracking-widest">{ENDINGS[activeEnding].title}</h2>
              <p className="max-w-2xl mx-auto text-lg leading-relaxed opacity-90">{ENDINGS[activeEnding].prose}</p>
            </div>
            <div className="space-y-2 border-t-2 border-[#39ff14]/30 pt-4 text-sm font-bold uppercase">
              <p>Sectors Conquered: {roomsCleared}</p>
              <p>Units Terminated: {killCount}</p>
              <p className="text-white text-glow mt-4 tracking-[0.3em] animate-pulse">Biological Signature: EVOLVED</p>
            </div>
            <Button onClick={reset} className="px-16 py-8 bg-[#39ff14] text-black border-2 border-[#39ff14] rounded-none text-2xl font-black shadow-[0_0_20px_#39ff14] hover:scale-110 transition-transform">[ REBOOT SYSTEM ]</Button>
          </motion.div>
        )}
        {status === 'GAMEOVER' && (
          <motion.div key="gameover" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 z-10 space-y-8">
            <pre className="text-[#39ff14] text-[0.4rem] md:text-xs leading-none whitespace-pre text-glow flicker font-mono mb-8 opacity-80">{ASCII_ART.GAMEOVER}</pre>
            <div className="space-y-4 text-2xl font-black tracking-widest uppercase">
              <p className="opacity-50">Sectors Explored: <span className="text-white text-glow">{roomsCleared}</span></p>
              <p className="text-red-500 animate-pulse text-3xl">Biological Unit Terminated</p>
            </div>
            <Button onClick={reset} className="px-16 py-8 bg-[#39ff14] text-black border-2 border-[#39ff14] rounded-none text-2xl font-black hover:scale-110 transition-transform">[ REBOOT SYSTEM ]</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}