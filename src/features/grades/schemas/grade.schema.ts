import { z } from 'zod';

const valueSchema = z.number().min(0).max(10);

export const gradeSchema = z.object({
  activityId: z.uuid(),
  studentId: z.uuid(),
  value: valueSchema,
});

export const gradeSummarySchema = z.object({
  grades: z.array(
    z.object({ activityId: z.uuid(), value: valueSchema, updatedAt: z.iso.datetime() }),
  ),
  average: valueSchema.nullable(),
  status: z.enum(['NO_GRADES', 'APPROVED', 'RECOVERY', 'FAILED']),
});

export const studentGradesSchema = gradeSummarySchema.extend({
  student: z.object({ id: z.uuid(), name: z.string(), email: z.string() }),
});

export type Grade = z.infer<typeof gradeSchema>;
export type GradeSummary = z.infer<typeof gradeSummarySchema>;
export type StudentGrades = z.infer<typeof studentGradesSchema>;
export type SaveGradeInput = { activityId: string; studentId: string; value: number };
