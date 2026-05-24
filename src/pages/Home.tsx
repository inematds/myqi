import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, profileFromAge, Profile } from '../store/session';
import { buildBattery, Version } from '../lib/battery';

const PROFILE_LABEL: Record<Profile, string> = {
  kids: 'Modo Kids (6–12)',
  teen: 'Modo Teen (13–17)',
  adult: 'Modo Adulto (18–59)',
  senior: 'Modo Sênior (60+)',
};

export default function Home() {
  const nav = useNavigate();
  const { setUser, setItems, setVersion, start } = useSession();
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'m' | 'f' | 'o' | ''>('');
  const [education, setEducation] = useState('');
  const [consent, setConsent] = useState(false);
  const [version, setVersionLocal] = useState<Version>('v1');

  const profilePreview: Profile | null = typeof age === 'number' && age > 0 ? profileFromAge(age) : null;
  const canStart = typeof age === 'number' && age >= 6 && age <= 110 && consent;

  function begin() {
    if (!canStart) return;
    setUser({ age: age as number, gender, education, consent });
    setVersion(version);
    const seed = Math.floor(Math.random() * 1e9);
    setItems(buildBattery(version, seed));
    start();
    nav('/test');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <h1 className="title mb-2">MyQI</h1>
        <p className="muted mb-6">
          Teste de raciocínio estilo Raven/ICAR. Estimativa de QI com relatório completo.
          <br />
          <strong>Não substitui</strong> avaliação psicométrica profissional (WAIS-IV, WISC-V).
        </p>

        <div className="grid gap-4">
          <div>
            <label className="block mb-2 font-semibold">Versão do teste</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setVersionLocal('v1')}
                className={`option-cell ${version === 'v1' ? 'selected' : ''}`}
                style={{ aspectRatio: 'auto', padding: '1rem', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <strong>V1 · Matrizes (rápido)</strong>
                <span className="muted text-sm">16 matrizes 3×3 · ~12 min · raciocínio fluido</span>
              </button>
              <button
                onClick={() => setVersionLocal('v2')}
                className={`option-cell ${version === 'v2' ? 'selected' : ''}`}
                style={{ aspectRatio: 'auto', padding: '1rem', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <strong>V2 · Bateria completa</strong>
                <span className="muted text-sm">35 itens · ~25 min · matrizes + verbal + numérico + 3D + memória</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Idade</label>
            <input
              type="number"
              min={6}
              max={110}
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              className="input"
              placeholder="ex: 28"
            />
            {profilePreview && (
              <p className="muted text-sm mt-1">Interface: <strong>{PROFILE_LABEL[profilePreview]}</strong></p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold text-sm">Gênero <span className="muted">(opc.)</span></label>
              <select className="input" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                <option value="">—</option>
                <option value="f">Feminino</option>
                <option value="m">Masculino</option>
                <option value="o">Outro</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">Escolaridade <span className="muted">(opc.)</span></label>
              <select className="input" value={education} onChange={(e) => setEducation(e.target.value)}>
                <option value="">—</option>
                <option value="fund">Fundamental</option>
                <option value="med">Médio</option>
                <option value="sup_inc">Superior incompleto</option>
                <option value="sup">Superior</option>
                <option value="pos">Pós-graduação</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm muted">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>Aceito que meus resultados sejam usados de forma <strong>anônima</strong> para calibração dos itens.</span>
          </label>

          {version === 'v2' && (
            <div className="text-xs muted" style={{ background: 'rgba(124,91,250,0.08)', padding: 10, borderRadius: 10 }}>
              <strong>V2 anti-cheat:</strong> mudanças de aba e perdas de foco são contadas e exibidas no relatório.
              Recomenda-se fazer em ambiente calmo, sem interrupções.
            </div>
          )}

          <button className="btn" disabled={!canStart} onClick={begin}>
            Começar teste {version === 'v2' ? '(V2)' : '(V1)'}
          </button>
        </div>
      </div>
    </div>
  );
}
