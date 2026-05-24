import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, profileFromAge, Profile } from '../store/session';
import { generateTest } from '../lib/items';

const PROFILE_LABEL: Record<Profile, string> = {
  kids: 'Modo Kids (6–12)',
  teen: 'Modo Teen (13–17)',
  adult: 'Modo Adulto (18–59)',
  senior: 'Modo Sênior (60+)',
};

export default function Home() {
  const nav = useNavigate();
  const { setUser, setItems, start } = useSession();
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'m' | 'f' | 'o' | ''>('');
  const [education, setEducation] = useState('');
  const [consent, setConsent] = useState(false);

  const profilePreview: Profile | null = typeof age === 'number' && age > 0 ? profileFromAge(age) : null;
  const canStart = typeof age === 'number' && age >= 6 && age <= 110 && consent;

  function begin() {
    if (!canStart) return;
    setUser({ age: age as number, gender, education, consent });
    const seed = Math.floor(Math.random() * 1e9);
    setItems(generateTest(seed, 16));
    start();
    nav('/test');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <h1 className="title mb-2">MyQI</h1>
        <p className="muted mb-6">
          Teste de raciocínio baseado em itens estilo Raven/ICAR. Estimativa de QI rápida (12–18 min) com relatório completo.
          <br />
          <strong>Não substitui</strong> avaliação psicométrica profissional (WAIS-IV, WISC-V).
        </p>

        <div className="grid gap-4">
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
              autoFocus
            />
            {profilePreview && (
              <p className="muted text-sm mt-1">Interface será ajustada: <strong>{PROFILE_LABEL[profilePreview]}</strong></p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Gênero <span className="muted text-sm">(opcional)</span></label>
            <select className="input" value={gender} onChange={(e) => setGender(e.target.value as any)}>
              <option value="">—</option>
              <option value="f">Feminino</option>
              <option value="m">Masculino</option>
              <option value="o">Outro / prefiro não dizer</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Escolaridade <span className="muted text-sm">(opcional)</span></label>
            <select className="input" value={education} onChange={(e) => setEducation(e.target.value)}>
              <option value="">—</option>
              <option value="fund">Fundamental</option>
              <option value="med">Médio</option>
              <option value="sup_inc">Superior incompleto</option>
              <option value="sup">Superior</option>
              <option value="pos">Pós-graduação</option>
            </select>
          </div>

          <label className="flex items-start gap-2 text-sm muted">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>
              Aceito que meus resultados sejam usados de forma <strong>anônima</strong> para calibração dos itens.
              Nenhum dado pessoal identificável é coletado.
            </span>
          </label>

          <div className="text-sm muted">
            <strong>Como funciona:</strong> 16 matrizes 3×3. Tempo total: 12–18 min (ajustado ao perfil).
            Você pode pular questões. Ao final: score QI + percentil + análise de tempo.
          </div>

          <button className="btn" disabled={!canStart} onClick={begin}>
            Começar teste
          </button>
        </div>
      </div>
    </div>
  );
}
