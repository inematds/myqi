import { useEffect, useState } from 'react';
import CellView from '../CellView';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
}

export default function MatrixSubtest({ item, onAnswer, softTimeMs }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const submit = (timedOut = false) => {
    const timeMs = Date.now() - startedAt;
    onAnswer(selected, timeMs, timedOut, selected === item.correctAnswer);
  };

  return (
    <>
      <div className="card mb-4">
        <p className="muted mb-3 text-sm">Identifique o padrão e escolha a peça que completa a matriz. ⏱ {(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '· tempo elevado'}</p>
        <div className="grid grid-cols-3 gap-2" style={{ maxWidth: 380, margin: '0 auto' }}>
          {item.data.matrix.map((c: any, i: number) => (
            <div key={i} className="option-cell" style={{ cursor: 'default' }}>
              <CellView cell={c} />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <p className="muted mb-3 text-sm">Alternativas:</p>
        <div className="grid grid-cols-4 gap-2">
          {item.data.options.map((opt: any, i: number) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`option-cell ${selected === i ? 'selected' : ''}`}
            >
              <CellView cell={opt} />
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
