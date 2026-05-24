import type { Answer } from '../../store/session';

interface Props { answers: Answer[]; avgTimeMs: number; }

function color(a: Answer, avg: number): string {
  if (a.timedOut) return '#6b6b6b';
  const slow = avg > 0 && a.timeMs > avg * 1.5;
  if (a.correct && !slow) return '#2ecc71';
  if (a.correct && slow) return '#f1c40f';
  if (!a.correct && slow) return '#e74c3c';
  return '#c0392b';
}

export default function TimeHeatmap({ answers, avgTimeMs }: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {answers.map((a, i) => (
          <div
            key={i}
            title={`Q${i + 1}: ${a.timedOut ? 'timeout' : (a.timeMs / 1000).toFixed(1) + 's'} — ${a.correct ? 'correto' : 'errado'}`}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: color(a, avgTimeMs),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: 'white',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 muted text-xs">
        <span><span style={{ background: '#2ecc71', display: 'inline-block', width: 12, height: 12, borderRadius: 3 }} /> rápido + certo</span>
        <span><span style={{ background: '#f1c40f', display: 'inline-block', width: 12, height: 12, borderRadius: 3 }} /> lento + certo</span>
        <span><span style={{ background: '#e74c3c', display: 'inline-block', width: 12, height: 12, borderRadius: 3 }} /> lento + errado</span>
        <span><span style={{ background: '#c0392b', display: 'inline-block', width: 12, height: 12, borderRadius: 3 }} /> rápido + errado</span>
        <span><span style={{ background: '#6b6b6b', display: 'inline-block', width: 12, height: 12, borderRadius: 3 }} /> timeout</span>
      </div>
    </div>
  );
}
