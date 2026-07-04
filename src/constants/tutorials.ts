import type { LevelLayout, TileInstance } from '../types';

/**
 * 教学关卡数据
 * 与正式关卡不同，教学关使用固定的牌布局（不随机生成），确保教学流程可控
 * 设计原则：减少打断，让用户在操作中学习
 */

/** 教学关 1：基础消除 — 只有 2 张相同的牌 */
export const TUTORIAL_1_LAYOUT: LevelLayout = {
  id: -1, // 负数标记为教学关
  name: '教学 · 基础消除',
  rows: 4,
  cols: 6,
  layers: 1,
  slotCapacity: 4,
  hintCount: 0,
  shuffleCount: 0,
  undoCount: 0,
  tileCount: 2,
  positions: [
    [1, 1, 0],
    [1, 3, 0],
  ],
};

/** 教学关 1 的固定牌面 — 两张一万 */
export const TUTORIAL_1_TILES: TileInstance[] = [
  { uid: 't1_a', typeId: 'wan_1', row: 1, col: 1, layer: 0, isRemoved: false, isFree: true, isCovered: false },
  { uid: 't1_b', typeId: 'wan_1', row: 1, col: 3, layer: 0, isRemoved: false, isFree: true, isCovered: false },
];

/** 教学关 2：并排消除 — 4 张牌紧挨排列，两侧可选、中间被夹住 */
export const TUTORIAL_2_LAYOUT: LevelLayout = {
  id: -2,
  name: '教学 · 并排消除',
  rows: 4,
  cols: 6,
  layers: 1,
  slotCapacity: 4,
  hintCount: 0,
  shuffleCount: 0,
  undoCount: 0,
  tileCount: 4,
  positions: [
    [1, 0, 0],
    [1, 2, 0],
    [1, 4, 0],
    [1, 6, 0],
  ],
};

/** 教学关 2 的固定牌面 — 二条和三筒各两张，交叉排列 */
export const TUTORIAL_2_TILES: TileInstance[] = [
  { uid: 't2_a', typeId: 'tiao_2', row: 1, col: 0, layer: 0, isRemoved: false, isFree: true, isCovered: false },
  { uid: 't2_b', typeId: 'tong_3', row: 1, col: 2, layer: 0, isRemoved: false, isFree: true, isCovered: false },
  { uid: 't2_c', typeId: 'tong_3', row: 1, col: 4, layer: 0, isRemoved: false, isFree: true, isCovered: false },
  { uid: 't2_d', typeId: 'tiao_2', row: 1, col: 6, layer: 0, isRemoved: false, isFree: true, isCovered: false },
];

/** 教学步骤定义 */
export interface TutorialStep {
  /** 提示文本 */
  message: string;
  /** 高亮指引的牌 uid（可选） */
  highlightUid?: string;
  /** 需要用户完成的动作才进入下一步 */
  trigger: 'tap_tile' | 'match' | 'auto' | 'done' | 'clear';
  /** 自动步骤的延迟(ms) */
  delay?: number;
}

/** 教学关 1 的引导步骤 — 简洁：一句话规则 → 自由操作 → 完成 */
export const TUTORIAL_1_STEPS: TutorialStep[] = [
  {
    message: '欢迎来到 Vita Mahjong！\n点击两张相同的牌放入卡槽，即可消除。\n试试看吧！',
    trigger: 'auto',
    delay: 0,
  },
  {
    message: '',
    trigger: 'clear', // 等待所有牌消除
  },
  {
    message: '🎉 太棒了！你学会了基础消除！',
    trigger: 'done',
  },
];

/** 教学关 2 的引导步骤 — 并排消除：两侧可选，中间被夹住 */
export const TUTORIAL_2_STEPS: TutorialStep[] = [
  {
    message: '两侧的牌可以选取，中间被夹住的不行！\n先消除两侧的牌，解放中间的牌。\n卡槽最多放 4 张，满了就失败哦。',
    trigger: 'auto',
    delay: 0,
  },
  {
    message: '',
    trigger: 'clear', // 等待所有牌消除
  },
  {
    message: '🎉 你已掌握核心玩法！\n善用提示、洗牌、撤销道具来帮助通关！',
    trigger: 'done',
  },
];
