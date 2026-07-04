import type { LevelProgress } from '../types';

const STORAGE_KEY = 'vita_mahjong_progress';

/**
 * 从 localStorage 加载所有关卡进度
 */
export function loadProgress(): LevelProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LevelProgress[];
  } catch {
    return [];
  }
}

/**
 * 保存所有关卡进度到 localStorage
 */
export function saveProgress(progress: LevelProgress[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage 可能已满或不可用，静默忽略
  }
}

/**
 * 获取指定关卡的进度
 */
export function getLevelProgress(levelId: number): LevelProgress | undefined {
  const progress = loadProgress();
  return progress.find((p) => p.levelId === levelId);
}

/**
 * 更新指定关卡的进度（部分更新）
 */
export function updateLevelProgress(levelId: number, data: Partial<LevelProgress>): void {
  const progress = loadProgress();
  const index = progress.findIndex((p) => p.levelId === levelId);

  if (index !== -1) {
    progress[index] = { ...progress[index], ...data };
  } else {
    progress.push({
      levelId,
      completed: false,
      bestScore: 0,
      bestTime: 0,
      stars: 0,
      ...data,
    });
  }

  saveProgress(progress);
}

/**
 * 获取最大已解锁关卡号。
 * 规则：第 1 关始终解锁，通关第 N 关后解锁第 N+1 关。
 */
export function getMaxUnlockedLevel(): number {
  const progress = loadProgress();
  let maxUnlocked = 1;

  for (const p of progress) {
    if (p.completed && p.levelId + 1 > maxUnlocked) {
      maxUnlocked = p.levelId + 1;
    }
  }

  return maxUnlocked;
}
