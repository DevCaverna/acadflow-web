import { z } from 'zod';
import {
  type Activity,
  activitySchema,
  type CreateActivityInput,
} from '@/features/activities/schemas/activity.schema';
import { apiClient } from '@/shared/api/client';

export const activitiesService = {
  async list(disciplineId: string): Promise<Activity[]> {
    const { data } = await apiClient.get<unknown>(`/disciplines/${disciplineId}/activities`);
    return z.array(activitySchema).parse(data);
  },

  async create(disciplineId: string, input: CreateActivityInput): Promise<Activity> {
    const { data } = await apiClient.post<unknown>(
      `/disciplines/${disciplineId}/activities`,
      input,
    );
    return activitySchema.parse(data);
  },
};
