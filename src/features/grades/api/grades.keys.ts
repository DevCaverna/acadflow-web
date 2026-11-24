export const gradeKeys = {
  all: ['grades'] as const,
  discipline: (disciplineId: string) => [...gradeKeys.all, disciplineId] as const,
  list: (disciplineId: string) => [...gradeKeys.discipline(disciplineId), 'list'] as const,
  mine: (disciplineId: string) => [...gradeKeys.discipline(disciplineId), 'mine'] as const,
};
