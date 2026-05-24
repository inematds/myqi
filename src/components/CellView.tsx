import type { Cell } from '../lib/items';

interface Props {
  cell: Cell | null;
  size?: number;
}

function shapePath(shape: Cell['shape'], size: number, cx: number, cy: number) {
  const r = size * 0.36;
  switch (shape) {
    case 'circle':
      return <circle cx={cx} cy={cy} r={r} />;
    case 'square':
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} />;
    case 'triangle': {
      const h = r * 1.1;
      const pts = `${cx},${cy - h} ${cx - h},${cy + h * 0.7} ${cx + h},${cy + h * 0.7}`;
      return <polygon points={pts} />;
    }
    case 'diamond': {
      const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
      return <polygon points={pts} />;
    }
    case 'hex': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');
      return <polygon points={pts} />;
    }
  }
}

export default function CellView({ cell, size = 110 }: Props) {
  if (!cell) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          border: '2px dashed rgba(255,255,255,0.25)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'var(--muted)',
        }}
      >
        ?
      </div>
    );
  }
  const positions =
    cell.count === 1
      ? [[size / 2, size / 2]]
      : cell.count === 2
      ? [[size * 0.32, size / 2], [size * 0.68, size / 2]]
      : [
          [size * 0.28, size * 0.32],
          [size * 0.72, size * 0.32],
          [size / 2, size * 0.72],
        ];
  const inner = size / (cell.count === 1 ? 1 : 2.4);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: 'block' }}>
      <g transform={`rotate(${cell.rotation} ${size / 2} ${size / 2})`}>
        {positions.map(([x, y], i) => (
          <g
            key={i}
            transform={`translate(${x - inner / 2} ${y - inner / 2})`}
            fill={cell.filled ? cell.color : 'transparent'}
            stroke={cell.color}
            strokeWidth={cell.filled ? 0 : 4}
          >
            {shapePath(cell.shape, inner, inner / 2, inner / 2)}
          </g>
        ))}
      </g>
    </svg>
  );
}
