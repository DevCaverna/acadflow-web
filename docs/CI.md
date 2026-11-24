# AcadFlow Web — CI/CD

Branches temporárias partem de `main` e voltam para `main` por PR com revisão.
O workflow `.github/workflows/ci.yml` valida PRs para `main` e pushes em `main`.

Node 24 e pnpm 12.4.2; pnpm install --frozen-lockfile; pnpm lint (Oxlint); pnpm format:check (Oxfmt); pnpm typecheck (TS6); pnpm test (Vitest + Testing Library); pnpm build (Vite).
Job Web / Build só executa se Web / Validate passar, e publica dist/ como artefato, sem deploy automático.
Testes da Web usam mocks HTTP com TanStack Query/Axios; não acessam banco PostgreSQL.

Proteja `main` com PR obrigatório, pelo menos uma revisão e os checks `Web / Validate` e `Web / Build`.
O acadflow-design não terá CI/CD nem suíte automatizada de testes.
