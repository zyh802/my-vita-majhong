import type { TileInstance, SlotTile } from '../types';

/**
 * 判断一张牌是否被上方的牌覆盖。
 * 牌占 2x2 网格单元，两张牌有覆盖关系当且仅当：
 * - 上方牌的 layer > 当前牌的 layer
 * - 行列方向都有交叠：|row1-row2| < 2 && |col1-col2| < 2
 */
function isBlockedFromAbove(tile: TileInstance, allTiles: TileInstance[]): boolean {
  return allTiles.some(
    (other) =>
      !other.isRemoved &&
      other.uid !== tile.uid &&
      other.layer > tile.layer &&
      Math.abs(other.row - tile.row) < 2 &&
      Math.abs(other.col - tile.col) < 2
  );
}

/**
 * 判断一张牌是否两侧都被夹住。
 * 同层牌，col 差为 2（紧邻左右），且 row 有交叠（|row1-row2| < 2）。
 * 只有左右两侧都被阻挡时才返回 true。
 */
function isBlockedFromSides(tile: TileInstance, allTiles: TileInstance[]): boolean {
  const sameLevelTiles = allTiles.filter(
    (other) => !other.isRemoved && other.uid !== tile.uid && other.layer === tile.layer
  );

  const blockedLeft = sameLevelTiles.some(
    (other) => other.col - tile.col === -2 && Math.abs(other.row - tile.row) < 2
  );

  const blockedRight = sameLevelTiles.some(
    (other) => other.col - tile.col === 2 && Math.abs(other.row - tile.row) < 2
  );

  return blockedLeft && blockedRight;
}

/**
 * 判断一张牌是否为自由牌：
 * - 上方无覆盖
 * - 至少一侧空出（左或右）
 */
export function isTileFree(tile: TileInstance, allTiles: TileInstance[]): boolean {
  if (tile.isRemoved) return false;
  return !isBlockedFromAbove(tile, allTiles) && !isBlockedFromSides(tile, allTiles);
}

/**
 * 重新计算所有牌的 isFree 和 isCovered 状态
 * - isCovered: 被上层牌覆盖（显示虚化）
 * - isFree: 可以点击（未被覆盖且至少一侧空出）
 */
export function recalculateFreeTiles(tiles: TileInstance[]): TileInstance[] {
  return tiles.map((tile) => {
    if (tile.isRemoved) {
      return { ...tile, isFree: false, isCovered: false };
    }
    const covered = isBlockedFromAbove(tile, tiles);
    const sideBlocked = isBlockedFromSides(tile, tiles);
    return {
      ...tile,
      isFree: !covered && !sideBlocked,
      isCovered: covered,
    };
  });
}

/**
 * 处理牌进入槽位的逻辑：扫描槽位中所有牌，找到任意一张匹配的即消除。
 * 匹配规则：typeId 相同。
 */
export function processSlotEntry(
  newTile: SlotTile,
  slotTiles: SlotTile[]
): { matched: boolean; updatedSlots: SlotTile[]; matchedSlotTile?: SlotTile } {
  const matchIndex = slotTiles.findIndex((st) => st.typeId === newTile.typeId);

  if (matchIndex !== -1) {
    const matchedSlotTile = slotTiles[matchIndex];
    const updatedSlots = slotTiles.filter((_, i) => i !== matchIndex);
    return { matched: true, updatedSlots, matchedSlotTile };
  }

  return { matched: false, updatedSlots: [...slotTiles, newTile] };
}

/**
 * 找到提示牌：
 * 1. 优先找能与槽位中任意牌配对的自由牌
 * 2. 如果没有，找棋盘上存在配对的自由牌
 */
export function findHintTile(
  tiles: TileInstance[],
  slotTiles: SlotTile[]
): TileInstance | null {
  const freeTiles = tiles.filter((t) => !t.isRemoved && t.isFree);

  // 优先：找能与槽位中的牌匹配的自由牌
  for (const ft of freeTiles) {
    if (slotTiles.some((st) => st.typeId === ft.typeId)) {
      return ft;
    }
  }

  // 其次：找棋盘上存在配对关系的自由牌
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (freeTiles[i].typeId === freeTiles[j].typeId) {
        return freeTiles[i];
      }
    }
  }

  return null;
}

/**
 * 检查是否所有牌都已移除
 */
export function isAllCleared(tiles: TileInstance[]): boolean {
  return tiles.every((t) => t.isRemoved);
}
