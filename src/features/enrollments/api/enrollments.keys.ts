export const enrollmentKeys = {
  all: ['enrollments'] as const,
  candidates: (disciplineId: string, search: string) =>
    [...enrollmentKeys.all, 'candidates', disciplineId, search] as const,
};
