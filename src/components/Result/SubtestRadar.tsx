import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { SUBTEST_LABEL } from '../../lib/battery';
import type { SubtestScore } from '../../lib/scoring';

interface Props { perSubtest: SubtestScore[]; }

export default function SubtestRadar({ perSubtest }: Props) {
  const data = perSubtest.map((s) => ({
    subject: SUBTEST_LABEL[s.kind].split(' ')[0],
    iq: s.iq,
    full: 145,
  }));
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[55, 145]} tick={{ fill: 'var(--muted)', fontSize: 10 }} />
          <Radar name="QI por subteste" dataKey="iq" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
