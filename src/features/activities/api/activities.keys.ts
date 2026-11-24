export const activityKeys = {
  all: ['activities'] as const,
  list: (disciplineId: string) => [...activityKeys.all, 'list', disciplineId] as const,
};
