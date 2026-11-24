import type { DisciplineListOptions } from '@/features/disciplines/schemas/discipline.schema';

export const disciplineKeys = {
  all: ['disciplines'] as const,
  list: (options: DisciplineListOptions = {}) => [...disciplineKeys.all, 'list', options] as const,
  detail: (id: string) => [...disciplineKeys.all, 'detail', id] as const,
  students: (id: string) => [...disciplineKeys.all, 'students', id] as const,
};
