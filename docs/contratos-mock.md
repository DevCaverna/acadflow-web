# Contratos para mocks

**Fonte de referência:** [contratos-api.md](https://github.com/DevCaverna/acadflow-api/blob/develop/docs/contratos-api.md). Em caso de divergência, vale o documento da API.

## Tipos

```ts
type Role = 'PROFESSOR' | 'ALUNO';
type GradeStatus = 'SEM_NOTAS' | 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';

type User = { id: string; name: string; email: string; role: Role };
type Session = { accessToken: string; user: User };
type Discipline = {
  id: string; code: string; name: string; description: string | null;
  semester: string; professor: { id: string; name: string };
};
type Activity = {
  id: string; disciplineId: string; title: string;
  description: string | null; dueAt: string | null;
};
type Grade = { activityId: string; studentId: string; value: number };
type GradeSummary = {
  grades: Array<{ activityId: string; value: number }>;
  average: number | null; status: GradeStatus;
};
type StudentGrades = GradeSummary & { student: { id: string; name: string; email: string } };
type ApiError = { statusCode: number; code: string; message: string };
```

## MVP

| Método | Rota | Acesso | Corpo | Resposta |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Público | — | Estado da API e do banco |
| `POST` | `/auth/login` | Público | `{ email, password }` | `200 Session` |
| `GET` | `/auth/me` | Autenticado | — | `200 User` |
| `GET` | `/disciplines` | Professor: as suas; aluno: as matriculadas | — | `200 Discipline[]` |
| `POST` | `/disciplines` | Professor | `{ code, name, semester, description? }` | `201 Discipline` |
| `GET` | `/disciplines/:id` | Professor responsável ou aluno matriculado | — | `200 Discipline` |
| `GET` | `/disciplines/:id/students` | Professor responsável | — | `200 Array<{ id, name, email }>` |
| `GET` | `/disciplines/:id/activities` | Professor responsável ou aluno matriculado | — | `200 Activity[]` |
| `POST` | `/disciplines/:id/activities` | Professor responsável | `{ title, description?, dueAt? }` | `201 Activity` |
| `GET` | `/disciplines/:id/grades` | Professor responsável | — | `200 StudentGrades[]` |
| `GET` | `/disciplines/:id/grades/me` | Aluno matriculado | — | `200 GradeSummary` |
| `PUT` | `/activities/:id/grades/:studentId` | Professor responsável | `{ value }` | `200 Grade` |

O `PUT` lança ou atualiza a nota: repetir a chamada não cria outra.

Os mocks reproduzem esses formatos, sem tratar regras de permissão como segurança real.
