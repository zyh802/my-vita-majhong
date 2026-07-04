import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { LEVELS } from '../../constants/levels';
import { updateLevelProgress } from '../../utils/storage';
import { calculateStars } from '../../utils/starRating';
import { useTimer } from '../../hooks/useTimer';
import { playPickSound, playMatchSound, playComboSound, playFailSound, playWinSound, playToolSound } from '../../utils/soundManager';
import ScoreBar from '../../components/ScoreBar/ScoreBar';
import TileBoard from '../../components/TileBoard/TileBoard';
import SlotBar from '../../components/SlotBar/SlotBar';
import ToolBar from '../../components/ToolBar/ToolBar';
import LevelModal from '../../components/LevelModal/LevelModal';
import ParticleEffect from '../../components/ParticleEffect/ParticleEffect';
import styles from './GamePage.module.css';

export default function GamePage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { state, startLevel, pickTile, useHint, useShuffle, useUndo, restartLevel, tickTimer } = useGame();

  const [showLevelModal, setShowLevelModal] = useState(false);
  const levelIndex = Number(levelId) - 1;

  // 音效 & 粒子状态追踪
  const prevMatchCountRef = useRef(0);
  const prevSlotLenRef = useRef(0);
  const prevStatusRef = useRef(state.status);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const boardAreaRef = useRef<HTMLDivElement>(null);

  // 监听选牌（slotTiles 变长 = 入槽）和消除（matchCount 增加）
  useEffect(() => {
    // 匹配成功
    if (state.matchCount > prevMatchCountRef.current && prevMatchCountRef.current >= 0) {
      playMatchSound();
      // 连击音效
      if (state.comboCount > 1) {
        setTimeout(() => playComboSound(state.comboCount), 80);
      }
      // 触发粒子特效（在槽位区域中央爆发）
      if (boardAreaRef.current) {
        const rect = boardAreaRef.current.getBoundingClientRect();
        setParticlePos({ x: rect.width / 2, y: rect.height - 40 });
        setParticleTrigger(prev => prev + 1);
      }
    }
    // 选牌入槽（未匹配，槽位变多了）
    else if (state.slotTiles.length > prevSlotLenRef.current && state.status === 'playing') {
      playPickSound();
    }

    prevMatchCountRef.current = state.matchCount;
    prevSlotLenRef.current = state.slotTiles.length;
  }, [state.matchCount, state.slotTiles.length, state.comboCount, state.status]);

  // 监听游戏状态变化（胜利/失败音效）
  useEffect(() => {
    if (state.status !== prevStatusRef.current) {
      if (state.status === 'won') {
        playWinSound();
      } else if (state.status === 'lost') {
        playFailSound();
      }
      prevStatusRef.current = state.status;
    }
  }, [state.status]);

  // 包装道具使用，加入音效
  const handleHint = useCallback(() => {
    if (state.hintRemaining > 0) playToolSound();
    useHint();
  }, [useHint, state.hintRemaining]);

  const handleShuffle = useCallback(() => {
    if (state.shuffleRemaining > 0) playToolSound();
    useShuffle();
  }, [useShuffle, state.shuffleRemaining]);

  const handleUndo = useCallback(() => {
    if (state.undoRemaining > 0) playToolSound();
    useUndo();
  }, [useUndo, state.undoRemaining]);

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
      const tileCount = state.levelData?.tileCount || 0;
      const { stars } = calculateStars({
        score: state.score,
        pairCount: tileCount / 2,
      });
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
          maxCombo: String(state.maxCombo),
          tileCount: String(tileCount),
        });
        navigate(`/result/${levelId}?${params.toString()}`);
      }, 800);
      return () => clearTimeout(timer);
    }

    if (state.status === 'lost') {
      const lostTileCount = state.levelData?.tileCount || 0;
      const timer = setTimeout(() => {
        const params = new URLSearchParams({
          won: 'false',
          score: String(state.score),
          time: String(state.elapsedTime),
          maxCombo: String(state.maxCombo),
          tileCount: String(lostTileCount),
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
        <button className={styles.restartBtn} onClick={restartLevel} title="重新开始">
          ↻
        </button>
        <button className={styles.menuBtn} onClick={() => setShowLevelModal(true)} title="关卡选择">
          ☰
        </button>
      </div>

      {/* 棋盘 */}
      <div className={styles.boardArea} ref={boardAreaRef}>
        <TileBoard
          tiles={state.tiles}
          hintTileUid={state.hintTileUid}
          onTilePick={pickTile}
        />
        <ParticleEffect
          x={particlePos.x}
          y={particlePos.y}
          triggerKey={particleTrigger}
          count={16}
        />
      </div>

      {/* 底部：槽位 + 工具栏 */}
      <div className={styles.bottomArea}>
        <SlotBar slotTiles={state.slotTiles} slotCapacity={state.slotCapacity} />
        <ToolBar
          hintCount={state.hintRemaining}
          shuffleCount={state.shuffleRemaining}
          undoCount={state.undoRemaining}
          onHint={handleHint}
          onShuffle={handleShuffle}
          onUndo={handleUndo}
        />
      </div>

      {/* 关卡选择弹窗 */}
      <LevelModal visible={showLevelModal} onClose={() => setShowLevelModal(false)} />
    </div>
  );
}
