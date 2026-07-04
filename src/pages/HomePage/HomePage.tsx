import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress, getMaxUnlockedLevel } from '../../utils/storage';
import { LEVELS } from '../../constants/levels';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const progress = loadProgress();
  const maxUnlocked = getMaxUnlockedLevel();

  const clearedCount = progress.filter((p) => p.completed).length;

  // 首次进入自动跳转教学关
  useEffect(() => {
    const tutorialDone = localStorage.getItem('vita_mahjong_tutorial_done');
    if (!tutorialDone) {
      navigate('/tutorial/1', { replace: true });
    }
  }, [navigate]);

  const handleStart = () => {
    navigate(`/game/${maxUnlocked}`);
  };

  const handleTutorial = () => {
    navigate('/tutorial/1');
  };

  const handleLevelSelect = (levelId: number) => {
    navigate(`/game/${levelId}`);
  };

  return (
    <div className={styles.container}>
      {/* 竹帘装饰 */}
      <div className={styles.bamboo} />

      {/* 铜钱装饰 */}
      <div className={styles.coinDecor}>
        <span className={styles.coinIcon}>🀄</span>
      </div>

      {/* 标题 */}
      <h1 className={styles.title}>Vita Mahjong</h1>
      <p className={styles.subtitle}>经 典 麻 将 消 除</p>

      {/* 开始按钮 */}
      <button className={styles.startBtn} onClick={handleStart}>
        开始游戏
      </button>

      {/* 进度 */}
      <p className={styles.progress}>已通关 {clearedCount} / {LEVELS.length} 关</p>

      {/* 关卡选择网格 */}
      <div className={styles.levelGrid}>
        {LEVELS.map((level) => {
          const isUnlocked = level.id <= maxUnlocked;
          const levelProgress = progress.find((p) => p.levelId === level.id);
          const stars = levelProgress?.stars || 0;

          return (
            <button
              key={level.id}
              className={`${styles.levelBtn} ${isUnlocked ? styles.levelUnlocked : styles.levelLocked}`}
              onClick={() => isUnlocked && handleLevelSelect(level.id)}
              disabled={!isUnlocked}
            >
              <span className={styles.levelNumber}>{level.id}</span>
              {isUnlocked && stars > 0 && (
                <span className={styles.levelStars}>
                  {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                </span>
              )}
              {!isUnlocked && <span className={styles.lockIcon}>🔒</span>}
            </button>
          );
        })}
      </div>

      {/* 重玩教学 */}
      <button className={styles.tutorialBtn} onClick={handleTutorial}>
        🎓 重玩教学
      </button>

      {/* 底部装饰 */}
      <div className={styles.bottomDecor} />
    </div>
  );
}
