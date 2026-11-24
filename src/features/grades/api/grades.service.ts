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
import { type ApiService, apiService } from '@/shared/api/api.service';

export class GradesService {
  private readonly api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  list({ disciplineId }: { disciplineId: string }): Promise<StudentGrades[]> {
    return this.api.get({
      url: `/disciplines/${disciplineId}/grades`,
      schema: z.array(studentGradesSchema),
    });
  }

  mine({ disciplineId }: { disciplineId: string }): Promise<GradeSummary> {
    return this.api.get({
      url: `/disciplines/${disciplineId}/grades/me`,
      schema: gradeSummarySchema,
    });
  }

  save({ activityId, studentId, value }: SaveGradeInput): Promise<Grade> {
    return this.api.put({
      url: `/activities/${activityId}/grades/${studentId}`,
      schema: gradeSchema,
      body: { value },
    });
  }

  remove({
    activityId,
    studentId,
  }: Pick<SaveGradeInput, 'activityId' | 'studentId'>): Promise<void> {
    return this.api.delete({ url: `/activities/${activityId}/grades/${studentId}` });
  }
}

export const gradesService = new GradesService(apiService);
