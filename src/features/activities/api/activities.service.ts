import { z } from 'zod';
import {
  type Activity,
  activitySchema,
  type CreateActivityInput,
  type UpdateActivityInput,
} from '@/features/activities/schemas/activity.schema';
import { type ApiService, apiService } from '@/shared/api/api.service';

export class ActivitiesService {
  private readonly api: ApiService;
  private readonly baseUrl = '/activities';

  constructor(api: ApiService) {
    this.api = api;
  }

  list({ disciplineId }: { disciplineId: string }): Promise<Activity[]> {
    return this.api.get({
      url: `/disciplines/${disciplineId}/activities`,
      schema: z.array(activitySchema),
    });
  }

  create({ disciplineId, ...body }: CreateActivityInput): Promise<Activity> {
    return this.api.post({
      url: `/disciplines/${disciplineId}/activities`,
      schema: activitySchema,
      body,
    });
  }

  update({ id, ...body }: UpdateActivityInput): Promise<Activity> {
    return this.api.patch({ url: `${this.baseUrl}/${id}`, schema: activitySchema, body });
  }

  remove({ id }: { id: string }): Promise<void> {
    return this.api.delete({ url: `${this.baseUrl}/${id}` });
  }
}

export const activitiesService = new ActivitiesService(apiService);
