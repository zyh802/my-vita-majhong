import React, { memo } from 'react';

interface TileFaceProps {
  suit: string;   // 'wan' | 'tiao' | 'tong' | 'feng' | 'jian'
  rank: number;   // 1-9 for wan/tiao/tong, 1-4 for feng, 1-3 for jian
  size?: number;  // viewBox scale, default 40
}

/* ─── 万 (Characters): 中文数字 + "万" ─── */
const NUM_CHARS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

function WanFace({ rank, s }: { rank: number; s: number }) {
  return (
    <>
      <text
        x={s / 2} y={s * 0.40}
        textAnchor="middle" dominantBaseline="central"
        fontSize={s * 0.42} fontWeight="700"
        fill="#c41e3a"
        fontFamily="'Noto Serif SC','PingFang SC','SimSun',serif"
      >
        {NUM_CHARS[rank - 1]}
      </text>
      <text
        x={s / 2} y={s * 0.78}
        textAnchor="middle" dominantBaseline="central"
        fontSize={s * 0.30} fontWeight="700"
        fill="#c41e3a"
        fontFamily="'Noto Serif SC','PingFang SC','SimSun',serif"
      >
        万
      </text>
    </>
  );
}

/* ─── 筒 (Circles): 圆圈图案，蓝色 ─── */
const CIRCLE_POS: Record<number, [number, number][]> = {
  1: [[.5, .5]],
  2: [[.5, .3], [.5, .7]],
  3: [[.5, .22], [.5, .5], [.5, .78]],
  4: [[.3, .3], [.7, .3], [.3, .7], [.7, .7]],
  5: [[.3, .25], [.7, .25], [.5, .5], [.3, .75], [.7, .75]],
  6: [[.3, .22], [.7, .22], [.3, .5], [.7, .5], [.3, .78], [.7, .78]],
  7: [[.3, .18], [.7, .18], [.3, .44], [.7, .44], [.3, .7], [.7, .7], [.5, .9]],
  8: [[.3, .17], [.7, .17], [.3, .39], [.7, .39], [.3, .61], [.7, .61], [.3, .83], [.7, .83]],
  9: [[.25, .17], [.5, .17], [.75, .17], [.25, .5], [.5, .5], [.75, .5], [.25, .83], [.5, .83], [.75, .83]],
};

function TongFace({ rank, s }: { rank: number; s: number }) {
  const positions = CIRCLE_POS[rank] || [];
  const r = rank <= 2 ? s * 0.15 : rank <= 5 ? s * 0.12 : s * 0.10;
  return (
    <>
      {positions.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx * s} cy={cy * s} r={r} fill="#1565C0" />
          <circle cx={cx * s} cy={cy * s} r={r * 0.5} fill="#E3F2FD" />
        </g>
      ))}
    </>
  );
}

/* ─── 条 (Bamboos): 竹节 ─── */
function Stick({ x, y, h, w }: { x: number; y: number; h: number; w: number }) {
  const seg = 3;
  const segH = h / seg;
  return (
    <g>
      {Array.from({ length: seg }).map((_, i) => (
        <rect key={i} x={x - w / 2} y={y + i * segH + 0.5} width={w} height={segH - 1}
          rx={w * 0.3} fill={i % 2 === 0 ? '#2E7D32' : '#43A047'} />
      ))}
    </g>
  );
}

function OneBamboo({ s }: { s: number }) {
  return (
    <g>
      <rect x={s * 0.36} y={s * 0.2} width={s * 0.28} height={s * 0.62} rx={s * 0.06} fill="#2E7D32" />
      {[0.36, 0.5, 0.64].map((py, i) => (
        <line key={i} x1={s * 0.36} y1={s * py} x2={s * 0.64} y2={s * py}
          stroke="#1B5E20" strokeWidth={1.5} />
      ))}
      <polygon points={`${s * .5},${s * .08} ${s * .64},${s * .2} ${s * .5},${s * .27} ${s * .36},${s * .2}`}
        fill="#C62828" />
    </g>
  );
}

