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

interface HistoryEntry {
  item: BatteryItem;
  userSelected: any | null;
  correct: boolean | null; // null = not yet answered
}

export default function TrainSession() {
  const _nav = useNavigate();
  const { kind } = useParams<{ kind: string }>();
  const k = (VALID.includes(kind as SubtestKind) ? kind : 'matrix') as SubtestKind;

  // history of items the user has seen this session
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { item: generateOne(k, Math.floor(Math.random() * 1e9)), userSelected: null, correct: null },
  ]);
  const [idx, setIdx] = useState(0);

  // reset when kind changes (navigating to a different subtest)
  useEffect(() => {
    setHistory([{ item: generateOne(k, Math.floor(Math.random() * 1e9)), userSelected: null, correct: null }]);
    setIdx(0);
  }, [k]);

  const current = history[idx];
  const answered = current.correct !== null;

  function handleAnswer(selected: any, _t: number, _to: boolean, correct: boolean) {
    setHistory((h) => {
      const copy = [...h];
      copy[idx] = { ...copy[idx], userSelected: selected, correct };
      return copy;
    });
    logTraining(k, correct ? 1 : 0, 1);
  }

  function goPrev() {
    if (idx > 0) setIdx(idx - 1);
  }

  function goNext() {
    if (idx + 1 < history.length) {
      setIdx(idx + 1);
    } else {
      // generate fresh item and append
      const next: HistoryEntry = {
        item: generateOne(k, Math.floor(Math.random() * 1e9)),
        userSelected: null,
        correct: null,
      };
      setHistory((h) => [...h, next]);
      setIdx(idx + 1);
    }
  }

  const totals = history.filter((h) => h.correct !== null);
  const correctCount = totals.filter((h) => h.correct).length;
  const acc = totals.length ? Math.round((correctCount / totals.length) * 100) : 0;

  return (
    <div className="min-h-screen p-4" style={{ paddingBottom: 96 }}>
      <div className="max-w-2xl mx-auto">
        <BrandHeader compact />

        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Link to="/train" className="btn-ghost btn" style={{ padding: '6px 12px', fontSize: 14 }}>
              ← Treino
            </Link>
            <Link to="/" className="btn-ghost btn" style={{ padding: '6px 12px', fontSize: 14 }}>
              ⌂ Início
            </Link>
          </div>
          <span className="muted text-sm">
            {SUBTEST_LABEL[k]} · item {idx + 1}/{history.length} · acerto {correctCount}/{totals.length} ({acc}%)
          </span>
        </div>

        <div className="subtest-frame">
          {k === 'matrix' && (
            <MatrixSubtest
              key={current.item.id}
              item={current.item}
              onAnswer={handleAnswer}
              softTimeMs={999_999}
              locked={answered}
              userSelected={current.userSelected}
              hideSkip
            />
          )}
          {k === 'verbal' && (
            <VerbalSubtest
              key={current.item.id}
              item={current.item}
              onAnswer={handleAnswer}
              softTimeMs={999_999}
              locked={answered}
              userSelected={current.userSelected}
              hideSkip
            />
          )}
          {k === 'numeric' && (
            <NumericSubtest
              key={current.item.id}
              item={current.item}
              onAnswer={handleAnswer}
              softTimeMs={999_999}
              locked={answered}
              userSelected={current.userSelected}
              hideSkip
            />
          )}
          {k === 'rotation' && (
            <RotationSubtest
              key={current.item.id}
              item={current.item}
              onAnswer={handleAnswer}
              softTimeMs={999_999}
              locked={answered}
              userSelected={current.userSelected}
              hideSkip
            />
          )}
          {k === 'memory' && (
            <MemorySubtest
              key={current.item.id}
              item={current.item}
              onAnswer={handleAnswer}
              softTimeMs={999_999}
              locked={answered}
              userSelected={current.userSelected}
              hideSkip
            />
          )}
        </div>

        <div className="reveal-slot mt-4">
          {answered && (
            <div className="card">
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: current.correct ? 'rgba(46,204,113,0.18)' : 'rgba(231,76,60,0.18)',
                  color: current.correct ? '#2ecc71' : '#e74c3c',
                  fontWeight: 700,
                  marginBottom: 10,
                  width: 'fit-content',
                }}
              >
                {current.correct ? '✓ Correto!' : '✗ Errado'}
              </div>
              <h3 className="font-semibold mb-1">Como resolver:</h3>
              <p className="muted">{itemExplanation(current.item)}</p>
            </div>
          )}
        </div>

        <p className="muted text-xs mt-4 text-center" data-keep>
          Itens são gerados aleatoriamente. Você pode voltar pra revisar exercícios anteriores.
        </p>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '12px 16px',
          background: 'rgba(15,17,28,0.92)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          zIndex: 50,
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between gap-2">
          <button className="btn-ghost btn" disabled={idx === 0} onClick={goPrev}>
            ← Anterior
          </button>
          <button className="btn" onClick={goNext} disabled={!answered && current.userSelected === null}>
            {idx + 1 < history.length ? 'Próximo →' : answered ? 'Novo item →' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}
