# Design System e Catálogo de Componentes — AcadFlow Web

Os tokens visuais e componentes base do frontend implementam as especificações definidas em [acadflow-design](https://github.com/DevCaverna/acadflow-design) usando **Tailwind CSS v4** (`src/styles/index.css`) e fontes auto-hospedadas (`@fontsource-variable/inter` e `@fontsource-variable/space-grotesk`).

---

## 1. Tokens Visuais (`src/styles/index.css`)

### Paleta de Cores (Tema Claro e Tema Escuro)

| Token CSS                                  | Claro (`:root`)       | Escuro (`[data-theme='dark']`) | Uso principal                                               |
| ------------------------------------------ | --------------------- | ------------------------------ | ----------------------------------------------------------- |
| `--color-primary`                          | `#2e43c8`             | `#4a5fe0`                      | Botões primários, foco de campos, bordas ativas             |
| `--color-primary-hover`                    | `#2436a8`             | `#3d50cc`                      | Hover de ação primária                                      |
| `--color-primary-active`                   | `#1c2a8c`             | `#3244b8`                      | Estado pressionado                                          |
| `--color-primary-soft`                     | `#eef0fc`             | `#232b55`                      | Fundo de item ativo do menu, banner informativo             |
| `--color-primary-muted`                    | `#dde2fa`             | `#2f3970`                      | Anel de foco de campos, tag de aluno                        |
| `--color-accent`                           | `#f2a93b`             | `#f2a93b`                      | Anel de foco de teclado (`:focus-visible`), destaques âmbar |
| `--color-canvas`                           | `#f5f6fa`             | `#10131c`                      | Fundo geral da aplicação                                    |
| `--color-surface`                          | `#ffffff`             | `#1a1f2e`                      | Cards, sidebar, modais, inputs                              |
| `--color-subtle`                           | `#f0f1f5`             | `#242a3b`                      | Divisores internos e fundos sutis                           |
| `--color-skeleton`                         | `#e9ebf2`             | `#2a3144`                      | Shimmer de carregamento (`Skeleton`)                        |
| `--color-ink`                              | `#151826`             | `#eceef6`                      | Texto principal                                             |
| `--color-muted`                            | `#5a6072`             | `#a3a9bd`                      | Texto secundário e rótulos                                  |
| `--color-line`                             | `#e4e6ee`             | `#2d3447`                      | Bordas de cards, seções e tabelas                           |
| `--color-field`                            | `#c9cdda`             | `#454d66`                      | Borda padrão de campos e botões secundários                 |
| `--color-link` / `--color-link-strong`     | `#2e43c8` / `#2436a8` | `#a9b6ff` / `#c3ccff`          | Links de navegação e texto de item ativo                    |
| `--color-success` / `--color-success-soft` | `#1c7a4a` / `#e6f4ec` | `#5fd39a` / `#163528`          | Situação `APPROVED` e toasts de sucesso                     |
| `--color-warning` / `--color-warning-soft` | `#8a5300` / `#fdf3e1` | `#f5c36b` / `#40300f`          | Situação `RECOVERY`, prazos próximos, células alteradas     |
| `--color-danger` / `--color-danger-soft`   | `#c0322a` / `#fce9e7` | `#ff8f87` / `#43201f`          | Situação `FAILED`, alertas e erros de validação             |

### Tipografia e Raios de Borda

- **Fontes:** `--font-display` (`Space Grotesk Variable`, títulos e marca) e `--font-sans` (`Inter Variable`, interface e corpo).
- **Raios:** `--radius-field: 6px` · `--radius-button: 10px` · `--radius-card: 14px` · `--radius-panel: 16px`.
- **Proteção anti-FOUC (`index.html`):** um script síncrono no `<head>` lê `localStorage['acadflow.theme']` (ou `prefers-color-scheme: dark`) e define `data-theme` antes da renderização inicial do React.

---

## 2. Catálogo de Componentes Base (`src/shared/components/`)

| Componente         | Props principais                                                                                | Responsabilidade e comportamento                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Alert`            | `children`, `variant?: 'error' \| 'warning' \| 'info'`                                          | Banner acessível (`role="alert"` ou `role="note"`) com ícone contextual.                                                                       |
| `Avatar`           | `name`, `src?`, `className?`                                                                    | Exibe foto (`object-cover`) com fallback automático para iniciais em caso de ausência ou erro de carregamento.                                 |
| `Breadcrumb`       | `links`, `current`                                                                              | Trilha `<nav aria-label="Navegação">` com `aria-current="page"` no item atual.                                                                 |
| `Button`           | `variant?: 'primary' \| 'secondary' \| 'danger'`, `icon?`, `loading?`                           | Botão padrão com altura mínima acessível (`>= 44px`), estado `loading` (`aria-busy`) que bloqueia duplo clique.                                |
| `ConfirmDialog`    | `title`, `message`, `error`, `loading`, `onConfirm`, `onClose`                                  | Confirmação destrutiva (`alertdialog`); em `409`, mostra o motivo do bloqueio e a ação Entendi.                                                |
| `EmptyState`       | `icon`, `title`, `text?`, `action?`                                                             | Card tracejado para listas vazias com ícone, mensagem e CTA opcional.                                                                          |
| `Field`            | `label`, `error?`, `optional?`, `multiline?`, `action?`                                         | Input ou `<textarea>` com `useId()`, `aria-invalid`, `aria-describedby`, botão interno opcional (ex.: exibir senha) e erro com `role="alert"`. |
| `Icon`             | `name: IconName`, `className?`                                                                  | Conjunto SVG inline de ícones de interface (`stroke-width` uniforme).                                                                          |
| `IconButton`       | `icon`, `label`, `className?`                                                                   | Botão quadrado acessível (`aria-label` obrigatório) para ações compactas (sair, tema, fechar).                                                 |
| `LanguageSelector` | `className?`                                                                                    | Seletor `pt-BR` / `en` conectado ao `i18next` e persistido em `localStorage['acadflow.language']`.                                             |
| `Modal`            | `title`, `subtitle?`, `role?: 'dialog' \| 'alertdialog'`, `describedBy?`, `children`, `onClose` | `<dialog>` nativo (`showModal()`), com foco preso e fechamento por `Esc`.                                                                      |
| `ModalFooter`      | `submitLabel`, `loading`, `onClose`                                                             | Rodapé padrão para formulários dentro de `Modal` (Cancelar + Submit com `loading`).                                                            |
| `Pagination`       | `page`, `perPage`, `total`, `onPageChange`                                                      | Navegação paginada; oculta automaticamente quando há apenas 1 página.                                                                          |
| `QueryState`       | `query`, `errorView?: 'alert' \| 'page' \| 'fullScreen'`, `skeleton?`, `children`               | `Skeleton` no carregamento; aviso ou página de erro na falha ou sem conexão.                                                                   |
| `Skeleton`         | `variant?: 'card' \| 'cards' \| 'list' \| 'table'`                                              | Carregamento com brilho, visível após 300 ms, com `role="status"`.                                                                             |
| `ThemeToggle`      | —                                                                                               | Alterna `light` ↔ `dark` via `themeStore` com `useSyncExternalStore`.                                                                          |
| `Toaster`          | —                                                                                               | Toasts de sucesso, informação (`role="status"`) e erro (`role="alert"`), com descarte em 5 s.                                                  |
| `ErrorPage`        | `kind`, `detail?`, `actions`, `fullScreen?`                                                     | Página de erro ilustrada: 403, 404, 500, sem conexão e erro inesperado.                                                                        |
| `ErrorPageLink`    | `to`, `variant?`                                                                                | Link com aparência de botão nas páginas de erro.                                                                                               |
| `QueryErrorPage`   | `kind`, `message`, `fullScreen`, `onRetry`                                                      | Página de erro de uma consulta, com as ações de cada falha.                                                                                    |
| `TopProgress`      | —                                                                                               | Barra no topo durante a troca de página.                                                                                                       |

---

## 3. Acessibilidade e Internacionalização

- **Foco visível:** `:focus-visible` aplica contorno `2px solid var(--color-accent)` (`#f2a93b`) em ambos os temas.
- **Redução de movimento:** `@media (prefers-reduced-motion: reduce)` desativa animações.
- **Badges de situação acadêmica (`GradeStatusBadge`):** combinam sempre **cor + ícone + texto** (`APPROVED`, `RECOVERY`, `FAILED`, `NO_GRADES`), nunca dependendo apenas de cor.
- **Internacionalização (`src/i18n/`):** 11 namespaces (`common`, `home`, `landing`, `auth`, `disciplines`, `enrollments`, `activities`, `grades`, `notifications`, `profile`, `errors`) em `pt-BR` (padrão/fallback) e `en`. Nenhum texto visível é hardcoded nos componentes.
