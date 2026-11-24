export const activityKeys = {
  all: ['activities'] as const,
  attachments: (activityId: string) => [...activityKeys.all, 'attachments', activityId] as const,
  list: (disciplineId: string) => [...activityKeys.all, 'list', disciplineId] as const,
};