const BAMBOO_POS: Record<number, [number, number][]> = {
  2: [[.35, .12], [.65, .12]],
  3: [[.25, .12], [.5, .12], [.75, .12]],
  4: [[.3, .08], [.7, .08], [.3, .52], [.7, .52]],
  5: [[.25, .08], [.5, .08], [.75, .08], [.37, .52], [.63, .52]],
  6: [[.25, .08], [.5, .08], [.75, .08], [.25, .52], [.5, .52], [.75, .52]],
  7: [[.25, .06], [.5, .06], [.75, .06], [.25, .38], [.5, .38], [.75, .38], [.5, .7]],
  8: [[.25, .06], [.5, .06], [.75, .06], [.25, .36], [.5, .36], [.75, .36], [.37, .66], [.63, .66]],
  9: [[.25, .05], [.5, .05], [.75, .05], [.25, .35], [.5, .35], [.75, .35], [.25, .65], [.5, .65], [.75, .65]],
};

function TiaoFace({ rank, s }: { rank: number; s: number }) {
  if (rank === 1) return <OneBamboo s={s} />;
  const pos = BAMBOO_POS[rank] || [];
  const h = rank <= 3 ? s * 0.72 : s * 0.38;
  const w = s * 0.09;
  return (
    <>
      {pos.map(([px, py], i) => (
        <Stick key={i} x={px * s} y={py * s} h={h} w={w} />
      ))}
    </>
  );
}

/* ─── 风 (Winds): 东南西北 ─── */
const WIND_CHARS = ['东', '南', '西', '北'];

function FengFace({ rank, s }: { rank: number; s: number }) {
  return (
    <text
      x={s / 2} y={s * 0.55}
      textAnchor="middle" dominantBaseline="central"
      fontSize={s * 0.55} fontWeight="900"
      fill="#1a1a1a"
      fontFamily="'Noto Serif SC','PingFang SC','SimSun',serif"
    >
      {WIND_CHARS[rank - 1]}
    </text>
  );
}

/* ─── 箭 (Dragons): 中發白 ─── */
function JianFace({ rank, s }: { rank: number; s: number }) {
  if (rank === 1) {
    return (
      <text x={s / 2} y={s * 0.55} textAnchor="middle" dominantBaseline="central"
        fontSize={s * 0.6} fontWeight="900" fill="#c41e3a"
        fontFamily="'Noto Serif SC','PingFang SC','SimSun',serif">
        中
      </text>
    );
  }
  if (rank === 2) {
    return (
      <text x={s / 2} y={s * 0.55} textAnchor="middle" dominantBaseline="central"
        fontSize={s * 0.6} fontWeight="900" fill="#2E7D32"
        fontFamily="'Noto Serif SC','PingFang SC','SimSun',serif">
        發
      </text>
    );
  }
  // 白板
  return (
    <rect x={s * 0.2} y={s * 0.15} width={s * 0.6} height={s * 0.7}
      rx={s * 0.06} fill="none" stroke="#5C6BC0" strokeWidth={2} />
  );
}

/* ─── Main Component ─── */
const TileFaceComponent: React.FC<TileFaceProps> = ({ suit, rank, size = 40 }) => {
  const s = size;
  return (
    <svg viewBox={`0 0 ${s} ${s}`} width="100%" height="100%"
      xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {suit === 'wan' && <WanFace rank={rank} s={s} />}
      {suit === 'tong' && <TongFace rank={rank} s={s} />}
      {suit === 'tiao' && <TiaoFace rank={rank} s={s} />}
      {suit === 'feng' && <FengFace rank={rank} s={s} />}
      {suit === 'jian' && <JianFace rank={rank} s={s} />}
    </svg>
  );
};

export const TileFace = memo(TileFaceComponent);
export default TileFace;
