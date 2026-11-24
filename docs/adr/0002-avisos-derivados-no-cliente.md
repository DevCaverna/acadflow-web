# ADR-0002: Sino de avisos derivado no cliente sem tabela/endpoint próprio

- **Status:** Aceita
- **Data:** 2026-11-24
- **Arquivos relacionados:** `src/features/notifications/lib/notices.ts`, `src/features/notifications/hooks/useNotices.ts`, `src/features/notifications/components/NotificationBell.tsx`

## Contexto

O design do AcadFlow prevê um sino de avisos na barra lateral exibindo prazos próximos (até 7 dias) e notas recentes do aluno, sem exigir histórico persistido, marcação de lido/não lido nem envio de e-mail ou push.

## Decisão

Implementar os avisos inteiramente no cliente (`useNotices` + `buildNotices`), consultando disciplinas, atividades e (para `ALUNO`) resumos de notas somente quando o usuário interage com o sino ou a partir dos dados já em cache do TanStack Query, filtrando itens dentro da janela de **7 dias**.

## Alternativas Consideradas

- **Criar tabela `notifications` e endpoints REST dedicados na API:** adicionaria migrations, jobs/triggers e gestão de estado lido/não lido fora do escopo do produto.

## Consequências

- **Positivas:** zero custo adicional de schema/backend, dados sempre coerentes com prazos e notas atuais, implementação isolada em `src/features/notifications/`.
- **Negativas:** o indicador de notas recentes depende de `updatedAt` nos itens de `GradeSummary` (introduzido em `ACA-25` na API; sem esse campo, apenas os prazos futuros são exibidos).

