import React, { memo } from 'react';
import type { SlotTile } from '../../types';
import { getTileType, getRank } from '../../constants/tiles';
import TileFace from '../TileFace/TileFace';
import styles from './SlotBar.module.css';

interface SlotBarProps {
  slotTiles: SlotTile[];
  slotCapacity: number;
}

const SlotBarComponent: React.FC<SlotBarProps> = ({ slotTiles, slotCapacity }) => {
  const slots = Array.from({ length: slotCapacity }, (_, index) => {
    const slotTile = slotTiles[index] || null;
    return slotTile;
  });

  const filledCount = slotTiles.length;
  const isWarning = filledCount >= Math.floor(slotCapacity * 0.75) && filledCount < slotCapacity;
  const isDanger = filledCount >= slotCapacity;

  const containerClass = [
    styles.slotBar,
    isWarning ? styles.slotWarning : '',
    isDanger ? styles.slotDanger : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      {slots.map((slotTile, index) => {
        if (!slotTile) {
          return <div key={`empty-${index}`} className={styles.slotEmpty} />;
        }

        const tileType = getTileType(slotTile.typeId);
        if (!tileType) {
          return <div key={`slot-${index}`} className={styles.slotFilled} />;
        }

        // Check if this tile will be matched (last two of same type)
        const isMatching =
          index >= 1 &&
          slots[index - 1] !== null &&
          slots[index - 1]?.typeId === slotTile.typeId;

        return (
          <div
            key={`slot-${slotTile.uid}`}
            className={`${styles.slotFilled} ${isMatching ? styles.slotMatching : ''}`}
          >
            <div className={styles.slotTileText}>
              <TileFace suit={tileType.suit} rank={getRank(tileType)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SlotBar = memo(SlotBarComponent);
export default SlotBar;
