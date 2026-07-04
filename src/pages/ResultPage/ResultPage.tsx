import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { LEVELS } from '../../constants/levels';
import StarRating from '../../components/StarRating/StarRating';
import styles from './ResultPage.module.css';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ResultPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const won = searchParams.get('won') === 'true';
  const score = Number(searchParams.get('score') || 0);
  const time = Number(searchParams.get('time') || 0);
  const matches = Number(searchParams.get('matches') || 0);
  const maxCombo = Number(searchParams.get('maxCombo') || 0);

  const levelIndex = Number(levelId) - 1;
  const hasNextLevel = levelIndex + 1 < LEVELS.length;

  // 星级计算：基于分数百分比（假定满分 1000）
  const maxScore = 1000;
  const ratio = score / maxScore;
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;

  const handleNext = () => {
    navigate(`/game/${levelIndex + 2}`);
  };

  const handleRetry = () => {
    navigate(`/game/${levelId}`);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      {/* 标题 */}
      {won ? (
        <h1 className={styles.titleWin}>恭喜通关！</h1>
      ) : (
        <h1 className={styles.titleLose}>游戏结束</h1>
      )}

      {/* 星级（仅胜利） */}
      {won && (
        <div className={styles.starsWrap}>
          <StarRating stars={stars} animated />
        </div>
      )}

      {/* 统计数据 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🏆</span>
          <span className={styles.statValue}>{score}</span>
          <span className={styles.statLabel}>得分</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statIcon}>⏱</span>
          <span className={styles.statValue}>{formatTime(time)}</span>
          <span className={styles.statLabel}>用时</span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statValue}>{maxCombo}</span>
          <span className={styles.statLabel}>最大连击</span>
        </div>
      </div>

      {/* 按钮 */}
      <div className={styles.buttons}>
        {won && hasNextLevel && (
          <button className={styles.primaryBtn} onClick={handleNext}>
            下一关
          </button>
        )}

        <button
          className={won && hasNextLevel ? styles.secondaryBtn : styles.primaryBtn}
          onClick={handleRetry}
        >
          重新开始
        </button>

        <button className={styles.secondaryBtn} onClick={handleHome}>
          回到主页
        </button>
      </div>
    </div>
  );
}
