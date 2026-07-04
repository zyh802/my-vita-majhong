import type { TileType } from '../types';

const CHINESE_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

const wanTiles: TileType[] = CHINESE_NUMBERS.map((cn, i) => ({
  id: `wan_${i + 1}`,
  suit: 'wan' as const,
  value: i + 1,
  label: `${cn}万`,
  display: `${cn}\n万`,
  color: '#cc0000',
}));

const tiaoTiles: TileType[] = CHINESE_NUMBERS.map((cn, i) => ({
  id: `tiao_${i + 1}`,
  suit: 'tiao' as const,
  value: i + 1,
  label: `${cn}条`,
  display: `${cn}\n条`,
  color: '#228B22',
}));

const tongTiles: TileType[] = CHINESE_NUMBERS.map((cn, i) => ({
  id: `tong_${i + 1}`,
  suit: 'tong' as const,
  value: i + 1,
  label: `${cn}筒`,
  display: `${cn}\n筒`,
  color: '#1a5ab8',
}));

const fengTiles: TileType[] = [
  { id: 'feng_dong', suit: 'feng', value: 'dong', label: '东风', display: '東', color: '#222222' },
  { id: 'feng_nan', suit: 'feng', value: 'nan', label: '南风', display: '南', color: '#222222' },
  { id: 'feng_xi', suit: 'feng', value: 'xi', label: '西风', display: '西', color: '#222222' },
  { id: 'feng_bei', suit: 'feng', value: 'bei', label: '北风', display: '北', color: '#222222' },
];

const jianTiles: TileType[] = [
  { id: 'jian_zhong', suit: 'jian', value: 'zhong', label: '红中', display: '中', color: '#cc0000' },
  { id: 'jian_fa', suit: 'jian', value: 'fa', label: '发财', display: '發', color: '#228B22' },
  { id: 'jian_bai', suit: 'jian', value: 'bai', label: '白板', display: '白', color: '#999999' },
];

export const TILE_TYPES: TileType[] = [
  ...wanTiles,
  ...tiaoTiles,
  ...tongTiles,
  ...fengTiles,
  ...jianTiles,
];

export function getTileType(id: string): TileType {
  const tile = TILE_TYPES.find((t) => t.id === id);
  if (!tile) {
    throw new Error(`Unknown tile type: ${id}`);
  }
  return tile;
}

const FENG_RANK: Record<string, number> = { dong: 1, nan: 2, xi: 3, bei: 4 };
const JIAN_RANK: Record<string, number> = { zhong: 1, fa: 2, bai: 3 };

/** 将 TileType 的 value 映射为 TileFace 需要的数字 rank */
export function getRank(tile: TileType): number {
  if (typeof tile.value === 'number') return tile.value;
  if (tile.suit === 'feng') return FENG_RANK[tile.value] ?? 1;
  if (tile.suit === 'jian') return JIAN_RANK[tile.value] ?? 1;
  return 1;
}
