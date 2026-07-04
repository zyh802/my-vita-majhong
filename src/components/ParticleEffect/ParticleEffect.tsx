import React, { useEffect, useRef, memo } from 'react';
import styles from './ParticleEffect.module.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

interface ParticleEffectProps {
  /** 爆发点 X 坐标（相对于容器） */
  x: number;
  /** 爆发点 Y 坐标（相对于容器） */
  y: number;
  /** 粒子颜色组 */
  colors?: string[];
  /** 粒子数量 */
  count?: number;
  /** 触发 key，每次变化触发新的爆发 */
  triggerKey: number;
}

const DEFAULT_COLORS = ['#FFD700', '#FF9500', '#FF6B35', '#FFA500', '#FFEC8B', '#FF4500'];

const ParticleEffectComponent: React.FC<ParticleEffectProps> = ({
  x,
  y,
  colors = DEFAULT_COLORS,
  count = 12,
  triggerKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    if (triggerKey <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 大小为父容器大小
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // 创建粒子
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.4,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }

    let lastTime = performance.now();

    function animate(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;

        p.life -= dt / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 3 * dt;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;

        const alpha = Math.max(0, p.life);
        const scale = 0.5 + alpha * 0.5;
        const s = p.size * scale;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = s * 2;

        // 绘制带光晕的小方块粒子
        ctx!.fillRect(-s / 2, -s / 2, s, s);

        ctx!.restore();
      }

      if (alive) {
        animIdRef.current = requestAnimationFrame(animate);
      }
    }

    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [triggerKey, x, y, colors, count]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.particleCanvas}
    />
  );
};

export const ParticleEffect = memo(ParticleEffectComponent);
export default ParticleEffect;
