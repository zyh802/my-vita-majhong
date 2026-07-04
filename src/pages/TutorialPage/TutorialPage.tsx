import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import {
  TUTORIAL_1_LAYOUT, TUTORIAL_1_TILES, TUTORIAL_1_STEPS,
  TUTORIAL_2_LAYOUT, TUTORIAL_2_TILES, TUTORIAL_2_STEPS,
} from '../../constants/tutorials';
import type { TutorialStep } from '../../constants/tutorials';
import type { TileInstance } from '../../types';
import { playPickSound, playMatchSound, playWinSound } from '../../utils/soundManager';
import TileBoard from '../../components/TileBoard/TileBoard';
import SlotBar from '../../components/SlotBar/SlotBar';
import ParticleEffect from '../../components/ParticleEffect/ParticleEffect';
import styles from './TutorialPage.module.css';

export default function TutorialPage() {
  const { step: tutorialId } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const { state, startLevel, pickTile, dispatch } = useGame();

  const [currentStep, setCurrentStep] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const prevMatchCountRef = useRef(0);
  const prevSlotLenRef = useRef(0);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const isTutorial1 = tutorialId === '1';
  const layout = isTutorial1 ? TUTORIAL_1_LAYOUT : TUTORIAL_2_LAYOUT;
  const tiles = isTutorial1 ? TUTORIAL_1_TILES : TUTORIAL_2_TILES;
  const steps: TutorialStep[] = isTutorial1 ? TUTORIAL_1_STEPS : TUTORIAL_2_STEPS;
  const step = steps[currentStep] || steps[steps.length - 1];

  // 初始化教学关
  useEffect(() => {
    if (!initializedRef.current) {
      startLevel(layout);
      initializedRef.current = true;
    }
  }, [layout, startLevel]);

  // 用固定牌面覆盖（startLevel 会用 generateLevel 随机生成，我们需要覆盖）
  useEffect(() => {
    if (initializedRef.current && state.status === 'playing' && state.tiles.length > 0) {
      const shouldOverride = state.tiles.some(t => !tiles.find(ft => ft.uid === t.uid));
      if (shouldOverride) {
        dispatch({ type: 'INIT_LEVEL', level: layout, tiles: [...tiles] });
      }
    }
  }, [state.status, state.tiles.length, dispatch, layout, tiles]);

  // 监听匹配和选牌 — 播放音效 + 粒子特效
  useEffect(() => {
    if (state.matchCount > prevMatchCountRef.current && prevMatchCountRef.current >= 0) {
      playMatchSound();
      if (boardAreaRef.current) {
        const rect = boardAreaRef.current.getBoundingClientRect();
        setParticlePos({ x: rect.width / 2, y: rect.height - 40 });
        setParticleTrigger(prev => prev + 1);
      }
    } else if (state.slotTiles.length > prevSlotLenRef.current && state.status === 'playing') {
      playPickSound();
    }

    prevMatchCountRef.current = state.matchCount;
    prevSlotLenRef.current = state.slotTiles.length;
  }, [state.matchCount, state.slotTiles.length, state.status]);

  // 检测所有牌消除 → 推进 'clear' 步骤
  useEffect(() => {
    if (step.trigger === 'clear' && state.tiles.length > 0 && state.tiles.every(t => t.isRemoved)) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setShowBubble(true);
      }, 600);
    }
  }, [state.tiles, step.trigger]);

  // auto 步骤：显示气泡后用户点「知道了」关闭，delay=0 表示不自动跳过
  useEffect(() => {
    if (step.trigger === 'auto' && step.delay !== 0) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setShowBubble(true);
      }, step.delay || 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, step.trigger, step.delay]);

  // 完成教学关
  const handleComplete = useCallback(() => {
    playWinSound();
    if (isTutorial1) {
      initializedRef.current = false;
      setCurrentStep(0);
      prevMatchCountRef.current = 0;
      prevSlotLenRef.current = 0;
      navigate('/tutorial/2');
    } else {
      localStorage.setItem('vita_mahjong_tutorial_done', 'true');
      navigate('/');
    }
  }, [isTutorial1, navigate]);

  // 跳过教学
  const handleSkip = useCallback(() => {
    localStorage.setItem('vita_mahjong_tutorial_done', 'true');
    navigate('/');
  }, [navigate]);

  // 教学关选牌
  const handleTilePick = useCallback((tile: TileInstance) => {
    pickTile(tile);
  }, [pickTile]);

  // 关闭气泡（auto 步骤点知道了 → 推进到下一步）
  const handleDismiss = useCallback(() => {
    setShowBubble(false);
    if (step.trigger === 'auto') {
      setCurrentStep(prev => prev + 1);
    }
  }, [step.trigger]);

  return (
    <div className={styles.container}>
      {/* 顶部 */}
      <div className={styles.topBar}>
        <span className={styles.tutorialTitle}>{layout.name}</span>
        <button className={styles.skipBtn} onClick={handleSkip}>
          跳过教学 →
        </button>
      </div>

      {/* 引导气泡 */}
      {showBubble && step.message && (
        <div className={styles.bubbleOverlay}>
          <div className={styles.bubble}>
            <p className={styles.bubbleText}>
              {step.message.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < step.message.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
            {step.trigger === 'done' ? (
              <button className={styles.bubbleBtn} onClick={handleComplete}>
                {isTutorial1 ? '继续学习 →' : '开始游戏！'}
              </button>
            ) : (
              <button className={styles.bubbleDismiss} onClick={handleDismiss}>
                知道了
              </button>
            )}
          </div>
        </div>
      )}

      {/* 棋盘 */}
      <div className={styles.boardArea} ref={boardAreaRef}>
        <TileBoard
          tiles={state.tiles}
          hintTileUid={step.highlightUid || null}
          onTilePick={handleTilePick}
        />
        <ParticleEffect
          x={particlePos.x}
          y={particlePos.y}
          triggerKey={particleTrigger}
          count={16}
        />
      </div>

      {/* 底部卡槽 */}
      <div className={styles.bottomArea}>
        <SlotBar slotTiles={state.slotTiles} slotCapacity={state.slotCapacity} />
      </div>

      {/* 步骤指示器 */}
      <div className={styles.stepIndicator}>
        {steps.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === currentStep ? styles.dotActive : ''} ${i < currentStep ? styles.dotDone : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
