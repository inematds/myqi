import { Link, useNavigate } from 'react-router-dom';
import { SUBTEST_LABEL, SubtestKind } from '../lib/battery';
import { getStats } from '../lib/trainingStore';
import BrandHeader from '../components/BrandHeader';

const KINDS: SubtestKind[] = ['matrix', 'verbal', 'numeric', 'rotation', 'memory'];

const DESCRIPTIONS: Record<SubtestKind, string> = {
  matrix: 'Matrizes 3×3 — encontre o padrão entre formas, cores e quantidades.',
  verbal: 'Analogias verbais — descubra a relação entre palavras.',
  numeric: 'Séries numéricas — identifique a regra (aritmética, geométrica, Fibonacci, etc.).',
  rotation: 'Rotação mental — distinga rotações puras de espelhamentos.',
  memory: 'Memória de trabalho — repita dígitos em ordem inversa.',
};

export default function Train() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <BrandHeader />
        <div className="card mb-4">
          <Link to="/" className="muted text-sm">← voltar</Link>
          <h1 className="title mt-2 mb-2">Modo Treino</h1>
          <p className="muted">
            Pratique cada subteste com itens ilimitados, sem cronômetro. Após cada resposta você vê a
            regra correta — é assim que se aprende a reconhecer padrões.
          </p>
          <p className="muted text-sm mt-3">
            <strong>Importante:</strong> treinar melhora teu <em>desempenho em testes</em> e desenvolve
            raciocínios úteis, mas <strong>não</strong> aumenta diretamente o "QI real" (fator g).
            <Link to="/melhorar" style={{ color: 'var(--accent)', marginLeft: 6 }}>Entenda como melhorar →</Link>
          </p>
        </div>

        <div className="grid gap-3">
          {KINDS.map((k) => {
            const s = getStats(k);
            const acc = s.total ? Math.round(s.accuracy * 100) : null;
            return (
              <button
                key={k}
                onClick={() => nav(`/train/${k}`)}
                className="card text-left"
                style={{ display: 'block', cursor: 'pointer', border: 'none', width: '100%' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{SUBTEST_LABEL[k]}</strong>
                    <p className="muted text-sm mt-1">{DESCRIPTIONS[k]}</p>
                  </div>
                  <div className="text-right text-sm muted">
                    {s.total > 0 ? (
                      <>
                        <div><strong style={{ color: 'var(--text)' }}>{acc}%</strong> acerto</div>
                        <div>{s.total} itens · {s.days}d</div>
                      </>
                    ) : (
                      <span>nunca treinado</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
