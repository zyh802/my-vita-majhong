import React, { memo } from 'react';
import type { TileInstance } from '../../types';
import { getTileType } from '../../constants/tiles';
import styles from './Tile.module.css';

interface TileProps {
  tile: TileInstance;
  onClick: (tile: TileInstance) => void;
  isHinted?: boolean;
}

const TileComponent: React.FC<TileProps> = ({ tile, onClick, isHinted = false }) => {
  const tileType = getTileType(tile.typeId);

  if (!tileType || tile.isRemoved) {
    return <div className={`${styles.tile} ${styles.tileRemoving}`} style={getTileStyle(tile)} />;
  }

  const classNames = [
    styles.tile,
    tile.isFree ? styles.tileFree : styles.tileLocked,
    isHinted ? styles.tileHinted : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (tile.isFree) {
      onClick(tile);
    }
  };

  return (
    <div
      className={classNames}
      style={getTileStyle(tile)}
      onClick={handleClick}
      data-layer={tile.layer}
    >
      <span className={styles.tileText} style={{ color: tileType.color }}>
        {tileType.display}
      </span>
      {!tile.isFree && <div className={styles.tileOverlay} />}
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
