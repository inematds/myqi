# MyQI

Teste de QI online, gratuito e open-source. Baseado em matrizes progressivas (estilo Raven/ICAR) com geração procedural — sem itens proprietários.

**Live:** publique grátis em GitHub Pages ou Vercel (build estático).

## Recursos (V1)

- **Identificação por idade** com ajuste automático de interface:
  - Kids (6–12), Teen (13–17), Adulto (18–59), Sênior (60+)
- **16 matrizes 3×3** geradas proceduralmente, balanceadas por dificuldade (fácil/médio/difícil)
- **6 regras** de raciocínio: progressão, constância, distribuição-de-três, rotação, preenchimento, regras combinadas
- **Cronômetro global** (12–18 min conforme perfil) e **tempo por questão**
- **Score QI** (escala 100±15) com **intervalo de confiança 95%** + **percentil** + faixa qualitativa
- **Curva normal** interativa mostrando sua posição
- **Mapa de calor temporal** — onde você gastou mais tempo e onde errou
- **Insights automáticos** sobre relação tempo × acerto
- **Export PDF** do relatório
- **Persistência** local (LocalStorage) + opcional Supabase para sessões anônimas

## Roadmap V2

- Bateria múltipla (verbal, numérico, 3D, memória de trabalho, velocidade de processamento)
- Score composto + perfil radar
- Anti-cheat: tela cheia, detecção de mudança de aba, rate limit
- Recalibração contínua via IRT 2PL com dados anônimos

## Stack

- React + Vite + TypeScript
- TailwindCSS + temas CSS por perfil
- Zustand (estado), Recharts (gráficos), html2canvas + jsPDF (export)
- Supabase opcional (free tier) para arquivo anônimo

## Rodando local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Saída em `dist/`. Pronto pra GH Pages, Vercel, Netlify, Cloudflare Pages.

## Supabase (opcional)

Crie um projeto free, uma tabela `sessions`, e coloque as keys em `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Schema sugerido:

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  age int, gender text, education text, profile text,
  iq int, raw int, total int,
  avg_time_ms int, timeouts int, duration_ms int,
  answers jsonb
);
alter table sessions enable row level security;
create policy "anon insert" on sessions for insert to anon with check (true);
```

## Aviso

Estimativa não-clínica. Não substitui WAIS-IV, WISC-V ou avaliação por profissional habilitado.

## Licença

MIT.
