import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
export function DiceOverlay() {
  const isRolling = useGameStore(s => s.isRolling);
  const lastRoll = useGameStore(s => s.lastRoll);
  const rollLabel = useGameStore(s => s.rollLabel);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Procedural Sound Effects Management
  useEffect(() => {
    if (isRolling) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const playClick = (time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150 + Math.random() * 100, time);
        osc.frequency.exponentialRampToValueAtTime(10, time + 0.1);
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
      };
      for (let i = 0; i < 10; i++) {
        playClick(ctx.currentTime + i * 0.1);
      }
    }
    return () => {
      // We keep the context open to avoid overhead, but could close on unmount if needed
    };
  }, [isRolling]);
  return (
    <AnimatePresence mode="wait">
      {isRolling && (
        <motion.div
          key="rolling-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotateX: [0, 360], rotateY: [0, 360], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-[#39ff14] flex items-center justify-center relative mb-6 shadow-[0_0_20px_#39ff14]"
            >
              <span className="text-4xl font-bold text-glow">?</span>
              <div className="absolute inset-0 border-2 border-[#39ff14]/30 rotate-45 scale-75" />
            </motion.div>
            <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#39ff14] text-glow animate-pulse">
              ROLLING {rollLabel}...
            </div>
          </div>
        </motion.div>
      )}
      {!isRolling && lastRoll > 0 && (
        <motion.div
          key={`roll-result-${lastRoll}`}
          initial={{ scale: 3, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[200] pointer-events-none text-center"
        >
          <div 
            className={`text-9xl font-black text-glow mb-4 filter drop-shadow-[0_0_15px_rgba(57,255,20,0.8)] ${
              lastRoll === 20 ? 'text-green-400' : lastRoll === 1 ? 'text-red-600' : 'text-[#39ff14]'
            }`}
          >
            {lastRoll}
          </div>
          <div className="bg-black/80 px-4 py-2 border border-[#39ff14]/50">
            {lastRoll === 20 && <div className="text-2xl font-bold animate-bounce text-green-400">CRITICAL SUCCESS</div>}
            {lastRoll === 1 && <div className="text-2xl font-bold animate-pulse text-red-500">CRITICAL FAILURE</div>}
            {lastRoll > 1 && lastRoll < 20 && <div className="text-xl font-bold tracking-widest text-[#39ff14] uppercase">RESULT ACQUIRED</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}