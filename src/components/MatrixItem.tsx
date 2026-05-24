import { useEffect, useState } from 'react';
import type { Item } from '../lib/items';
import CellView from './CellView';

interface Props {
  item: Item;
  index: number;
  total: number;
  onAnswer: (selected: number | null, timeMs: number, timedOut: boolean) => void;
  softTimeMs: number;
}

export default function MatrixItem({ item, index, total, onAnswer, softTimeMs }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [startedAt] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const submit = (timedOut = false) => {
    const timeMs = Date.now() - startedAt;
    onAnswer(selected, timeMs, timedOut);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4 muted text-sm">
        <span>Questão {index + 1} de {total}</span>
        <span>{(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '⏱ atenção ao tempo'}</span>
      </div>

      <div className="card mb-4">
        <p className="muted mb-3 text-sm">Identifique o padrão e escolha a peça que completa a matriz.</p>
        <div className="grid grid-cols-3 gap-2" style={{ maxWidth: 380, margin: '0 auto' }}>
          {item.matrix.map((c, i) => (
            <div key={i} className="option-cell" style={{ cursor: 'default' }}>
              <CellView cell={c} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="muted mb-3 text-sm">Alternativas:</p>
        <div className="grid grid-cols-4 gap-2">
          {item.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`option-cell ${selected === i ? 'selected' : ''}`}
              aria-label={`Opção ${i + 1}`}
            >
              <CellView cell={opt} />
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-5">
          <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>
          <button className="btn" disabled={selected === null} onClick={() => submit(false)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
