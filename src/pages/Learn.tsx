import { Link } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';

export default function Learn() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <BrandHeader />
        <div className="card mb-4">
          <Link to="/" className="muted text-sm">← voltar</Link>
          <h1 className="title mt-2 mb-2">Como melhorar — o que a ciência diz</h1>
          <p className="muted">
            Resumo honesto baseado em literatura de psicometria e neurociência cognitiva.
            Sem promessas mágicas, sem "QI em 7 dias".
          </p>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-lg mb-2">1. Você consegue aumentar o "QI real" (fator g)?</h2>
          <p className="mb-2">
            <strong>Em adultos: pouco.</strong> O fator g (inteligência geral) tem herdabilidade de 50–70% em
            idade adulta. Treinos de memória de trabalho como <em>dual n-back</em> melhoram a memória em si,
            mas a meta-análise de Melby-Lervåg (2016) e Sala (2017) mostra que a transferência pro g é
            inconsistente.
          </p>
          <p>
            <strong>Em crianças:</strong> ambiente faz diferença enorme. Cada ano extra de educação formal
            adiciona ~1–5 pontos de QI medido (Ritchie & Tucker-Drob, 2018).
          </p>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-lg mb-2">2. Você consegue melhorar seu desempenho em testes?</h2>
          <p className="mb-2">
            <strong>Sim, e bastante.</strong> Esse é o <em>test familiarity effect</em>: ao praticar matrizes,
            séries e analogias, você passa a reconhecer regras clássicas instantaneamente.
          </p>
          <p>
            Isso não é "trapaça" — é exatamente o tipo de raciocínio que vestibulares, concursos públicos e
            processos seletivos avaliam. Quem treinou tem vantagem real nessas situações.
          </p>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-lg mb-2">3. O que SIM melhora a cognição geral</h2>
          <ul className="space-y-2">
            <li>🛌 <strong>Sono regular (7–9h)</strong> — privação aguda derruba 5–10 pts de QI mensurado.</li>
            <li>🏃 <strong>Exercício aeróbico</strong> — aumenta BDNF, melhora volume do hipocampo, ganhos cognitivos documentados.</li>
            <li>📚 <strong>Leitura ampla e variada</strong> — fortalece inteligência cristalizada (vocabulário, conhecimento). Esse componente do QI <em>melhora</em> ao longo da vida.</li>
            <li>🧩 <strong>Resolver problemas difíceis</strong> — xadrez, programação, matemática, lógica. Treina raciocínios transferíveis.</li>
            <li>🎻 <strong>Aprender línguas e instrumentos</strong> — plasticidade cerebral, controle executivo.</li>
            <li>🥗 <strong>Nutrição básica</strong> — ômega-3, ferro, B12. Deficiências derrubam desempenho.</li>
            <li>🚫 <strong>Evitar álcool pesado e drogas</strong> — efeito cumulativo na cognição.</li>
            <li>🧘 <strong>Reduzir estresse crônico</strong> — cortisol prolongado atrapalha memória e atenção.</li>
          </ul>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-lg mb-2">4. O que NÃO funciona (apesar do marketing)</h2>
          <ul className="space-y-2 muted">
            <li>❌ Apps de "brain training" genéricos (Lumosity etc.) — FTC multou em 2016 por propaganda enganosa.</li>
            <li>❌ Suplementos "nootrópicos" milagrosos — sem evidência sólida pra ganhos sustentáveis.</li>
            <li>❌ Música clássica enquanto estuda ("efeito Mozart") — mito refutado.</li>
            <li>❌ Métodos de leitura dinâmica extremos — comprometem compreensão.</li>
          </ul>
        </div>

        <div className="card mb-4">
          <h2 className="font-semibold text-lg mb-2">5. Plano prático sugerido</h2>
          <ol className="space-y-2 list-decimal pl-5">
            <li><strong>Diário:</strong> 7–9h de sono, 30min de movimento, 20min de leitura.</li>
            <li><strong>Semanal:</strong> 3 sessões de 15–20min de treino de raciocínio (use o Modo Treino do MyQI).</li>
            <li><strong>Mensal:</strong> aprender algo novo difícil — uma linguagem de programação, um idioma, um instrumento.</li>
            <li><strong>Anual:</strong> ler 12+ livros de áreas variadas (ciência, ficção, história).</li>
          </ol>
        </div>

        <div className="flex gap-3 justify-center flex-wrap mt-6">
          <Link to="/train" className="btn">Ir pro Modo Treino</Link>
          <Link to="/" className="btn-ghost btn">Voltar</Link>
        </div>

        <p className="muted text-xs mt-6 text-center">
          Referências: Plomin & Deary 2015 · Ritchie & Tucker-Drob 2018 · Melby-Lervåg et al. 2016 ·
          Sala & Gobet 2017 · Hertzog et al. 2008 · Erickson et al. 2011 (BDNF/exercise).
        </p>
      </div>
    </div>
  );
}
