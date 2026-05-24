import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import Timer from '../components/Timer';
import { softItemTime } from '../lib/scoring';
import { totalBudgetMs, SUBTEST_LABEL } from '../lib/battery';
import MatrixSubtest from '../components/subtests/MatrixSubtest';
import VerbalSubtest from '../components/subtests/VerbalSubtest';
import NumericSubtest from '../components/subtests/NumericSubtest';
import RotationSubtest from '../components/subtests/RotationSubtest';
import MemorySubtest from '../components/subtests/MemorySubtest';

export default function Test() {
  const nav = useNavigate();
  const {
    items, currentIndex, recordAnswer, next, finish,
    user, profile, version, startedAt, answers, bumpBlur,
  } = useSession();

  useEffect(() => {
    if (!user || !items.length) nav('/');
  }, [user, items, nav]);

  // Anti-cheat: count blur/visibilitychange (V2)
  useEffect(() => {
    if (version !== 'v2') return;
    const onBlur = () => bumpBlur();
    const onVis = () => { if (document.hidden) bumpBlur(); };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [version, bumpBlur]);

  const item = items[currentIndex];
  const budget = useMemo(() => totalBudgetMs(version, profile ?? 'adult'), [version, profile]);
  const softT = useMemo(() => softItemTime(profile ?? 'adult', item?.kind), [profile, item?.kind]);

  function handleAnswer(selected: any, timeMs: number, timedOut: boolean, correct: boolean) {
    if (!item) return;
    recordAnswer({
      itemId: item.id,
      kind: item.kind,
      selected,
      correct,
      timeMs,
      timedOut,
      difficulty: item.difficulty,
    });
    if (currentIndex + 1 >= items.length) {
      finish();
      nav('/result');
    } else {
      next();
    }
  }

  function handleExpire() {
    for (let i = currentIndex; i < items.length; i++) {
      if (!answers.find((a) => a.itemId === items[i].id)) {
        recordAnswer({
          itemId: items[i].id,
          kind: items[i].kind,
          selected: null,
          correct: false,
          timeMs: 0,
          timedOut: true,
          difficulty: items[i].difficulty,
        });
      }
    }
    finish();
    nav('/result');
  }

  if (!item || !startedAt) return null;
  const showTimer = profile !== 'kids';

  // Header section banner per subtest
  const isFirstOfKind = currentIndex === 0 || items[currentIndex - 1].kind !== item.kind;
  const sameKindCount = items.filter((x) => x.kind === item.kind).length;
  const indexInKind = items.slice(0, currentIndex).filter((x) => x.kind === item.kind).length;

  return (
    <div className="min-h-screen">
      <Timer startedAt={startedAt} budgetMs={budget} onExpire={handleExpire} visible={showTimer} />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-3 muted text-sm">
          <span>{SUBTEST_LABEL[item.kind]} — {indexInKind + 1}/{sameKindCount}</span>
          <span>Progresso geral: {currentIndex + 1}/{items.length}</span>
        </div>

        {isFirstOfKind && version === 'v2' && (
          <div className="card mb-3" style={{ background: 'rgba(124,91,250,0.10)' }}>
            <strong>Próximo bloco: {SUBTEST_LABEL[item.kind]}</strong>
            <p className="muted text-sm mt-1">{instructions(item.kind)}</p>
          </div>
        )}

        {item.kind === 'matrix' && <MatrixSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={softT} />}
        {item.kind === 'verbal' && <VerbalSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={softT} />}
        {item.kind === 'numeric' && <NumericSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={softT} />}
        {item.kind === 'rotation' && <RotationSubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={softT} />}
        {item.kind === 'memory' && <MemorySubtest key={item.id} item={item} onAnswer={handleAnswer} softTimeMs={softT} />}
      </div>
    </div>
  );
}

function instructions(kind: string): string {
  switch (kind) {
    case 'matrix': return 'Encontre o padrão nas 8 células e escolha a peça que completa a matriz.';
    case 'verbal': return 'Identifique a relação entre o primeiro par e aplique a mesma relação ao segundo termo.';
    case 'numeric': return 'Descubra a regra que gera a sequência e indique o próximo número.';
    case 'rotation': return 'Compare a forma original e identifique qual alternativa é apenas uma rotação dela (não um espelho).';
    case 'memory': return 'Os dígitos aparecerão um a um. Após o último, digite-os em ordem inversa.';
    default: return '';
  }
}
