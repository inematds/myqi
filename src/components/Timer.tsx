import { useEffect, useState } from 'react';

interface Props {
  startedAt: number;
  budgetMs: number;
  onExpire: () => void;
  visible?: boolean;
}

export default function Timer({ startedAt, budgetMs, onExpire, visible = true }: Props) {
  const [remaining, setRemaining] = useState(Math.max(0, budgetMs - (Date.now() - startedAt)));

  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, budgetMs - (Date.now() - startedAt));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onExpire();
      }
    }, 500);
    return () => clearInterval(id);
  }, [startedAt, budgetMs, onExpire]);

  if (!visible) return null;
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const low = remaining < 60_000;
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        background: low ? 'var(--err)' : 'var(--surface)',
        color: low ? 'white' : 'var(--text)',
        padding: '6px 12px',
        borderRadius: 10,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 700,
        zIndex: 10,
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
      }}
    >
      {m}:{s.toString().padStart(2, '0')}
    </div>
  );
}
