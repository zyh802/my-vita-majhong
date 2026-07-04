import type { TileInstance } from '../types';
import { recalculateFreeTiles } from './gameLogic';

/**
 * 打乱牌面上剩余牌的图案（位置不变，typeId 随机交换）。
 * 使用 Fisher-Yates 洗牌，只打乱 isRemoved === false 的牌的 typeId。
 */
export function shuffleRemainingTiles(tiles: TileInstance[]): TileInstance[] {
  const result = tiles.map((t) => ({ ...t }));

  // 收集未移除牌的索引和 typeId
  const activeIndices: number[] = [];
  const activeTypeIds: string[] = [];

  result.forEach((tile, index) => {
    if (!tile.isRemoved) {
      activeIndices.push(index);
      activeTypeIds.push(tile.typeId);
    }
  });

  // Fisher-Yates 洗牌 typeId 数组
  for (let i = activeTypeIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeTypeIds[i], activeTypeIds[j]] = [activeTypeIds[j], activeTypeIds[i]];
  }

  // 将打乱后的 typeId 分配回去
  activeIndices.forEach((tileIndex, i) => {
    result[tileIndex].typeId = activeTypeIds[i];
  });

  // 重新计算自由状态
  return recalculateFreeTiles(result);
}
