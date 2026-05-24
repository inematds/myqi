import { useEffect, useState } from 'react';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
  locked?: boolean;
  userSelected?: number | null;
  hideSkip?: boolean;
}

function cellClass(i: number, selected: number | null, item: BatteryItem, locked: boolean) {
  const base = 'option-cell';
  if (!locked) return `${base}${selected === i ? ' selected' : ''}`;
  if (i === item.correctAnswer) return `${base} reveal-correct`;
  if (i === selected && selected !== item.correctAnswer) return `${base} reveal-wrong`;
  return base;
}

export default function VerbalSubtest({ item, onAnswer, softTimeMs, locked = false, userSelected, hideSkip = false }: Props) {
  const [selected, setSelected] = useState<number | null>(userSelected ?? null);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt, locked]);

  const submit = (timedOut = false) => {
    onAnswer(selected, Date.now() - startedAt, timedOut, selected === item.correctAnswer);
  };

  const { pair, target, options } = item.data;
  return (
    <div className="card">
      {!locked && <p className="muted text-sm mb-2">Analogia · ⏱ {(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '· tempo elevado'}</p>}
      <p className="text-xl mb-6">
        <strong>{pair[0]}</strong> está para <strong>{pair[1]}</strong> assim como <strong>{target}</strong> está para…
      </p>
      <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 480, margin: '0 auto' }}>
        {options.map((opt: string, i: number) => (
          <button
            key={i}
            onClick={() => !locked && setSelected(i)}
            disabled={locked}
            className={cellClass(i, selected, item, locked)}
            style={{ aspectRatio: 'auto', padding: '0.9rem', fontWeight: 600 }}
          >
            {opt}
          </button>
        ))}
      </div>
      {!locked && (
        <div className={`flex mt-5 ${hideSkip ? 'justify-end' : 'justify-between'}`}>
          {!hideSkip && <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>}
          <button className="btn" disabled={selected === null} onClick={() => submit(false)}>Confirmar</button>
        </div>
      )}
    </div>
  );
}
