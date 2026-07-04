import React, { memo } from 'react';
import styles from './ScoreBar.module.css';

interface ScoreBarProps {
  level: number;
  score: number;
  matchCount: number;
  comboCount: number;
}

const ScoreBarComponent: React.FC<ScoreBarProps> = ({ level, score, matchCount, comboCount }) => {
  return (
    <div className={styles.scoreBar}>
      <div className={styles.scoreItem}>
        <span className={styles.scoreLabel}>关卡</span>
        <span className={styles.scoreValue}>{level}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.scoreItem}>
        <span className={styles.scoreLabel}>分数</span>
        <span className={styles.scoreValue}>{score.toLocaleString()}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.scoreItem}>
        <span className={styles.scoreLabel}>匹配</span>
        <span className={styles.scoreValue}>{matchCount}</span>
      </div>

      {comboCount > 1 && (
        <div className={styles.comboBadge} key={comboCount}>
          <span className={styles.comboText}>Combo</span>
          <span className={styles.comboNumber}>×{comboCount}</span>
        </div>
      )}
    </div>
  );
};

export const ScoreBar = memo(ScoreBarComponent);
export default ScoreBar;
