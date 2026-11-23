# Contratos de API e dados para mocks

**Fonte de verdade da API:** https://github.com/DevCaverna/acadflow-api/blob/main/docs/contratos-api.md (a ser integrado pela PR de scaffolding).

```ts
type Role = 'PROFESSOR' | 'ALUNO';
type GradeStatus = 'SEM_NOTAS' | 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';
type Session = { accessToken: string; user: { id: string; name: string; email: string; role: Role } };
type GradeSummary = { grades: Array<{ activityId: string; value: number }>; average: number | null; status: GradeStatus };
```

Rotas: `POST /auth/login`, `GET /auth/me`, `GET /disciplines`, `GET /disciplines/:id/activities`, `GET /disciplines/:id/grades/me`. Mocks por feature devem reproduzir esses formatos, sem simular regras de permissão como se fossem segurança real.
