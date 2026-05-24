import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../store/session';
import { score } from '../lib/scoring';
import NormalCurve from '../components/Result/NormalCurve';
import TimeHeatmap from '../components/Result/TimeHeatmap';
import { exportPDF } from '../components/Result/PDFExport';
import { saveAnonymousSession } from '../lib/supabase';

export default function Result() {
  const nav = useNavigate();
  const { user, profile, answers, items, reset, startedAt, finishedAt } = useSession();

  useEffect(() => {
    if (!user || answers.length === 0) {
      nav('/');
    }
  }, [user, answers, nav]);

  const result = useMemo(() => (user ? score(answers, user.age) : null), [answers, user]);

  useEffect(() => {
    if (!result || !user) return;
    saveAnonymousSession({
      age: user.age,
      gender: user.gender || null,
      education: user.education || null,
      profile,
      iq: result.iq,
      raw: result.rawCorrect,
      total: result.totalItems,
      avg_time_ms: Math.round(result.avgTimeMs),
      timeouts: result.timeouts,
      duration_ms: startedAt && finishedAt ? finishedAt - startedAt : null,
      answers: answers.map((a, i) => ({ i, c: a.correct, t: a.timeMs, to: a.timedOut, d: a.difficulty })),
    });
  }, [result, user, profile, answers, startedAt, finishedAt]);

  if (!result || !user) return null;

  const showNumericIQ = profile !== 'kids';
  const totalTime = startedAt && finishedAt ? Math.round((finishedAt - startedAt) / 1000) : 0;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto" id="report">
        <div className="card mb-4">
          <h1 className="title mb-2">Resultado MyQI</h1>
          <p className="muted">Perfil: {profile} · Idade: {user.age} · Duração: {Math.floor(totalTime / 60)}min {totalTime % 60}s</p>
        </div>

        <div className="card mb-4 text-center">
          {showNumericIQ ? (
            <>
              <div className="muted">QI estimado</div>
              <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>{result.iq}</div>
              <div className="muted">IC 95%: {result.iqCI[0]} — {result.iqCI[1]}</div>
              <div className="mt-3 text-lg font-semibold">{result.band}</div>
              <div className="muted">Percentil: você está acima de ~{result.percentile}% da população</div>
            </>
          ) : (
            <>
              <div className="muted">Sua faixa de raciocínio</div>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{result.band}</div>
              <div className="muted mt-2">Você acertou {result.rawCorrect} de {result.totalItems} questões.</div>
            </>
          )}
        </div>

        {showNumericIQ && (
          <div className="card mb-4">
            <h2 className="font-semibold mb-2">Onde você está na curva normal</h2>
            <NormalCurve iq={result.iq} />
          </div>
        )}

        <div className="card mb-4">
          <h2 className="font-semibold mb-3">Desempenho por dificuldade</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {(['easy', 'medium', 'hard'] as const).map((k) => {
              const b = result.byDifficulty[k];
              const pct = b.total ? Math.round((b.correct / b.total) * 100) : 0;
              return (
                <div key={k} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 }}>
                  <div className="muted text-sm capitalize">{k === 'easy' ? 'Fácil' : k === 'medium' ? 'Médio' : 'Difícil'}</div>
                  <div className="text-2xl font-bold">{b.correct}/{b.total}</div>
                  <div className="muted text-sm">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold mb-2">Mapa de tempo por questão</h2>
          <TimeHeatmap answers={answers} avgTimeMs={result.avgTimeMs} />
          <div className="muted text-sm mt-3">
            Tempo médio por questão: <strong>{(result.avgTimeMs / 1000).toFixed(1)}s</strong> ·
            Timeouts: <strong>{result.timeouts}</strong> ·
            Questões com tempo elevado: <strong>{result.slowItems.length}</strong>
          </div>
          {result.slowItems.length > 0 && (
            <div className="muted text-sm mt-2">
              Você gastou mais tempo nas questões: {result.slowItems.map((i) => i + 1).join(', ')}.
              {result.slowItems.filter((i) => !answers[i].correct).length > 0 &&
                ` Em ${result.slowItems.filter((i) => !answers[i].correct).length} delas, a resposta foi errada — possível indicador de dificuldade com padrões mais complexos.`}
            </div>
          )}
        </div>

        <div className="card mb-4 text-sm muted">
          <strong>Importante:</strong> esta é uma estimativa baseada em itens estilo Raven/ICAR.
          Não substitui avaliação psicométrica profissional (WAIS-IV, WISC-V).
          Fatores como fadiga, ambiente e familiaridade com testes influenciam o resultado.
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-3 justify-center mt-4 flex-wrap">
        <button className="btn" onClick={() => exportPDF('report')}>Baixar PDF</button>
        <button
          className="btn-ghost btn"
          onClick={() => {
            const url = window.location.origin;
            navigator.clipboard?.writeText(`Fiz o MyQI: ${showNumericIQ ? `QI ${result.iq}` : result.band} — ${url}`);
          }}
        >
          Copiar resumo
        </button>
        <button className="btn-ghost btn" onClick={() => { reset(); nav('/'); }}>Refazer teste</button>
      </div>
    </div>
  );
}
