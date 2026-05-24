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

## V2 (já implementado) — escolha na Home

Versão de bateria completa com 5 subtestes:

| Subteste | Itens | O que mede |
|---|---|---|
| Raciocínio Fluido (matrizes 3×3) | 8 | inteligência fluida |
| Raciocínio Verbal (analogias PT-BR) | 8 | inteligência cristalizada |
| Raciocínio Numérico (séries) | 8 | raciocínio quantitativo |
| Rotação Mental (2D rotação vs espelho) | 6 | habilidade espacial |
| Memória de Trabalho (digit span reverso) | 5 | memória operacional |

V2 adiciona:
- **Score composto** (média dos z-scores por subteste) + IC95% mais apertado
- **Perfil cognitivo** em gráfico radar
- **Anti-cheat passivo:** contagem de perdas de foco / troca de aba, exibido no relatório

## V3 (já implementado) — Modo Treino + página educacional

- **Modo Treino:** itens ilimitados por subteste, sem cronômetro, sem score de QI.
  Após cada resposta exibe a regra correta + explicação. Tracking local de acertos por dia.
- **Página "Como melhorar"** (`/melhorar`): conteúdo educacional honesto sobre o que
  realmente aumenta cognição (sono, exercício, leitura, problemas difíceis) e o que
  é marketing (Lumosity, nootrópicos, Mozart effect).
- **Recomendação automática** no resultado: aponta o subteste mais fraco e oferece
  treino direcionado.
- **Aviso ético:** o app deixa claro que treinar melhora *desempenho em testes*
  (test familiarity effect) e raciocínios específicos, mas não aumenta diretamente
  o fator g.

## Roadmap futuro

- Anti-cheat ativo: fullscreen obrigatório, bloqueio de copy-paste, rate limit por device
- Recalibração contínua via IRT 2PL com dados anônimos
- Subtestes adicionais: velocidade de processamento (symbol search), conhecimento geral

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
