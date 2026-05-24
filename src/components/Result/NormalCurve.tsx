import { AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';

interface Props { iq: number; }

function pdf(x: number) {
  const z = (x - 100) / 15;
  return Math.exp(-z * z / 2) / (15 * Math.sqrt(2 * Math.PI));
}

export default function NormalCurve({ iq }: Props) {
  const data = [];
  for (let x = 55; x <= 145; x += 1) data.push({ iq: x, y: pdf(x) });
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="iq" tick={{ fill: 'var(--muted)', fontSize: 12 }} ticks={[70, 85, 100, 115, 130, 145]} />
          <YAxis hide />
          <Tooltip formatter={(v: any) => Number(v).toFixed(4)} labelFormatter={(l) => `QI ${l}`} />
          <Area type="monotone" dataKey="y" stroke="var(--accent)" fill="url(#cv)" />
          <ReferenceLine x={iq} stroke="var(--err)" strokeWidth={2} label={{ value: `Você: ${iq}`, fill: 'var(--text)', position: 'top' }} />
          <ReferenceLine x={100} stroke="var(--muted)" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
