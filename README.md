# Fluxo Financeiro - Demo

Pequeno app React (Vite) com componente de projeção financeira.

Instalação e execução:

```bash
npm install
npm run dev
```

Proteção por senha (sem hardcode):

```bash
cp .env.example .env
```

Defina `VITE_PAGE_PASSWORD` no arquivo `.env` (local) e no segredo do ambiente de deploy (GitHub Pages / Actions).

Dependências principais usadas:

- `react`, `react-dom`
- `recharts` para gráficos
- `lucide-react` para ícones
- `vite` como bundler

Observações:

- O código original usava classes do Tailwind; aqui mantive o layout com estilos simples no `src/index.css`. Se quiser integrar Tailwind, posso adicionar a configuração.

# ap
