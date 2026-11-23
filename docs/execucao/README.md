# Como executar o AcadFlow Web

## Pré-requisitos

- Node.js **24**, pnpm **12.4.2**, ou Docker Engine + Compose v2.
- A API pode estar em `http://localhost:3000` para testar fluxos reais; telas podem ser desenvolvidas com mocks seguindo `docs/contratos-mock.md`.
- `.env` derivado de `.env.example`, **sem segredos**.

## Rodar a Web localmente

```bash
cp .env.example .env
# Exemplo: VITE_API_BASE_URL=http://localhost:3000
pnpm install
pnpm dev
```

Acesse `http://localhost:5173`. Como a requisição parte do **navegador**, a URL da API deve ser acessível pelo navegador (`localhost:3000` em ambiente local), não por nome interno de serviço Docker. A API precisa permitir a origem `http://localhost:5173` no CORS.

## Rodar no Docker (desenvolvimento)

```bash
cp .env.example .env
docker compose --env-file .env -f docker/compose.dev.yml up --build
```

O Dockerfile de desenvolvimento deve executar Vite com `--host 0.0.0.0`, expor `5173`, montar o código para hot reload e manter `node_modules` em volume separado. O Compose da Web é independente do Compose da API.

```bash
docker compose --env-file .env -f docker/compose.dev.yml down
```

## Build de produção

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

O `docker/Dockerfile` de produção deve gerar `dist/` com Vite e servir a SPA em Nginx com fallback de rota (`try_files ... /index.html`). **`VITE_*` é público no JavaScript servido:** não incluir tokens ou secrets no frontend.

## Testes

- Vitest + Testing Library; mocks de API/TanStack Query.
- Não é necessário PostgreSQL para os testes de componentes da Web.
- Regra de exibição da média: >= 7 aprovado; 5 a < 7 recuperação; < 5 reprovado; sem notas como estado separado.

## Problemas comuns

- **Vite inacessível pelo Docker:** checar `--host 0.0.0.0` e porta `5173:5173`.
- **Falha de CORS:** API precisa aceitar a origem Web.
- **Erro 404 após atualizar página interna no Nginx:** configurar fallback SPA.
- **Tradução ausente:** `pt-BR` é fallback; manter também `en` no produto.
- **Build falha:** verificar dependências/lockfile, TypeScript `@/` e `vite.config.ts`.

## Ambientes Git

Branch feature → `develop` → `staging` → `main`, por PR com review e CI verde. O build `dist/` não implica deploy automático.
