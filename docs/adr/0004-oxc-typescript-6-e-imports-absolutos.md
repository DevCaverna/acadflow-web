# ADR-0004: Oxlint type-aware com proibição de imports relativos e TypeScript 6

- **Status:** Aceita
- **Data:** 2026-11-23
- **Arquivos relacionados:** `.oxlintrc.json`, `.oxfmtrc.json`, `tsconfig.app.json`, `vite.config.ts`

## Contexto

Com o crescimento por features em `src/features/*`, imports relativos longos (`../../../shared/...`) dificultam refatorações e deixam a estrutura frágil. Além disso, o time adotou TypeScript 6 com configurações estritas (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`).

## Decisão

1. Configurar o alias `@/* -> ./src/*` no `tsconfig.app.json`, `vite.config.ts` e `vitest.config.ts`.
2. Ativar no Oxlint (`oxlint --type-aware --deny-warnings`) a regra `no-restricted-imports` proibindo qualquer import relativo `./*` ou `../*`, tornando `@/` obrigatório em todo o código-fonte e testes.
3. Padronizar formatação com Oxfmt (`singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`).

## Alternativas Consideradas

- **Permitir imports relativos dentro da mesma feature:** aumentaria inconsistência entre arquivos da mesma pasta e exigiria exceções manuais na regra de lint.

## Consequências

- **Positivas:** movimentação de arquivos exige menos reescrita de caminhos, linter detecta problemas tipados rapidamente no `pnpm pr` e mantém padrão idêntico ao da API.
- **Negativas:** qualquer novo arquivo ou teste criado com `./` ou `../` falha imediatamente no `pnpm lint`.

