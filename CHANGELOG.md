# Changelog

Todas as mudanças notáveis do **AcadFlow Web** são documentadas neste arquivo, seguindo o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Adicionado

- Páginas de erro 403, 404, 500 e sem conexão nas consultas principais, com recuperação automática ao voltar a conexão.
- Alunos, atividades e média da turma nos cards de disciplinas do professor.

### Alterado

- Exclusão bloqueada por dependências mostra só a explicação e a ação "Entendi".

## [1.1.0] - 2026-11-25

### Adicionado

- Tela de cadastro de professores e alunos, com escolha do perfil e acesso imediato após criar a conta.

## [1.0.0] - 2026-11-25

### Adicionado

- Documentação completa: arquitetura com fluxos Mermaid ([docs/arquitetura.md](docs/arquitetura.md)), Design System ([docs/design-system.md](docs/design-system.md)), ADRs (`docs/adr/`), manual do usuário ([docs/manual-do-usuario.md](docs/manual-do-usuario.md)) e matriz de rastreabilidade ([docs/rastreabilidade.md](docs/rastreabilidade.md)).
- Governança: `CHANGELOG.md`, `SECURITY.md`, `LICENSE` (MIT), `.github/CODEOWNERS`, `.github/dependabot.yml` e Plano de Gerência de Configuração ([docs/gerencia-de-configuracao.md](docs/gerencia-de-configuracao.md)).

### Alterado

- CI e snapshots usam `main`. Os deploys são independentes, e a criação de release atualiza a versão do pacote e o changelog.

## [0.1.0] - 2026-11-24

### Adicionado

- Scaffold inicial com React 19, Vite 8, TypeScript 6 (`strict`), pnpm 12, Tailwind CSS v4, Oxlint/Oxfmt, Vitest + Testing Library e CI no GitHub Actions (`chore/initial-folder-structure` / `feature/web-bootstrap`).
- Fundação TanStack Query v5, serviços por feature, paginação e seletor de idioma `pt-BR` / `en` com `react-i18next` (`ACA-22`).
- Padronização de status de notas em inglês (`NO_GRADES`, `APPROVED`, `RECOVERY`, `FAILED`) (`ACA-12`).
- Cliente HTTP singleton `ApiService` com Zod 4, autenticação JWT em `sessionStorage`, detecção de sessão expirada (`401`), layout responsivo por papel, CRUD de disciplinas e atividades, grade editável de notas para professor e painel de notas/média para aluno (`ACA-7`).
- Página de perfil (`/profile`) com atualização de dados e senha, e gestão de matrículas na página da disciplina (`ACA-24`).
- Tema escuro (`[data-theme='dark']` com script anti-FOUC), sino de avisos derivado no cliente, envio/remoção de foto de perfil e anexos de atividades (`ACA-28`).
