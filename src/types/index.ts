// 牌的花色
export type TileSuit = 'wan' | 'tiao' | 'tong' | 'feng' | 'jian';

// 牌的类型定义
export interface TileType {
  id: string;           // 如 "wan_1", "feng_dong"
  suit: TileSuit;
  value: number | string;
  label: string;        // 显示文本
  display: string;      // 牌面显示内容（汉字/符号）
  color: string;        // 牌面颜色
}

// 棋盘上的一张牌实例
export interface TileInstance {
  uid: string;
  typeId: string;
  row: number;
  col: number;
  layer: number;
  isRemoved: boolean;
  isFree: boolean;
  isCovered: boolean;  // 被上层牌覆盖（虚化显示）
}

// 槽位中的牌
export interface SlotTile {
  uid: string;
  typeId: string;
  originalPosition: {
    row: number;
    col: number;
    layer: number;
  };
}

// 关卡布局
export interface LevelLayout {
  id: number;
  name: string;
  rows: number;
  cols: number;
  layers: number;
  positions: [number, number, number][];  // [row, col, layer]
  tileCount: number;
  slotCapacity: number;
  hintCount: number;
  shuffleCount: number;
  undoCount: number;
}

// 关卡进度
export interface LevelProgress {
  levelId: number;
  completed: boolean;
  bestScore: number;
  bestTime: number;
  stars: number;
}

// 游戏状态
export interface GameState {
  currentLevel: number;
  levelData: LevelLayout | null;
  tiles: TileInstance[];
  slotTiles: SlotTile[];
  slotCapacity: number;
  score: number;
  matchCount: number;
  comboCount: number;
  maxCombo: number;
  lastMatchTime: number;
  hintRemaining: number;
  shuffleRemaining: number;
  undoRemaining: number;
  elapsedTime: number;
  isTimerRunning: boolean;
  status: 'idle' | 'playing' | 'won' | 'lost' | 'paused';
  hintTileUid: string | null;
}

// 游戏动作
export type GameAction =
  | { type: 'INIT_LEVEL'; level: LevelLayout; tiles: TileInstance[] }
  | { type: 'PICK_TILE'; tile: TileInstance }
  | { type: 'USE_HINT' }
  | { type: 'USE_SHUFFLE' }
  | { type: 'USE_UNDO' }
  | { type: 'TICK_TIMER' }
  | { type: 'GAME_WON' }
  | { type: 'GAME_LOST' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'CLEAR_HINT' };
