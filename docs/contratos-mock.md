# Contratos para mocks

**Fonte de referência:** [contratos-api.md](https://github.com/DevCaverna/acadflow-api/blob/main/docs/contratos-api.md). Em caso de divergência, vale o documento da API.

## Tipos

```ts
type Role = 'PROFESSOR' | 'ALUNO';
type GradeStatus = 'NO_GRADES' | 'APPROVED' | 'RECOVERY' | 'FAILED';

type User = { id: string; name: string; email: string; role: Role; avatarUrl: string | null };
type Session = { accessToken: string; user: User };
type Discipline = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string;
  professor: { id: string; name: string };
};
type Activity = {
  id: string;
  disciplineId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
};
type Grade = { activityId: string; studentId: string; value: number };
type GradeSummary = {
  grades: Array<{ activityId: string; value: number; updatedAt: string }>;
  average: number | null;
  status: GradeStatus;
};
type StudentGrades = GradeSummary & { student: { id: string; name: string; email: string } };
type Listing<T> = { page: number; perPage: number; total: number; data: T[] };
type ApiError = { statusCode: number; code: string; message: string };
```

## MVP

| Método | Rota                                | Acesso                                     | Corpo                                    | Resposta                         |
| ------ | ----------------------------------- | ------------------------------------------ | ---------------------------------------- | -------------------------------- |
| `GET`  | `/health`                           | Público                                    | —                                        | Estado da API e do banco         |
| `POST` | `/auth/login`                       | Público                                    | `{ email, password }`                    | `200 Session`                    |
| `GET`  | `/auth/me`                          | Autenticado                                | —                                        | `200 User`                       |
| `GET`  | `/disciplines`                      | Professor: as suas; aluno: as matriculadas | —                                        | `200 Listing<Discipline>`        |
| `POST` | `/disciplines`                      | Professor                                  | `{ code, name, semester, description? }` | `201 Discipline`                 |
| `GET`  | `/disciplines/:id`                  | Professor responsável ou aluno matriculado | —                                        | `200 Discipline`                 |
| `GET`  | `/disciplines/:id/students`         | Professor responsável                      | —                                        | `200 Array<{ id, name, email }>` |
| `GET`  | `/disciplines/:id/activities`       | Professor responsável ou aluno matriculado | —                                        | `200 Activity[]`                 |
| `POST` | `/disciplines/:id/activities`       | Professor responsável                      | `{ title, description?, dueAt? }`        | `201 Activity`                   |
| `GET`  | `/disciplines/:id/grades`           | Professor responsável                      | —                                        | `200 StudentGrades[]`            |
| `GET`  | `/disciplines/:id/grades/me`        | Aluno matriculado                          | —                                        | `200 GradeSummary`               |
| `PUT`  | `/activities/:id/grades/:studentId` | Professor responsável                      | `{ value }`                              | `200 Grade`                      |

O `PUT` lança ou atualiza a nota: repetir a chamada não cria outra.

### Paginação

Aplicada em `GET /disciplines`. Query: `page` (padrão 1), `perPage` (padrão 20, máximo 100), `filter` (JSON), `sortField` e `sortDirection` (`asc` ou `desc`).

`GET /disciplines` filtra por `search` (nome ou código) e `semester`, e ordena por `code`, `name` (padrão) ou `semester`. Campo fora da lista retorna `400 VALIDATION_ERROR`.

IDs são UUID v7. Erros seguem `ApiError`; em `VALIDATION_ERROR`, `message` reúne as mensagens dos campos com `; `.

### Perfil

`GET` e `PATCH /users/me` (`{ name?, email? }`, `200 User`) e `PATCH /users/me/password` (`{ currentPassword, newPassword }`, `204`). Senha atual errada retorna `400 INVALID_CURRENT_PASSWORD`.

### Matrículas

`GET /disciplines/:id/students/candidates?search=` (mínimo 3 letras), `POST` e `DELETE /disciplines/:id/students/:studentId`. Matrícula repetida ou aluno com notas retorna `409`.

### Arquivos

`POST`/`DELETE /users/me/avatar`, `GET`/`POST /activities/:id/attachments`, `GET /attachments/:id/url` e `DELETE /attachments/:id`. Envio em multipart, campo `file`. Sem armazenamento, `503 STORAGE_UNAVAILABLE`.

Os mocks reproduzem esses formatos, sem tratar regras de permissão como segurança real.
