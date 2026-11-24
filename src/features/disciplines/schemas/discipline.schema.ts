import { z } from 'zod';
import type { PaginationOptions } from '@/shared/api/listing.schema';

export const disciplineSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  semester: z.string(),
  professor: z.object({ id: z.uuid(), name: z.string() }),
});

export const studentSchema = z.object({ id: z.uuid(), name: z.string(), email: z.string() });

export type Discipline = z.infer<typeof disciplineSchema>;
export type Student = z.infer<typeof studentSchema>;
export type DisciplineFilter = { search?: string; semester?: string };
export type DisciplineListOptions = PaginationOptions<
  DisciplineFilter,
  'code' | 'name' | 'semester'
>;
export type CreateDisciplineInput = {
  code: string;
  name: string;
  semester: string;
  description?: string;
};
