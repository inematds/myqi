interface Props {
  current: number;
  total: number;
  correct?: number;
}

const ENCOURAGE = ['Mandou bem! 🎉', 'Continua assim! ✨', 'Você é demais! 🌟', 'Mais um! 💪', 'Show! 🚀'];

export default function KidsHeader({ current, total, correct = 0 }: Props) {
  const pct = (current / total) * 100;
  const stars = Math.min(5, Math.floor((correct / Math.max(1, current)) * 5));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: 'linear-gradient(135deg, #ff5e8e, #ffc23c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            boxShadow: '0 6px 18px rgba(255,94,142,0.35)',
          }}
        >
          🦊
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>
            {current < total ? ENCOURAGE[current % ENCOURAGE.length] : 'Você terminou! 🏆'}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>
            Questão {current + 1} de {total}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, fontSize: 24 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ opacity: i < stars ? 1 : 0.25 }}>⭐</span>
          ))}
        </div>
      </div>
      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.6)',
          overflow: 'hidden',
          border: '2px solid white',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #ff5e8e, #ffc23c, #5b9bff)',
            transition: 'width 0.4s ease',
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
