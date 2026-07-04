import { useNavigate } from 'react-router-dom';
import { LEVELS } from '../../constants/levels';
import { loadProgress, getMaxUnlockedLevel } from '../../utils/storage';
import styles from './LevelModal.module.css';

interface LevelModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LevelModal({ visible, onClose }: LevelModalProps) {
  const navigate = useNavigate();
  const progress = loadProgress();
  const maxUnlocked = getMaxUnlockedLevel();

  if (!visible) return null;

  const handleSelect = (levelId: number) => {
    onClose();
    navigate(`/game/${levelId}`);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>选择关卡</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.grid}>
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= maxUnlocked;
            const levelProgress = progress.find((p) => p.levelId === level.id);
            const stars = levelProgress?.stars || 0;

            return (
              <button
                key={level.id}
                className={`${styles.levelBtn} ${isUnlocked ? styles.unlocked : styles.locked}`}
                onClick={() => isUnlocked && handleSelect(level.id)}
                disabled={!isUnlocked}
              >
                <span className={styles.levelNum}>{level.id}</span>
                {isUnlocked && stars > 0 && (
                  <span className={styles.stars}>
                    {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                  </span>
                )}
                {!isUnlocked && <span className={styles.lockIcon}>🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
