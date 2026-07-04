import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { GameState, GameAction, LevelLayout, TileInstance, SlotTile } from '../types';
import { recalculateFreeTiles, processSlotEntry, findHintTile, isAllCleared } from '../utils/gameLogic';
import { generateLevel } from '../utils/levelGenerator';
import { shuffleRemainingTiles } from '../utils/shuffle';

const COMBO_WINDOW = 2000; // 2 seconds

const initialState: GameState = {
  currentLevel: 1,
  levelData: null,
  tiles: [],
  slotTiles: [],
  slotCapacity: 4,
  score: 0,
  matchCount: 0,
  comboCount: 0,
  maxCombo: 0,
  lastMatchTime: 0,
  hintRemaining: 3,
  shuffleRemaining: 3,
  undoRemaining: 3,
  elapsedTime: 0,
  isTimerRunning: false,
  status: 'idle',
  hintTileUid: null,
  toolAssisted: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_LEVEL': {
      const { level, tiles } = action;
      const freshTiles = recalculateFreeTiles(tiles);
      return {
        ...initialState,
        currentLevel: level.id,
        levelData: level,
        tiles: freshTiles,
        slotTiles: [],
        slotCapacity: level.slotCapacity,
        hintRemaining: level.hintCount,
        shuffleRemaining: level.shuffleCount,
        undoRemaining: level.undoCount,
        status: 'playing',
        isTimerRunning: true,
      };
    }

    case 'PICK_TILE': {
      const { tile } = action;
      if (!tile.isFree || tile.isRemoved || state.status !== 'playing') {
        return state;
      }

      // 1. Mark tile as removed from board
      let newTiles = state.tiles.map(t =>
        t.uid === tile.uid ? { ...t, isRemoved: true } : t
      );

      // 2. Recalculate free tiles
      newTiles = recalculateFreeTiles(newTiles);

      // 3. Create SlotTile
      const slotTile: SlotTile = {
        uid: tile.uid,
        typeId: tile.typeId,
        originalPosition: { row: tile.row, col: tile.col, layer: tile.layer },
      };

      // 4. Process slot entry: scan all existing slot tiles for a match
      const result = processSlotEntry(slotTile, state.slotTiles);

      let newScore = state.score;
      let newMatchCount = state.matchCount;
      let newComboCount = state.comboCount;
      let newMaxCombo = state.maxCombo;
      let newLastMatchTime = state.lastMatchTime;
      let newStatus: GameState['status'] = 'playing';

      if (result.matched) {
        // Match found
        if (state.toolAssisted) {
          // 道具辅助的匹配不加分，连击重置
          newComboCount = 0;
          newMatchCount += 1;
        } else {
          const now = Date.now();
          if (now - state.lastMatchTime <= COMBO_WINDOW && state.lastMatchTime > 0) {
            newComboCount = state.comboCount + 1;
          } else {
            newComboCount = 1;
          }
          newScore += 100 * newComboCount;
          newMatchCount += 1;
          newMaxCombo = Math.max(state.maxCombo, newComboCount);
          newLastMatchTime = now;
        }

        // Check win: board cleared and slot cleared
        if (isAllCleared(newTiles) && result.updatedSlots.length === 0) {
          newStatus = 'won';
        }
      } else {
        // No match - reset combo
        newComboCount = 0;
        // Check loss: slot full
        if (result.updatedSlots.length >= state.slotCapacity) {
          newStatus = 'lost';
        }
      }

      return {
        ...state,
        tiles: newTiles,
        slotTiles: result.updatedSlots,
        score: newScore,
        matchCount: newMatchCount,
        comboCount: newComboCount,
        maxCombo: newMaxCombo,
        lastMatchTime: newLastMatchTime,
        status: newStatus,
        isTimerRunning: newStatus === 'playing',
        hintTileUid: null,
        toolAssisted: result.matched ? false : state.toolAssisted,
      };
    }

    case 'USE_HINT': {
      if (state.hintRemaining <= 0 || state.status !== 'playing') {
        return state;
      }
      const hintTile = findHintTile(state.tiles, state.slotTiles);
      if (!hintTile) {
        return state;
      }
      return {
        ...state,
        hintRemaining: state.hintRemaining - 1,
        hintTileUid: hintTile.uid,
        toolAssisted: true,
      };
    }

    case 'USE_SHUFFLE': {
      if (state.shuffleRemaining <= 0 || state.status !== 'playing') {
        return state;
      }
      const shuffledTiles = shuffleRemainingTiles(state.tiles);
      const recalculatedTiles = recalculateFreeTiles(shuffledTiles);
      return {
        ...state,
        tiles: recalculatedTiles,
        shuffleRemaining: state.shuffleRemaining - 1,
        hintTileUid: null,
        toolAssisted: true,
      };
    }

    case 'USE_UNDO': {
      if (state.undoRemaining <= 0 || state.slotTiles.length === 0 || state.status !== 'playing') {
        return state;
      }
      // Return last tile to the board
      const lastSlotTile = state.slotTiles[state.slotTiles.length - 1];
      const restoredTiles = state.tiles.map(t =>
        t.uid === lastSlotTile.uid
          ? { ...t, isRemoved: false }
          : t
      );
      const recalculatedTiles = recalculateFreeTiles(restoredTiles);
      return {
        ...state,
        tiles: recalculatedTiles,
        slotTiles: state.slotTiles.slice(0, -1),
        undoRemaining: state.undoRemaining - 1,
        comboCount: 0,
        hintTileUid: null,
        toolAssisted: true,
      };
    }

    case 'TICK_TIMER': {
      if (!state.isTimerRunning) {
        return state;
      }
      return {
        ...state,
        elapsedTime: state.elapsedTime + 1,
      };
    }

    case 'GAME_WON': {
      return {
        ...state,
        status: 'won',
        isTimerRunning: false,
      };
    }

    case 'GAME_LOST': {
      return {
        ...state,
        status: 'lost',
        isTimerRunning: false,
      };
    }

    case 'RESTART_LEVEL': {
      if (!state.levelData) {
        return state;
      }
      const newTiles = generateLevel(state.levelData);
      const freshTiles = recalculateFreeTiles(newTiles);
      return {
        ...initialState,
        currentLevel: state.currentLevel,
        levelData: state.levelData,
        tiles: freshTiles,
        slotCapacity: state.levelData.slotCapacity,
        hintRemaining: state.levelData.hintCount,
        shuffleRemaining: state.levelData.shuffleCount,
        undoRemaining: state.levelData.undoCount,
        status: 'playing',
        isTimerRunning: true,
      };
    }

    case 'CLEAR_HINT': {
      return {
        ...state,
        hintTileUid: null,
      };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startLevel: (level: LevelLayout) => void;
  pickTile: (tile: TileInstance) => void;
  useHint: () => void;
  useShuffle: () => void;
  useUndo: () => void;
  restartLevel: () => void;
  tickTimer: () => void;
  clearHint: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startLevel = useCallback((level: LevelLayout) => {
    const tiles = generateLevel(level);
    dispatch({ type: 'INIT_LEVEL', level, tiles });
  }, []);

  const pickTile = useCallback((tile: TileInstance) => {
    dispatch({ type: 'PICK_TILE', tile });
  }, []);

  const useHintFn = useCallback(() => {
    dispatch({ type: 'USE_HINT' });
  }, []);

  const useShuffle = useCallback(() => {
    dispatch({ type: 'USE_SHUFFLE' });
  }, []);

  const useUndo = useCallback(() => {
    dispatch({ type: 'USE_UNDO' });
  }, []);

  const restartLevel = useCallback(() => {
    dispatch({ type: 'RESTART_LEVEL' });
  }, []);

  const tickTimer = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, []);

  const clearHint = useCallback(() => {
    dispatch({ type: 'CLEAR_HINT' });
  }, []);

  const value: GameContextValue = {
    state,
    dispatch,
    startLevel,
    pickTile,
    useHint: useHintFn,
    useShuffle,
    useUndo,
    restartLevel,
    tickTimer,
    clearHint,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
}
