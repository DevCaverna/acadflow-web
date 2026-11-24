# ADR-0003: Tokens em Tailwind CSS v4 e tema escuro com proteção anti-FOUC

- **Status:** Aceita
- **Data:** 2026-11-24
- **Arquivos relacionados:** `src/styles/index.css`, `index.html`, `src/shared/lib/theme.ts`, `src/shared/components/ThemeToggle.tsx`

## Contexto

O design system do AcadFlow (`acadflow-design`) define tokens específicos de marca (_Tinta_, _Âmbar_, _Grafite_, semânticas) e um tema escuro completo (`TemaEscuro.dc.html`), com preferência persistida no navegador e fallback para `prefers-color-scheme`.

## Decisão

1. Definir todos os tokens diretamente no bloco `@theme` de **Tailwind CSS v4** (`src/styles/index.css`) e sobrescrever as variáveis CSS sob o seletor `:root[data-theme='dark']`.
2. Injetar um `<script>` síncrono mínimo no `<head>` de `index.html` para ler `localStorage['acadflow.theme']` (ou `matchMedia('(prefers-color-scheme: dark)')`) e aplicar `data-theme` antes da primeira pintura (prevenindo flash de tema claro — FOUC).
3. Auto-hospedar as fontes variáveis `Inter` e `Space Grotesk` via `@fontsource-variable/*`, evitando dependência de CDN externa em tempo de execução.

## Alternativas Consideradas

- **Classes `dark:` espalhadas nos componentes:** duplicaria estilos em dezenas de componentes ao invés de trocar valores semânticos de CSS variables (`bg-surface`, `text-ink`, `border-line`).

## Consequências

- **Positivas:** troca de tema instantânea com baixo acoplamento nos componentes, carregamento offline-friendly de fontes e zero FOUC ao recarregar a página.
- **Negativas:** todos os novos componentes devem usar estritamente tokens semânticos (`bg-surface`, `text-muted`, `border-field`) em vez de cores Tailwind genéricas como `bg-white` ou `text-gray-600`.
