import type { TileInstance, LevelLayout } from '../types';
import { TILE_TYPES } from '../constants/tiles';
import { recalculateFreeTiles } from './gameLogic';

/**
 * Fisher-Yates 洗牌算法
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 为一个关卡布局生成可解的牌面
 *
 * 算法：
 * 1. 取 layout.positions（所有牌位位置）
 * 2. pairCount = positions.length / 2
 * 3. 从 TILE_TYPES 中随机选择 pairCount 种牌（可重复选择同一种），每种生成一对
 * 4. 将所有牌类型放入数组，Fisher-Yates 洗牌
 * 5. 按顺序分配到各个 position 上
 * 6. 为每张牌生成唯一 uid
 * 7. 调用 recalculateFreeTiles 计算初始自由状态
 */
export function generateLevel(layout: LevelLayout): TileInstance[] {
  const { positions } = layout;
  const pairCount = Math.floor(positions.length / 2);

  // 为每对生成一个随机的 tileType
  const typeIds: string[] = [];
  for (let i = 0; i < pairCount; i++) {
    const randomType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
    typeIds.push(randomType.id);
    typeIds.push(randomType.id);
  }

  // Fisher-Yates 洗牌
  const shuffledTypeIds = fisherYatesShuffle(typeIds);

  // 分配到各个位置
  const tiles: TileInstance[] = positions.map((pos, index) => ({
    uid: `tile_${index}`,
    typeId: shuffledTypeIds[index],
    row: pos[0],
    col: pos[1],
    layer: pos[2],
    isRemoved: false,
    isFree: false,
    isCovered: false,
  }));

  // 计算初始自由状态
  return recalculateFreeTiles(tiles);
}
