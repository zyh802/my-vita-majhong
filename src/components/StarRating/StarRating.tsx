import React, { memo } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  stars: number;
  animated?: boolean;
}

const StarRatingComponent: React.FC<StarRatingProps> = ({ stars, animated = false }) => {
  const starArray = [1, 2, 3];

  return (
    <div className={styles.starRating}>
      {starArray.map((starIndex) => {
        const isLit = starIndex <= stars;
        const classNames = [
          styles.star,
          isLit ? styles.starLit : styles.starDim,
          animated && isLit ? styles.starAnimated : '',
        ]
          .filter(Boolean)
          .join(' ');

        const style: React.CSSProperties = animated && isLit
          ? { animationDelay: `${(starIndex - 1) * 0.3}s` }
          : {};

        return (
          <span key={starIndex} className={classNames} style={style}>
            {isLit ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
};

export const StarRating = memo(StarRatingComponent);
export default StarRating;
