import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import MatrixItem from '../components/MatrixItem';
import Timer from '../components/Timer';
import { totalTimeBudget, softItemTime } from '../lib/scoring';

export default function Test() {
  const nav = useNavigate();
  const { items, currentIndex, recordAnswer, next, finish, user, profile, startedAt, answers } = useSession();

  useEffect(() => {
    if (!user || !items.length) {
      nav('/');
    }
  }, [user, items, nav]);

  const item = items[currentIndex];
  const budget = useMemo(() => totalTimeBudget(profile ?? 'adult'), [profile]);
  const softT = useMemo(() => softItemTime(profile ?? 'adult'), [profile]);

  function handleAnswer(selected: number | null, timeMs: number, timedOut: boolean) {
    if (!item) return;
    recordAnswer({
      itemId: item.id,
      selected,
      correct: selected === item.correctIndex,
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
    // mark remaining as timeouts
    for (let i = currentIndex; i < items.length; i++) {
      if (!answers.find((a) => a.itemId === items[i].id)) {
        recordAnswer({
          itemId: items[i].id,
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

  // hide timer for kids profile
  const showTimer = profile !== 'kids';

  return (
    <div className="min-h-screen">
      <Timer startedAt={startedAt} budgetMs={budget} onExpire={handleExpire} visible={showTimer} />
      <MatrixItem
        key={item.id}
        item={item}
        index={currentIndex}
        total={items.length}
        onAnswer={handleAnswer}
        softTimeMs={softT}
      />
    </div>
  );
}
