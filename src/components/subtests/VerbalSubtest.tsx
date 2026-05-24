import { useEffect, useState } from 'react';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
}

export default function VerbalSubtest({ item, onAnswer, softTimeMs }: Props) {
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

  const { pair, target, options } = item.data;
  return (
    <div className="card">
      <p className="muted text-sm mb-2">Analogia · ⏱ {(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '· tempo elevado'}</p>
      <p className="text-xl mb-6">
        <strong>{pair[0]}</strong> está para <strong>{pair[1]}</strong> assim como <strong>{target}</strong> está para…
      </p>
      <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 480, margin: '0 auto' }}>
        {options.map((opt: string, i: number) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`option-cell ${selected === i ? 'selected' : ''}`}
            style={{ aspectRatio: 'auto', padding: '0.9rem', fontWeight: 600 }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-5">
        <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>
        <button className="btn" disabled={selected === null} onClick={() => submit(false)}>Confirmar</button>
      </div>
    </div>
  );
}
