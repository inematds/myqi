import { useEffect, useRef, useState } from 'react';
import CellView from '../CellView';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
  locked?: boolean;
  userSelected?: number | null;
  hideSkip?: boolean;
  externalAction?: boolean;
  submitSignal?: number;
  onCanSubmitChange?: (can: boolean) => void;
}

function cellClass(i: number, selected: number | null, item: BatteryItem, locked: boolean) {
  const base = 'option-cell';
  if (!locked) return `${base}${selected === i ? ' selected' : ''}`;
  if (i === item.correctAnswer) return `${base} reveal-correct`;
  if (i === selected && selected !== item.correctAnswer) return `${base} reveal-wrong`;
  return base;
}

export default function MatrixSubtest({ item, onAnswer, softTimeMs, locked = false, userSelected, hideSkip = false, externalAction = false, submitSignal = 0, onCanSubmitChange }: Props) {
  const [selected, setSelected] = useState<number | null>(userSelected ?? null);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt, locked]);

  const submit = (timedOut = false) => {
    const timeMs = Date.now() - startedAt;
    onAnswer(selected, timeMs, timedOut, selected === item.correctAnswer);
  };

  useEffect(() => {
    onCanSubmitChange?.(!locked && selected !== null);
  }, [selected, locked, onCanSubmitChange]);

  const lastSig = useRef(submitSignal);
  useEffect(() => {
    if (submitSignal !== lastSig.current) {
      lastSig.current = submitSignal;
      if (!locked && selected !== null) submit(false);
    }
  }, [submitSignal, locked, selected]);

  return (
    <>
      <div className="card mb-4">
        {!locked && (
          <p className="muted mb-3 text-sm">Identifique o padrão e escolha a peça que completa a matriz. ⏱ {(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '· tempo elevado'}</p>
        )}
        <div className="grid grid-cols-3 gap-2" style={{ maxWidth: 480, margin: '0 auto' }}>
          {item.data.matrix.map((c: any, i: number) => (
            <div key={i} className="option-cell" style={{ cursor: 'default' }}>
              <CellView cell={c} />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        {!locked && <p className="muted mb-3 text-sm">Alternativas:</p>}
        <div className="grid grid-cols-4 gap-2" style={{ maxWidth: 480, margin: '0 auto' }}>
          {item.data.options.map((opt: any, i: number) => (
            <button
              key={i}
              onClick={() => !locked && setSelected(i)}
              disabled={locked}
              className={cellClass(i, selected, item, locked)}
            >
              <CellView cell={opt} />
            </button>
          ))}
        </div>
        {!locked && !externalAction && (
          <div className={`flex mt-5 ${hideSkip ? 'justify-end' : 'justify-between'}`}>
            {!hideSkip && <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>}
            <button className="btn" disabled={selected === null} onClick={() => submit(false)}>Confirmar</button>
          </div>
        )}
      </div>
    </>
  );
}
