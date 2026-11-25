# Rotas da aplicação

Caminhos definidos em `src/shared/config/routes.ts` e montados em `src/app/router/routes.tsx`. Componentes não escrevem caminhos à mão: usam `ROUTES`, `getAreaRoutes(role)` ou `useAreaRoutes()`.

## Estrutura

```text
RouteErrorBoundary
├── /                              Landing; com sessão, vai para /home
├── /login, /register              público
├── RequireAuth                    exige sessão; sem ela, vai para /login
│   ├── /home                      redireciona para a área do papel
│   ├── RequireRole PROFESSOR      /professor/*
│   ├── RequireRole ALUNO          /student/*
│   ├── /profile                   os dois papéis
│   └── endereços antigos          redirecionam para a área do papel
└── *                              404
```

As áreas são separadas por papel. Abrir a área de outro papel mostra o erro 403, sem encerrar a sessão. A API continua responsável pela autorização real.

## Mapa

| Rota                                   | Acesso    | Página                                              | Telas do design                                                        |
| -------------------------------------- | --------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| `/`                                    | Público   | `LandingPage`; com sessão, redireciona para `/home` | `Landing`                                                              |
| `/home`                                | Sessão    | Redireciona para `/professor` ou `/student`         | —                                                                      |
| `/login`                               | Público   | `LoginPage`                                         | `Login`, `LoginCarregando`, `LoginErro`, `SessaoExpirada`              |
| `/register`                            | Público   | `RegisterPage`                                      | `Cadastro`                                                             |
| `/professor`                           | Professor | `HomePage` (`ProfessorHome`)                        | `ProfHome`                                                             |
| `/professor/disciplines`               | Professor | `DisciplinesPage`                                   | `ProfDisciplinas`                                                      |
| `/professor/disciplines/:disciplineId` | Professor | `DisciplinePage`                                    | `ProfAtividades`, `ProfNovaAtividade`, `ProfAlunos`, `AtividadeAnexos` |
| `/professor/grades`                    | Professor | `GradesPage` (`GradeEntry`)                         | `ProfNotas`                                                            |
| `/student`                             | Aluno     | `HomePage` (`StudentHome`)                          | `AlunoHome`                                                            |
| `/student/disciplines`                 | Aluno     | `DisciplinesPage`                                   | Sem tela própria                                                       |
| `/student/disciplines/:disciplineId`   | Aluno     | `DisciplinePage`                                    | `AtividadeAnexos`                                                      |
| `/student/grades`                      | Aluno     | `GradesPage` (`MyGrades`)                           | `AlunoNotas`                                                           |
| `/profile`                             | Sessão    | `ProfilePage`                                       | `Perfil`, `PerfilFoto`                                                 |
| `*`                                    | Público   | `NotFoundPage`                                      | `Erro404`                                                              |

As rotas de notas aceitam `?discipline=<id>` para abrir uma disciplina.

`/professor/disciplines?new=1` abre o formulário de nova disciplina.

### Endereços antigos

`/disciplines`, `/disciplines/:disciplineId` e `/grades` redirecionam para a área do papel e mantêm os parâmetros.

## Telas sem rota própria

| Tela                                     | Onde aparece                                       |
| ---------------------------------------- | -------------------------------------------------- |
| `Sidebar`, `Avisos`                      | `AppLayout` e `NotificationPanel`                  |
| `ProfPainelAvisos`, `AlunoPainelAvisos`  | Só o painel de avisos; o fundo (painel) não existe |
| `TemaEscuro`                             | `ThemeToggle`                                      |
| `Erro403`                                | `RequireRole` e `QueryErrorPage`                   |
| `Erro500`, `SemConexao`                  | `QueryErrorPage` e `RouteErrorBoundary`            |
| `Feedback`, `Componentes`, `Fundamentos` | `src/shared/components` e `src/styles/index.css`   |
| `Icone`, `LogoMark`                      | `public/icons`                                     |

## Telas do design sem uso

| Tela                                                    | Rota sugerida         |
| ------------------------------------------------------- | --------------------- |
| `ProfPainel`, `ProfPainelSkeleton`, `ProfPainelVazio`   | `/professor/overview` |
| `AlunoPainel`, `AlunoPainelSkeleton`, `AlunoPainelErro` | `/student/overview`   |

São 6 das 43 telas. `Main`, `EscopoMVP`, `FluxoAuth`, `FluxoProfessor`, `FluxoAluno` e `ModeloDados` são documentação e não viram página.

## Como adicionar uma rota

1. Declare o caminho em `src/shared/config/routes.ts`.
2. Registre a página com `lazy` em `routes.tsx`, dentro do guard correto.
3. Se for do menu, inclua em `AppLayout`.
4. Teste o acesso em `src/app/router/app.test.tsx` e atualize este documento.

## Adaptações das homes

- `Landing`: sem os textos sobre conta criada pela coordenação, porque o cadastro aceita professor e aluno, e sem o contato da equipe, ainda não definido no design.
- `ProfHome`: as notas pendentes são as de atividades com prazo encerrado.
- Os links "Ver visão geral" dependem dos painéis e não foram incluídos.
- As homes consultam até 100 disciplinas e fazem duas requisições por disciplina; a API não tem um endpoint de resumo.
