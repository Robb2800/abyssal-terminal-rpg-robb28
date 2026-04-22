import { create } from 'zustand';
import {
  ASCII_ART, THEMES, getThemeData, GameTheme, ENEMY_MOVES,
  LORE_FRAGMENTS, OriginType, ORIGINS, NarrativeEvent, NARRATIVE_EVENTS,
  INTENT_TYPES, ENDINGS
} from '@/lib/dictionaries';
export type GameStatus = 'START' | 'ORIGIN_SELECT' | 'PLAYING' | 'EVENT' | 'GAMEOVER' | 'VICTORY';
export type EndingType = 'THRONE' | 'DESTRUCTION' | 'ESCAPE';
export interface GridCell {
  type: 'combat' | 'treasure' | 'empty' | 'event' | 'boss';
  explored: boolean;
  eventId?: string;
}
interface Encounter {
  name: string;
  hp: number;
  maxHp: number;
  nextMove: string;
  revealed: boolean;
  intent: keyof typeof INTENT_TYPES;
  futureMoves?: (keyof typeof INTENT_TYPES)[];
}
interface GameState {
  status: GameStatus;
  themeInput: string;
  theme: GameTheme;
  origin: OriginType | null;
  inventory: string[];
  allies: { automaton: boolean };
  floor: number;
  playerHp: number;
  playerMaxHp: number;
  mana: number;
  maxMana: number;
  strength: number;
  agility: number;
  roomsCleared: number;
  killCount: number;
  relicCooldown: number;
  bossPhase: number;
  activeEnding: EndingType | null;
  restUsedOnFloor: boolean;
  logs: string[];
  currentEncounter: Encounter | null;
  currentEvent: NarrativeEvent | null;
  currentAscii: string;
  defenseActive: boolean;
  grid: GridCell[][];
  position: { x: number, y: number };
  isRolling: boolean;
  lastRoll: number;
  rollLabel: string;
  setThemeInput: (input: string) => void;
  startGame: () => void;
  selectOrigin: (origin: OriginType) => void;
  move: (dx: number, dy: number) => void;
  triggerRoll: (label: string, callback: (roll: number) => void) => void;
  attack: () => void;
  defend: () => void;
  useSkill: (skillId: 'siphon' | 'analyze' | 'smoke') => void;
  useRelic: () => void;
  searchRoom: () => void;
  rest: () => void;
  resolveEvent: (choiceId: string) => void;
  resolveEnding: (type: EndingType) => void;
  addLog: (msg: string) => void;
  reset: () => void;
}
const INITIAL_GRID_SIZE = 5;
const generateIntent = (): keyof typeof INTENT_TYPES => {
  const keys = Object.keys(INTENT_TYPES) as (keyof typeof INTENT_TYPES)[];
  return keys[Math.floor(Math.random() * keys.length)];
};
const createProceduralGrid = (revealAll = false): GridCell[][] => {
  const grid: GridCell[][] = [];
  for (let y = 0; y < INITIAL_GRID_SIZE; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < INITIAL_GRID_SIZE; x++) {
      const rng = Math.random();
      let type: GridCell['type'] = 'empty';
      let eventId: string | undefined;
      if (rng < 0.3) type = 'combat';
      else if (rng < 0.45) type = 'treasure';
      else if (rng < 0.6) {
        type = 'event';
        eventId = NARRATIVE_EVENTS[Math.floor(Math.random() * NARRATIVE_EVENTS.length)].id;
      }
      row.push({ type, explored: revealAll && (type === 'event'), eventId });
    }
    grid.push(row);
  }
  grid[0][2] = { type: 'empty', explored: true };
  grid[4][4] = { type: 'boss', explored: revealAll };
  return grid;
};
export const useGameStore = create<GameState>((set, get) => ({
  status: 'START',
  themeInput: '',
  theme: 'void',
  origin: null,
  inventory: [],
  allies: { automaton: false },
  floor: 1,
  playerHp: 20,
  playerMaxHp: 20,
  mana: 10,
  maxMana: 20,
  strength: 3,
  agility: 2,
  roomsCleared: 0,
  killCount: 0,
  relicCooldown: 0,
  bossPhase: 1,
  activeEnding: null,
  restUsedOnFloor: false,
  logs: ['>>> SYSTEM INITIALIZED...', '>>> AWAITING SEED INPUT...'],
  currentEncounter: null,
  currentEvent: null,
  currentAscii: ASCII_ART.VOID,
  defenseActive: false,
  isRolling: false,
  lastRoll: 0,
  rollLabel: '',
  grid: [],
  position: { x: 2, y: 0 },
  setThemeInput: (input) => set({ themeInput: input }),
  startGame: () => {
    const theme = getThemeData(get().themeInput);
    set({ status: 'ORIGIN_SELECT', theme });
  },
  selectOrigin: (originType) => {
    const originData = ORIGINS[originType];
    const grid = createProceduralGrid(originType === 'collector');
    set({
      status: 'PLAYING',
      origin: originType,
      inventory: [originData.item],
      strength: 3 + (originData.statBonus.strength || 0),
      agility: 2 + (originData.statBonus.agility || 0),
      grid,
      position: { x: 2, y: 0 },
      currentAscii: ASCII_ART.DOORWAY,
      roomsCleared: 0,
      logs: [`>>> ORIGIN: ${originData.name.toUpperCase()}`, `>>> ${originData.desc}`]
    });
  },
  move: (dx, dy) => {
    const { position, grid, status, origin, mana, maxMana, roomsCleared, relicCooldown } = get();
    if (status !== 'PLAYING') return;
    const nx = position.x + dx;
    const ny = position.y + dy;
    if (nx < 0 || nx >= INITIAL_GRID_SIZE || ny < 0 || ny >= INITIAL_GRID_SIZE) return;
    const isFirstVisit = !grid[ny][nx].explored;
    const newGrid = grid.map((row, y) =>
      row.map((cell, x) => (x === nx && y === ny ? { ...cell, explored: true } : cell))
    );
    const originData = origin ? ORIGINS[origin] : null;
    const manaRegen = originData?.statBonus.manaRegen || 1;
    set({
      position: { x: nx, y: ny },
      grid: newGrid,
      mana: Math.min(maxMana, mana + manaRegen),
      roomsCleared: isFirstVisit ? roomsCleared + 1 : roomsCleared,
      relicCooldown: Math.max(0, relicCooldown - 1)
    });
    const cell = newGrid[ny][nx];
    const { theme, floor, addLog, playerMaxHp, playerHp } = get();
    if (cell.type === 'combat' || cell.type === 'boss') {
      const isBoss = cell.type === 'boss';
      const name = isBoss ? 'ABYSSAL OVERSEER' : THEMES[theme].enemies[Math.floor(Math.random() * THEMES[theme].enemies.length)];
      set({
        currentEncounter: {
          name,
          hp: (10 + (floor * 5)) * (isBoss ? 5 : 1),
          maxHp: (10 + (floor * 5)) * (isBoss ? 5 : 1),
          nextMove: ENEMY_MOVES[name]?.[0] || 'Strike',
          revealed: false,
          intent: generateIntent()
        },
        currentAscii: isBoss ? ASCII_ART.BOSS : ASCII_ART.SKULL,
        bossPhase: 1
      });
      addLog(`! ENCOUNTER: A ${name.toUpperCase()} BLOCKS YOUR PATH.`);
    } else if (cell.type === 'treasure') {
      set({ playerHp: Math.min(playerMaxHp, playerHp + 5), currentAscii: ASCII_ART.CHEST });
      addLog(`+ TREASURE: A VIAL OF GLOWING FLUID RESTORES YOUR HEALTH.`);
    } else if (cell.type === 'event' && cell.eventId) {
      const event = NARRATIVE_EVENTS.find(e => e.id === cell.eventId);
      if (event) set({ status: 'EVENT', currentEvent: event, currentAscii: ASCII_ART.EVENT });
    } else {
      set({ currentAscii: ASCII_ART.DOORWAY });
    }
  },
  attack: () => {
    const { currentEncounter, strength, triggerRoll, addLog, playerHp, defenseActive, agility, allies, roomsCleared, killCount, playerMaxHp, origin, bossPhase } = get();
    if (!currentEncounter || get().isRolling) return;
    triggerRoll('ATTACK', (roll) => {
      let dmg = Math.floor(((roll / 20) * 10 + strength) * (roll === 20 ? 1.5 : 1.0));
      if (allies.automaton) {
        dmg += 3;
        addLog(`> ALLY: THE AUTOMATON FIRES A BOLT!`);
      }
      let nextHp = currentEncounter.hp;
      if (currentEncounter.name === 'ABYSSAL OVERSEER') {
        if (bossPhase === 1) {
          const heal = Math.floor(dmg * 0.1);
          nextHp = Math.min(currentEncounter.maxHp, currentEncounter.hp - dmg + heal);
          addLog(`! BOSS: SIPHON ACTIVE! OVERSEER HEALS ${heal} FROM YOUR STRIKE.`);
        } else {
          nextHp = currentEncounter.hp - dmg;
        }
      } else {
        nextHp = currentEncounter.hp - dmg;
      }
      const updatedEncounter = { ...currentEncounter, hp: nextHp };
      set({ currentEncounter: updatedEncounter });
      if (updatedEncounter.hp <= 0) {
        const isBoss = updatedEncounter.name === 'ABYSSAL OVERSEER';
        addLog(`* VICTORY: ${updatedEncounter.name} DISSOLVES.`);
        set({
          currentEncounter: null,
          currentAscii: ASCII_ART.VOID,
          roomsCleared: roomsCleared + (isBoss ? 10 : 0),
          killCount: killCount + 1,
          playerMaxHp: origin === 'exile' ? playerMaxHp + 2 : playerMaxHp
        });
      } else {
        if (updatedEncounter.name === 'ABYSSAL OVERSEER') {
          const hpPct = (updatedEncounter.hp / updatedEncounter.maxHp) * 100;
          if (hpPct <= 10) {
            set({ status: 'EVENT', bossPhase: 3 });
            return;
          } else if (hpPct <= 50 && bossPhase < 2) {
            set({ bossPhase: 2 });
            addLog(`! BOSS: THE MARKET CRASHES. PHASE 2 INITIATED.`);
          }
        }
        const intent = INTENT_TYPES[updatedEncounter.intent];
        const enemyDmgBase = (Math.floor(Math.random() * 5) + 5) * (bossPhase === 2 ? 1.5 : 1.0);
        const finalDmg = Math.max(0, Math.floor((defenseActive ? (enemyDmgBase * 0.5) : (enemyDmgBase * intent.modifier)) - (defenseActive ? agility : 0)));
        const newHp = playerHp - finalDmg;
        addLog(`< ${updatedEncounter.name} [${intent.label}] DEALS ${finalDmg} DMG.`);
        if (newHp <= 0) {
          set({ status: 'GAMEOVER', playerHp: 0, currentAscii: ASCII_ART.GAMEOVER });
        } else {
          set({
            playerHp: newHp,
            defenseActive: false,
            currentEncounter: { ...updatedEncounter, intent: generateIntent(), nextMove: ENEMY_MOVES[updatedEncounter.name]?.[Math.floor(Math.random() * 3)] || 'Strike' }
          });
        }
      }
    });
  },
  useRelic: () => {
    const { origin, relicCooldown, currentEncounter, addLog, position, grid } = get();
    if (relicCooldown > 0) return;
    if (origin === 'collector') {
      if (currentEncounter) return;
      const newGrid = grid.map((row, y) => row.map((cell, x): GridCell => {
        if (x === position.x && y === position.y) {
          const rng = Math.random();
          return { ...cell, type: (rng < 0.5 ? 'treasure' : 'empty') as GridCell["type"] };
        }
        return cell;
      }));
      set({ grid: newGrid, relicCooldown: 1 });
      addLog(`+ RELIC: SECTOR REGENERATED BY COMPASS.`);
    } else if (origin === 'exile') {
      if (!currentEncounter) return;
      set({ defenseActive: true, relicCooldown: 3 });
      addLog(`+ RELIC: THE CROWN COMMANDS SILENCE. ENEMY STUNNED.`);
    } else if (origin === 'seeker') {
      if (!currentEncounter) return;
      set({
        currentEncounter: {
          ...currentEncounter,
          revealed: true,
          futureMoves: [generateIntent(), generateIntent(), generateIntent()]
        },
        relicCooldown: 2
      });
      addLog(`+ RELIC: THE LENS REVEALS THE THREADS OF CAUSALITY.`);
    }
  },
  searchRoom: () => {
    const { agility, triggerRoll, addLog, strength, origin } = get();
    triggerRoll('SEARCH', (roll) => {
      const successThreshold = origin === 'seeker' ? -99 : 15;
      if (roll + agility >= successThreshold) {
        if (Math.random() < 0.3) {
          set({ strength: strength + 1 });
          addLog(`+ EMPOWERED: +1 STR.`);
        } else {
          addLog(`+ LORE: ${LORE_FRAGMENTS[Math.floor(Math.random() * LORE_FRAGMENTS.length)]}`);
        }
      } else addLog(`- SEARCH: NOTHING FOUND.`);
    });
  },
  resolveEnding: (type) => set({ status: 'VICTORY', activeEnding: type }),
  resolveEvent: (choiceId) => {
    const { currentEvent } = get();
    if (!currentEvent) return;
    const choice = currentEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;
    const updates = choice.effect(get());
    set({ ...updates, status: 'PLAYING', currentEvent: null, currentAscii: ASCII_ART.DOORWAY });
    get().addLog(`+ DECISION: ${choice.consequence}`);
  },
  defend: () => set({ defenseActive: true }),
  useSkill: (id) => {},
  rest: () => {
    const { restUsedOnFloor, playerHp, playerMaxHp } = get();
    if (restUsedOnFloor) return;
    set({ playerHp: Math.min(playerMaxHp, playerHp + 10), restUsedOnFloor: true });
    get().addLog(`+ REST: RECOVERED STRENGTH.`);
  },
  addLog: (msg) => set((state) => ({ logs: [...state.logs, msg] })),
  triggerRoll: (label, callback) => {
    set({ isRolling: true, rollLabel: label, lastRoll: 0 });
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      set({ isRolling: false, lastRoll: roll });
      callback(roll);
      setTimeout(() => { if (get().lastRoll === roll) set({ lastRoll: 0 }); }, 2500);
    }, 1000);
  },
  reset: () => set({
    status: 'START', playerHp: 20, playerMaxHp: 20, mana: 10, maxMana: 20, strength: 3, agility: 2,
    roomsCleared: 0, killCount: 0, relicCooldown: 0, bossPhase: 1, activeEnding: null,
    logs: ['>>> REBOOTING...'], currentEncounter: null, currentEvent: null, origin: null,
    inventory: [], allies: { automaton: false }, position: { x: 2, y: 0 },
    restUsedOnFloor: false, currentAscii: ASCII_ART.VOID
  })
}));