import { Link } from 'react-router-dom';
import VisitCounter from './VisitCounter';

interface Props { compact?: boolean; }

export default function BrandHeader({ compact = false }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: compact ? '8px 0' : '12px 0',
        marginBottom: compact ? 0 : 8,
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--accent)',
            color: 'white',
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          Qi
        </span>
        <strong style={{ color: 'var(--text)', fontSize: 20 }}>MyQI</strong>
        <span className="muted" style={{ fontSize: 14 }}>·</span>
        <a
          href="https://inema.club"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: 0.5, fontSize: 14 }}
        >
          INEMA.CLUB
        </a>
      </Link>
      <VisitCounter />
    </div>
  );
}
