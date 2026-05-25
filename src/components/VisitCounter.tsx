import { useEffect, useState } from 'react';

const NAMESPACE = 'inema-myqi';
const KEY = 'visits';
const LS_FLAG = 'myqi-counted-v1';

export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const counted = localStorage.getItem(LS_FLAG) === '1';
    // abacus.jasoncameron.dev — endpoints: /hit/<ns>/<key> incrementa, /get/<ns>/<key> só lê
    const url = counted
      ? `https://abacus.jasoncameron.dev/get/${NAMESPACE}/${KEY}`
      : `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${KEY}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (typeof data?.value === 'number') {
          setCount(data.value);
          if (!counted) localStorage.setItem(LS_FLAG, '1');
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      title="Visitas únicas"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 12,
        color: 'var(--text)',
        fontWeight: 600,
      }}
    >
      <span style={{ opacity: 0.7 }}>👁</span>
      {count === null ? '…' : count.toLocaleString('pt-BR')}
    </span>
  );
}
