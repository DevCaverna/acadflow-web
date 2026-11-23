# AcadFlow Web — CI/CD

Branches: feature/* → develop → staging → main; PR com revisão e verificações obrigatórias.
Workflow .github/workflows/ci.yml valida pushes/PRs para develop, staging e main.

Node 24 e pnpm 12.4.2; pnpm install --frozen-lockfile; pnpm lint (Oxlint); pnpm format:check (Oxfmt); pnpm typecheck (TS6); pnpm test (Vitest + Testing Library); pnpm build (Vite).
Job Web / Build só executa se Web / Validate passar, e publica dist/ como artefato, sem deploy automático.
Testes da Web usam mocks HTTP com TanStack Query/Axios; não acessam banco PostgreSQL.

Regras de branch: ao menos um reviewer e checks Web / Validate e Web / Build.
O acadflow-design não terá CI/CD nem suíte automatizada de testes.

Aviso: scaffolding em PR Draft; ainda é necessário instalar dependências React/Vite/Vitest e gerar pnpm-lock.yaml. Pipeline ainda não validada.
