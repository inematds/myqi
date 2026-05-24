import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SUBTEST_LABEL, SubtestKind, generateOne, itemExplanation, BatteryItem } from '../lib/battery';
import { logTraining } from '../lib/trainingStore';
import BrandHeader from '../components/BrandHeader';
import MatrixSubtest from '../components/subtests/MatrixSubtest';
import VerbalSubtest from '../components/subtests/VerbalSubtest';
import NumericSubtest from '../components/subtests/NumericSubtest';
import RotationSubtest from '../components/subtests/RotationSubtest';
import MemorySubtest from '../components/subtests/MemorySubtest';

const VALID: SubtestKind[] = ['matrix', 'verbal', 'numeric', 'rotation', 'memory'];

export default function TrainSession() {
  const nav = useNavigate();
  const { kind } = useParams<{ kind: string }>();
  const k = (VALID.includes(kind as SubtestKind) ? kind : 'matrix') as SubtestKind;

  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1e9));
  const [revealing, setRevealing] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState({ correct: 0, total: 0 });

  const item: BatteryItem = useMemo(() => generateOne(k, seed), [k, seed]);

  useEffect(() => {
    setRevealing(false);
    setLastCorrect(null);
  }, [seed]);

  function handleAnswer(_sel: any, _t: number, _to: boolean, correct: boolean) {
    setLastCorrect(correct);
    setRevealing(true);
    setStreak((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    logTraining(k, correct ? 1 : 0, 1);
  }

  function nextItem() {
    setSeed(Math.floor(Math.random() * 1e9));
  }

  const acc = streak.total ? Math.round((streak.correct / streak.total) * 100) : 0;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <BrandHeader compact />
        <div className="flex justify-between items-center mb-3">
          <Link to="/train" className="muted text-sm">← voltar</Link>
          <span className="muted text-sm">
            Treino · {SUBTEST_LABEL[k]} · {streak.correct}/{streak.total} ({acc}%)
          </span>
        </div>

        <div className="subtest-frame">
          {!revealing && k === 'matrix' && <MatrixSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={999_999} />}
          {!revealing && k === 'verbal' && <VerbalSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={999_999} />}
          {!revealing && k === 'numeric' && <NumericSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={999_999} />}
          {!revealing && k === 'rotation' && <RotationSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={999_999} />}
          {!revealing && k === 'memory' && <MemorySubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={999_999} />}

          {revealing && (
            <div className="card">
              <div className="text-center mb-3">
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: lastCorrect ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)',
                    color: lastCorrect ? '#2ecc71' : '#e74c3c',
                    fontWeight: 700,
                  }}
                >
                  {lastCorrect ? '✓ Correto!' : '✗ Errado'}
                </div>
              </div>
              <h3 className="font-semibold mb-2">Como resolver:</h3>
              <p className="muted">{itemExplanation(item)}</p>
              {k !== 'memory' && k !== 'rotation' && k !== 'matrix' && (
                <p className="muted mt-2 text-sm">
                  Resposta correta:
                  <strong style={{ color: 'var(--text)', marginLeft: 6 }}>
                    {k === 'verbal' ? item.data.options[item.correctAnswer] :
                     k === 'numeric' ? item.data.options[item.correctAnswer] : ''}
                  </strong>
                </p>
              )}
              <div className="flex justify-end mt-4">
                <button className="btn" onClick={nextItem}>Próximo item →</button>
              </div>
            </div>
          )}
        </div>

        <p className="muted text-xs mt-4 text-center">
          Itens são gerados aleatoriamente. Não há score de QI no treino.
        </p>
      </div>
    </div>
  );
}
