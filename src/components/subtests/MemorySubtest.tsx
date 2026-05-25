import { useEffect, useRef, useState } from 'react';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
  locked?: boolean;
  userSelected?: string | null;
  hideSkip?: boolean;
  externalAction?: boolean;
  submitSignal?: number;
  onCanSubmitChange?: (can: boolean) => void;
}

type Phase = 'intro' | 'showing' | 'input';

export default function MemorySubtest({ item, onAnswer, locked = false, userSelected, hideSkip = false, externalAction = false, submitSignal = 0, onCanSubmitChange }: Props) {
  const digits: string[] = item.data.digits;
  const [phase, setPhase] = useState<Phase>(locked ? 'input' : 'intro');
  const [showIdx, setShowIdx] = useState(0);
  const [input, setInput] = useState(locked && userSelected ? userSelected : '');
  const [startedAt, setStartedAt] = useState<number>(0);

  useEffect(() => {
    if (phase !== 'showing') return;
    const id = setInterval(() => {
      setShowIdx((i) => {
        if (i + 1 >= digits.length) {
          clearInterval(id);
          setPhase('input');
          setStartedAt(Date.now());
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [phase, digits.length]);

  function start() {
    setShowIdx(0);
    setPhase('showing');
  }

  function submit(timedOut = false) {
    const correct = input === item.correctAnswer;
    const timeMs = startedAt ? Date.now() - startedAt : 0;
    onAnswer(input, timeMs, timedOut, correct);
  }

  useEffect(() => {
    onCanSubmitChange?.(!locked && phase === 'input' && input.length > 0);
  }, [input, phase, locked, onCanSubmitChange]);
  const lastSig = useRef(submitSignal);
  useEffect(() => {
    if (submitSignal !== lastSig.current) {
      lastSig.current = submitSignal;
      if (!locked && phase === 'input' && input.length > 0) submit(false);
    }
  }, [submitSignal, locked, phase, input]);

  const isWrong = locked && userSelected !== item.correctAnswer;

  return (
    <div className="card text-center">
      <p className="muted text-sm mb-2">Memória de Trabalho — Span Reverso</p>
      <p className="muted mb-4">
        Sequência de <strong>{digits.length}</strong> dígitos. Digite em <strong>ordem inversa</strong>.
      </p>

      {!locked && phase === 'intro' && (
        <button className="btn" onClick={start}>Começar — mostrar dígitos</button>
      )}

      {!locked && phase === 'showing' && (
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, margin: '2rem 0', color: 'var(--accent)' }}>
          {digits[showIdx]}
        </div>
      )}

      {!locked && phase === 'input' && (
        <div>
          <p className="muted text-sm mb-2">Sequência mostrada: <strong>{digits.join(' ')}</strong></p>
          <input
            className="input text-center"
            style={{ fontSize: 28, letterSpacing: 6, fontWeight: 700, maxWidth: 320, margin: '1rem auto' }}
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, digits.length))}
            placeholder="digite invertido"
            autoFocus
            inputMode="numeric"
          />
          {!externalAction && (
            <div className="flex justify-center gap-3 mt-3">
              {!hideSkip && <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>}
              <button className="btn" disabled={input.length === 0} onClick={() => submit(false)}>Confirmar</button>
            </div>
          )}
        </div>
      )}

      {locked && (
        <div style={{ marginTop: 12 }}>
          <p className="muted text-sm">Sequência: <strong>{digits.join(' ')}</strong></p>
          <p className="muted text-sm mt-2">
            Sua resposta:
            <span
              style={{
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 4,
                marginLeft: 8,
                color: isWrong ? '#e74c3c' : '#2ecc71',
              }}
            >
              {userSelected || '—'}
            </span>
          </p>
          {isWrong && (
            <p className="muted text-sm mt-1">
              Correto:
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: 4, marginLeft: 8, color: '#2ecc71' }}>
                {item.correctAnswer}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
