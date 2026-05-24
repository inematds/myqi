import { useEffect, useState } from 'react';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
}

function ShapeSVG({ pts, color = 'var(--accent)' }: { pts: [number, number][]; color?: string }) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d={d} fill={color} opacity={0.85} />
    </svg>
  );
}

export default function RotationSubtest({ item, onAnswer, softTimeMs }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const submit = (timedOut = false) => {
    onAnswer(selected, Date.now() - startedAt, timedOut, selected === item.correctAnswer);
  };

  const { base, options } = item.data;
  return (
    <>
      <div className="card mb-4">
        <p className="muted text-sm mb-2">Rotação Mental · ⏱ {(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '· tempo elevado'}</p>
        <p className="muted mb-3">Qual das alternativas é a forma original <strong>rotacionada</strong> (sem espelhamento)?</p>
        <div style={{ width: 160, margin: '0 auto' }}>
          <div className="option-cell" style={{ cursor: 'default' }}>
            <ShapeSVG pts={base} color="#7c5bfa" />
          </div>
          <p className="text-center muted text-xs mt-1">Forma original</p>
        </div>
      </div>
      <div className="card">
        <div className="grid grid-cols-4 gap-2" style={{ maxWidth: 480, margin: '0 auto' }}>
          {options.map((opt: [number, number][], i: number) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`option-cell ${selected === i ? 'selected' : ''}`}
            >
              <ShapeSVG pts={opt} />
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-5">
          <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>
          <button className="btn" disabled={selected === null} onClick={() => submit(false)}>Confirmar</button>
        </div>
      </div>
    </>
  );
}
