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
const requiredText = (max: number) =>
  z.string().trim().min(1, 'errors:validation.required').max(max, 'errors:validation.tooLong');

export const disciplineFormSchema = z.object({
  code: requiredText(20),
  name: requiredText(120),
  semester: z.string().regex(/^\d{4}\.[12]$/, 'errors:validation.semester'),
  description: z.string().trim().max(2000, 'errors:validation.tooLong'),
});

export type DisciplineForm = z.infer<typeof disciplineFormSchema>;
export type CreateDisciplineInput = {
  code: string;
  name: string;
  semester: string;
  description?: string;
};
export type UpdateDisciplineInput = { id: string; name: string; description: string | null };
