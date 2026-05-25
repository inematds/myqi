import { useEffect, useRef, useState } from 'react';
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

export default function NumericSubtest({ item, onAnswer, softTimeMs, locked = false, userSelected, hideSkip = false, externalAction = false, submitSignal = 0, onCanSubmitChange }: Props) {
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

  useEffect(() => { onCanSubmitChange?.(!locked && selected !== null); }, [selected, locked, onCanSubmitChange]);
  const lastSig = useRef(submitSignal);
  useEffect(() => {
    if (submitSignal !== lastSig.current) {
      lastSig.current = submitSignal;
      if (!locked && selected !== null) submit(false);
    }
  }, [submitSignal, locked, selected]);

  const { series, options } = item.data;
  return (
    <div className="card">
      {!locked && <p className="muted text-sm mb-2">Série numérica · ⏱ {(elapsed / 1000).toFixed(0)}s {elapsed > softTimeMs && '· tempo elevado'}</p>}
      <p className="muted mb-3">Qual o próximo número da sequência?</p>
      <div className="text-center mb-6" style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>
        {series.join(', ')}, <span style={{ color: 'var(--accent)' }}>?</span>
      </div>
      <div className="opt-grid-2">
        {options.map((opt: number, i: number) => (
          <button
            key={i}
            onClick={() => !locked && setSelected(i)}
            disabled={locked}
            className={cellClass(i, selected, item, locked)}
            style={{ aspectRatio: 'auto', minHeight: 72, padding: '1rem', fontSize: 22, fontWeight: 700 }}
          >
            {opt}
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
  );
}
