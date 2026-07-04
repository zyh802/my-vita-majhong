import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { TileInstance } from '../../types';
import { Tile } from '../Tile/Tile';
import styles from './TileBoard.module.css';

interface TileBoardProps {
  tiles: TileInstance[];
  onTilePick: (tile: TileInstance) => void;
  hintTileUid: string | null;
}

export const TileBoard: React.FC<TileBoardProps> = ({ tiles, onTilePick, hintTileUid }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculate board dimensions based on tile positions
  const { boardWidth, boardHeight, maxLayer } = useMemo(() => {
    if (tiles.length === 0) {
      return { boardWidth: 0, boardHeight: 0, maxLayer: 0 };
    }

    let maxRow = 0;
    let maxCol = 0;
    let maxL = 0;

    for (const tile of tiles) {
      if (tile.row > maxRow) maxRow = tile.row;
      if (tile.col > maxCol) maxCol = tile.col;
      if (tile.layer > maxL) maxL = tile.layer;
    }

    // Each tile occupies a full cell, but positions are offset by half a cell
    // Board width = (maxCol + 1) * halfTileWidth + halfTileWidth (for the full tile)
    // Using CSS variable units: (maxCol + 2) * 0.5 in --tile-width units
    const width = (maxCol + 2) * 0.5;
    const height = (maxRow + 2) * 0.5;
    const layer = maxL;

    return { boardWidth: width, boardHeight: height, maxLayer: layer };
  }, [tiles]);

  // Auto-scale to fit the container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Get actual pixel size of tile CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const tileWidth = parseFloat(computedStyle.getPropertyValue('--tile-width')) || 44;
      const tileHeight = parseFloat(computedStyle.getPropertyValue('--tile-height')) || 58;

      const boardPixelWidth = boardWidth * tileWidth;
      const boardPixelHeight = boardHeight * tileHeight;

      if (boardPixelWidth === 0 || boardPixelHeight === 0) return;

      const scaleX = (containerWidth - 20) / boardPixelWidth;
      const scaleY = (containerHeight - 20) / boardPixelHeight;
      const newScale = Math.min(scaleX, scaleY, 1.5);

      setScale(newScale > 0 ? newScale : 1);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [boardWidth, boardHeight]);

  // Memoize rendered tiles
  const renderedTiles = useMemo(() => {
    return tiles.map(tile => (
        <Tile
          key={tile.uid}
          tile={tile}
          onClick={onTilePick}
          isHinted={tile.uid === hintTileUid}
        />
      ));
  }, [tiles, onTilePick, hintTileUid]);

  const boardStyle: React.CSSProperties = {
    width: `calc(var(--tile-width) * ${boardWidth})`,
    height: `calc(var(--tile-height) * ${boardHeight})`,
    transform: `scale(${scale})`,
  };

  return (
    <div className={styles.boardContainer} ref={containerRef}>
      <div className={styles.boardWrapper}>
        <div className={styles.board} style={boardStyle}>
          {renderedTiles}
        </div>
      </div>
      {maxLayer > 0 && (
        <div className={styles.layerIndicator}>
          共 {maxLayer + 1} 层
        </div>
      )}
    </div>
  );
};

export default TileBoard;
