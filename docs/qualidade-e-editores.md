# Qualidade, TypeScript 6 e editores — AcadFlow Web

Configuração de referência: https://github.com/aqu1no1/currency-converter-web.

## Oxc
- `pnpm lint` / `pnpm lint:fix`: Oxlint; lint type-aware.
- `pnpm format` / `pnpm format:check`: Oxfmt.
- `pnpm typecheck`: verifica configurações app, Node e testes.
- `pnpm test`: Vitest (necessário instalar e configurar no bootstrap).
- `pnpm pr`: verificações automatizadas da PR.

As dependências no package.json são **somente o ferramental inicial**. O bootstrap de React/Vite/TanStack Query/Vitest precisa adicionar dependências do app, plugins, gerar e commitar `pnpm-lock.yaml` e validar os scripts no Node/pnpm compatíveis.

## TypeScript 6

`tsconfig.app.json` tem `target: ES2023`, `module: ESNext`, `moduleResolution: Bundler`, `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly` e mapeamento `@/*` para `./src/*` sem `baseUrl` depreciado. `tsconfig.node.json` usa `NodeNext` no contexto Node ESM do Vite. O alias também está em `vite.config.ts`; typecheck isolado de teste usa `tsconfig.test.json`.

## Editores

`.vscode/` e `.zed/` contêm os ajustes compartilhados Oxlint/Oxfmt e tasks do Zed. Os imports internos usam `@/` (em vez de `../`); bibliotecas externas e imports apenas de tipos continuam com o padrão TypeScript.

## PR e idioma

O checklist de PR exige mensagens/traduções somente em `pt-BR`. Os arquivos `en`/`es` já existentes no projeto não foram apagados, pois a alteração solicitada refere-se ao template de revisão.
