# Matriz de Rastreabilidade — Design × Web × API

Este documento mapeia as telas e fluxos especificados em [acadflow-design](https://github.com/DevCaverna/acadflow-design) com sua implementação no **AcadFlow Web** e os endpoints correspondentes na **AcadFlow API**.

> O mapa referencia `main` nos dois repositórios. Os identificadores `ACA-*` indicam a origem do trabalho, não uma dependência em branch separada.

---

## 1. Mapa Tela × Rota Web × Endpoint API

| Tela no `acadflow-design`                         | Rota / Componente no `acadflow-web`                                                  | Endpoints no `acadflow-api`                                                                                                                  | Estado atual                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `Login`, `LoginCarregando`, `LoginErro`           | `/login` (`LoginPage`)                                                               | `POST /auth/login`                                                                                                                           | Implementado                                   |
| `SessaoExpirada`                                  | `/login` (`SessionExpiredDialog`)                                                    | Interceptor `401` + `GET /auth/me`                                                                                                           | Implementado                                   |
| `Sidebar`                                         | `AppLayout`                                                                          | `GET /auth/me`                                                                                                                               | Implementado                                   |
| `ProfDisciplinas`                                 | `/disciplines` (`DisciplinesPage`, `DisciplineFormModal`)                            | `GET /disciplines`, `POST /disciplines`                                                                                                      | Implementado                                   |
| `ProfAtividades`, `ProfNovaAtividade`             | `/disciplines/:disciplineId` (`DisciplinePage`, `ActivityList`, `ActivityFormModal`) | `GET/PATCH/DELETE /disciplines/:id`, `GET/POST /disciplines/:id/activities`, `PATCH/DELETE /activities/:id`, `GET /disciplines/:id/students` | Implementado                                   |
| `ProfAlunos` _(v1.3)_                             | `/disciplines/:disciplineId` (`StudentList`, `EnrollModal`)                          | `GET .../students/candidates`, `POST/DELETE .../students/:studentId` `(ACA-24)`                                                              | Implementado na Web (`ACA-24` na API)          |
| `AtividadeAnexos` _(v1.3)_                        | `/disciplines/:disciplineId` (`AttachmentsModal`)                                    | `GET/POST /activities/:id/attachments`, `GET /attachments/:id/url`, `DELETE /attachments/:id` `(ACA-25)`                                     | Implementado na Web (`ACA-25` na API)          |
| `ProfNotas`                                       | `/grades` (`GradesPage`, `GradeEntry`)                                               | `GET /disciplines/:id/grades`, `PUT /activities/:id/grades/:studentId`                                                                       | Implementado                                   |
| `AlunoNotas`                                      | `/grades` (`GradesPage`, `MyGrades`)                                                 | `GET /disciplines/:id/grades/me`                                                                                                             | Implementado                                   |
| `Avisos`, `ProfPainelAvisos`, `AlunoPainelAvisos` | `NotificationBell`, `NotificationPanel` (`useNotices`)                               | Reutiliza `GET /disciplines`, `GET .../activities`, `GET .../grades/me` (`updatedAt` em `ACA-25`)                                            | Implementado no cliente                        |
| `Perfil`, `PerfilFoto` _(v1.3)_                   | `/profile` (`ProfilePage`, `AvatarForm`, `ProfileForm`, `PasswordForm`)              | `PATCH /users/me`, `PATCH /users/me/password` `(ACA-24)`, `POST/DELETE /users/me/avatar` `(ACA-25)`                                          | Implementado na Web (`ACA-24`/`ACA-25` na API) |
| `TemaEscuro` _(v1.3)_                             | `ThemeToggle`, `src/styles/index.css` (`[data-theme='dark']`)                        | — (preferência em `localStorage`)                                                                                                            | Implementado                                   |
| `Erro404`                                         | `*` (`NotFoundPage`)                                                                 | —                                                                                                                                            | Implementado                                   |
| `Erro403`, `Erro500`, `SemConexao`, `Feedback`    | `QueryState`, `Alert`, `Toaster`, `ConfirmDialog`                                    | Contrato `{ statusCode, code, message }`                                                                                                     | Implementado de forma contextual nas telas     |

---

## 2. Adaptações Intencionais e Lacunas Conhecidas

1. **Rota raiz `/` redireciona para `/disciplines`:** o `acadflow-design` v1.2 adicionou telas separadas de `Landing`, `ProfHome`/`AlunoHome` e `ProfPainel`/`AlunoPainel`, mas a aplicação web direciona usuários autenticados diretamente para `/disciplines` (fluxo focado nas tarefas principais de disciplinas, atividades e notas).
2. **Cadastro público (`Cadastro` / `POST /auth/register`):** permanece fora do escopo atual tanto na Web quanto na API; contas são provisionadas por seed ou CLI `user:create`.
3. **Exclusão de atividade com notas (`Feedback.dc.html` vs regra vigente):** o contrato vigente (design v1.3, Web e API) **bloqueia** com `409 CONFLICT` a exclusão de atividades que tenham notas ou anexos; o diálogo de confirmação em cascata presente em `Feedback.dc.html` é um resquício da v1.1 documentado para revisão no repositório de design.
4. **`DELETE /activities/:id/grades/:studentId`:** consta como rota opcional nos contratos da API, mas não foi implementado na API nem exposto na grade da Web (a Web impede apagar uma nota já salva).
