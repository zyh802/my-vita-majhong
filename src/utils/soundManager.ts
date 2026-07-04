/**
 * 游戏音效管理器
 * 使用 Web Audio API 程序化合成音效，零外部依赖
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // 自动恢复被浏览器挂起的 AudioContext
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 选牌音效 — 短促清脆的麻将碰击声
 * 用高频噪声 + 快速衰减模拟陶瓷/竹质碰击
 */
export function playPickSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 短促噪声爆发（模拟碰击）
    const bufferSize = ctx.sampleRate * 0.06; // 60ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // 带通滤波器 — 只保留高频的清脆部分
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3500;
    filter.Q.value = 2;

    // 音量包络
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.06);
  } catch {
    // 静默失败
  }
}

/**
 * 消除音效 — 清脆的消除成功声
 * 两个短音上行（do-mi 感觉）
 */
export function playMatchSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 音符 1
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 880; // A5
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // 音符 2（稍高，稍后）
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 1174; // D6
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.25, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.2);
  } catch {
    // 静默失败
  }
}

/**
 * 连击音效 — 更高音调更华丽的升调
 * comboCount 越高音调越高
 */
export function playComboSound(comboCount: number): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // 基础频率随连击数提高（最高到 2000Hz）
    const baseFreq = Math.min(660 + comboCount * 110, 2000);

    // 三连音快速琶音
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = baseFreq * (1 + i * 0.25);
      const gain = ctx.createGain();
      const t = now + i * 0.05;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  } catch {
    // 静默失败
  }
}

/**
 * 失败音效 — 低沉下降
 */
export function playFailSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // 静默失败
  }
}

/**
 * 胜利音效 — 欢快上行琶音
 */
export function playWinSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5-E5-G5-C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.setValueAtTime(0.2, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // 静默失败
  }
}

/**
 * 道具使用音效
 */
export function playToolSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // 静默失败
  }
}
