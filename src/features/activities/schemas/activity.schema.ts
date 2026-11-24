import { z } from 'zod';

export const activitySchema = z.object({
  id: z.uuid(),
  disciplineId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  dueAt: z.iso.datetime().nullable(),
});

export type Activity = z.infer<typeof activitySchema>;
export const activityFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'errors:validation.required')
    .max(160, 'errors:validation.tooLong'),
  description: z.string().trim().max(2000, 'errors:validation.tooLong'),
  dueAt: z.string(),
});

export const newActivityFormSchema = activityFormSchema.refine(
  ({ dueAt }) => dueAt === '' || new Date(dueAt).getTime() > Date.now(),
  { path: ['dueAt'], message: 'activities:pastDate' },
);

export type ActivityForm = z.infer<typeof activityFormSchema>;
export type ActivityInput = { title: string; description: string | null; dueAt: string | null };
export type CreateActivityInput = ActivityInput & { disciplineId: string };
export type UpdateActivityInput = ActivityInput & { id: string };
