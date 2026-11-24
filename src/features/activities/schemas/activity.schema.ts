import { z } from 'zod';

export const activitySchema = z.object({
  id: z.uuid(),
  disciplineId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  dueAt: z.iso.datetime().nullable(),
});

export type Activity = z.infer<typeof activitySchema>;
export type CreateActivityInput = { title: string; description?: string; dueAt?: string };
