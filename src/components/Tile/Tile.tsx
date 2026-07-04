import React, { memo, useState } from 'react';
import type { TileInstance } from '../../types';
import { getTileType, getRank } from '../../constants/tiles';
import TileFace from '../TileFace/TileFace';
import styles from './Tile.module.css';

interface TileProps {
  tile: TileInstance;
  onClick: (tile: TileInstance) => void;
  isHinted?: boolean;
}

const TileComponent: React.FC<TileProps> = ({ tile, onClick, isHinted = false }) => {
  const tileType = getTileType(tile.typeId);
  const [shaking, setShaking] = useState(false);

  if (!tileType || tile.isRemoved) {
    return <div className={`${styles.tile} ${styles.tileRemoving}`} style={getTileStyle(tile)} />;
  }

  const classNames = [
    styles.tile,
    tile.isCovered ? styles.tileCovered : '',
    isHinted ? styles.tileHinted : '',
    shaking ? styles.tileShake : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (tile.isFree) {
      onClick(tile);
    } else if (!tile.isCovered && !shaking) {
      // 仅侧面被挡的牌才抖动提示，被压住的牌不响应
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  };

  return (
    <div
      className={classNames}
      style={getTileStyle(tile)}
      onClick={handleClick}
      data-layer={tile.layer}
    >
      <div className={styles.tileText}>
        <TileFace suit={tileType.suit} rank={getRank(tileType)} />
      </div>
    </div>
  );
};

function getTileStyle(tile: TileInstance): React.CSSProperties {
  return {
    left: `calc(var(--tile-width) * ${tile.col * 0.5})`,
    top: `calc(var(--tile-height) * ${tile.row * 0.5})`,
    width: 'var(--tile-width)',
    height: 'var(--tile-height)',
    zIndex: tile.layer * 10 + tile.row,
  };
}

export const Tile = memo(TileComponent);
export default Tile;
