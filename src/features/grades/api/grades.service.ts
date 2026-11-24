import { z } from 'zod';
import {
  type Grade,
  gradeSchema,
  type GradeSummary,
  gradeSummarySchema,
  type SaveGradeInput,
  type StudentGrades,
  studentGradesSchema,
} from '@/features/grades/schemas/grade.schema';
import { apiClient } from '@/shared/api/client';

export const gradesService = {
  async list(disciplineId: string): Promise<StudentGrades[]> {
    const { data } = await apiClient.get<unknown>(`/disciplines/${disciplineId}/grades`);
    return z.array(studentGradesSchema).parse(data);
  },

  async mine(disciplineId: string): Promise<GradeSummary> {
    const { data } = await apiClient.get<unknown>(`/disciplines/${disciplineId}/grades/me`);
    return gradeSummarySchema.parse(data);
  },

  async save({ activityId, studentId, value }: SaveGradeInput): Promise<Grade> {
    const { data } = await apiClient.put<unknown>(`/activities/${activityId}/grades/${studentId}`, {
      value,
    });
    return gradeSchema.parse(data);
  },
};
