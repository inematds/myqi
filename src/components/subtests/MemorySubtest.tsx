import { useEffect, useState } from 'react';
import type { BatteryItem } from '../../lib/battery';

interface Props {
  item: BatteryItem;
  onAnswer: (selected: any, timeMs: number, timedOut: boolean, correct: boolean) => void;
  softTimeMs: number;
}

type Phase = 'intro' | 'showing' | 'input';

export default function MemorySubtest({ item, onAnswer }: Props) {
  const digits: string[] = item.data.digits;
  const [phase, setPhase] = useState<Phase>('intro');
  const [showIdx, setShowIdx] = useState(0);
  const [input, setInput] = useState('');
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

  return (
    <div className="card text-center">
      <p className="muted text-sm mb-2">Memória de Trabalho — Span Reverso</p>
      <p className="muted mb-4">
        Memorize os {digits.length} dígitos exibidos e depois digite-os em <strong>ordem inversa</strong>.
      </p>

      {phase === 'intro' && (
        <button className="btn" onClick={start}>Começar — mostrar dígitos</button>
      )}

      {phase === 'showing' && (
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, margin: '2rem 0', color: 'var(--accent)' }}>
          {digits[showIdx]}
        </div>
      )}

      {phase === 'input' && (
        <div>
          <input
            className="input text-center"
            style={{ fontSize: 28, letterSpacing: 6, fontWeight: 700, maxWidth: 320, margin: '1rem auto' }}
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, digits.length))}
            placeholder="digite invertido"
            autoFocus
            inputMode="numeric"
          />
          <div className="flex justify-center gap-3 mt-3">
            <button className="btn-ghost btn" onClick={() => submit(true)}>Pular</button>
            <button className="btn" disabled={input.length === 0} onClick={() => submit(false)}>Confirmar</button>
          </div>
        </div>
      )}
    </div>
  );
}
