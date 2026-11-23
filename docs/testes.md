# AcadFlow Web — testes

Vitest e Testing Library para componentes, hooks, telas de login, dashboard, notas e estados loading/erro/vazio.
Chamadas HTTP da API devem ser mockadas; a Web não usa Docker/PostgreSQL para os testes de componentes.
Os testes de banco, integração e E2E HTTP ficam no repositório acadflow-api.
Comandos propostos: pnpm test, pnpm test:watch, pnpm test:cov.
O bootstrap ainda precisa instalar React, Vite, Vitest, Testing Library e gerar pnpm-lock.yaml.
