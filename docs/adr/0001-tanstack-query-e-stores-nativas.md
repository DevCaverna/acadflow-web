# ADR-0001: TanStack Query e `useSyncExternalStore` em vez de Redux

- **Status:** Aceita
- **Data:** 2026-11-24
- **Arquivos relacionados:** `src/app/providers/AppProviders.tsx`, `src/shared/api/access-token.ts`, `src/shared/lib/theme.ts`, `src/shared/lib/toast.ts`

## Contexto

A maior parte do estado da aplicação web consiste em cache de recursos REST (disciplinas, atividades, matrículas, notas, usuário atual) com invalidação após mutações. Além disso, há apenas três estados globais puramente de cliente: token de sessão, tema visual e fila de toasts.

## Decisão

1. Adotar **TanStack Query v5** para todo estado remoto, com fábricas de `queryKeys` por domínio e invalidação explícita nas mutações.
2. Utilizar stores mínimas baseadas na API nativa do React **`useSyncExternalStore`** para `accessToken`, `themeStore` e `toastStore`, mantendo `src/app/store/` sem Redux Toolkit ou Zustand.
3. Validar todos os payloads da API na fronteira de `ApiService` com **Zod 4**.

## Alternativas Consideradas

- **Redux Toolkit / Zustand:** introduziria boilerplate e dependências adicionais para apenas três pequenos estados globais de UI.

## Consequências

- **Positivas:** bundle mais enxuto, separação nítida entre server state e UI state, invalidação declarativa e testes mais simples com `QueryClient` isolado por teste.
- **Negativas:** se no futuro surgirem fluxos complexos de estado client-side compartilhado (como rascunhos multi-etapa persistentes), uma store dedicada poderá ser reavaliada.
