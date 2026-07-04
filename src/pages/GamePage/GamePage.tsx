import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { LEVELS } from '../../constants/levels';
import { updateLevelProgress } from '../../utils/storage';
import { useTimer } from '../../hooks/useTimer';
import ScoreBar from '../../components/ScoreBar/ScoreBar';
import TileBoard from '../../components/TileBoard/TileBoard';
import SlotBar from '../../components/SlotBar/SlotBar';
import ToolBar from '../../components/ToolBar/ToolBar';
import styles from './GamePage.module.css';

export default function GamePage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { state, startLevel, pickTile, useHint, useShuffle, useUndo, tickTimer } = useGame();

  const levelIndex = Number(levelId) - 1;

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 初始化关卡
  useEffect(() => {
    if (levelIndex >= 0 && levelIndex < LEVELS.length) {
      startLevel(LEVELS[levelIndex]);
    }
  }, [levelIndex, startLevel]);

  // 计时器
  useTimer(state.isTimerRunning, tickTimer);

  // 监听游戏结束
  useEffect(() => {
    if (state.status === 'won') {
      // 保存进度
      const stars = state.score >= 800 ? 3 : state.score >= 500 ? 2 : 1;
      updateLevelProgress(state.currentLevel, {
        completed: true,
        stars,
        bestScore: state.score,
        bestTime: state.elapsedTime,
      });

      const timer = setTimeout(() => {
        const params = new URLSearchParams({
          won: 'true',
          score: String(state.score),
          time: String(state.elapsedTime),
          matches: String(state.matchCount),
          maxCombo: String(state.maxCombo),
        });
        navigate(`/result/${levelId}?${params.toString()}`);
      }, 800);
      return () => clearTimeout(timer);
    }

    if (state.status === 'lost') {
      const timer = setTimeout(() => {
        const params = new URLSearchParams({
          won: 'false',
          score: String(state.score),
          time: String(state.elapsedTime),
          matches: String(state.matchCount),
          maxCombo: String(state.maxCombo),
        });
        navigate(`/result/${levelId}?${params.toString()}`);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.score, state.elapsedTime, state.matchCount, state.maxCombo, state.currentLevel, levelId, navigate]);

  return (
    <div className={styles.container}>
      {/* 顶部：返回 + 信息栏 */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ←
        </button>
        <div className={styles.scoreBarWrap}>
          <ScoreBar
            level={state.currentLevel}
            score={state.score}
            matchCount={state.matchCount}
            comboCount={state.comboCount}
          />
        </div>
        <span className={styles.timer}>⏱ {formatTime(state.elapsedTime)}</span>
      </div>

      {/* 棋盘 */}
      <div className={styles.boardArea}>
        <TileBoard
          tiles={state.tiles}
          hintTileUid={state.hintTileUid}
          onTilePick={pickTile}
        />
      </div>

      {/* 底部：槽位 + 工具栏 */}
      <div className={styles.bottomArea}>
        <SlotBar slotTiles={state.slotTiles} slotCapacity={state.slotCapacity} />
        <ToolBar
          hintCount={state.hintRemaining}
          shuffleCount={state.shuffleRemaining}
          undoCount={state.undoRemaining}
          onHint={useHint}
          onShuffle={useShuffle}
          onUndo={useUndo}
        />
      </div>
    </div>
  );
}
