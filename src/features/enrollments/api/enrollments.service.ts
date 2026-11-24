import { z } from 'zod';
import { type Student, studentSchema } from '@/features/disciplines/schemas/discipline.schema';
import { type ApiService, apiService } from '@/shared/api/api.service';

type EnrollmentInput = { disciplineId: string; studentId: string };

export class EnrollmentsService {
  private readonly api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  findCandidates({
    disciplineId,
    search,
  }: {
    disciplineId: string;
    search: string;
  }): Promise<Student[]> {
    return this.api.get({
      url: `${this.getUrl(disciplineId)}/candidates`,
      schema: z.array(studentSchema),
      params: { search },
    });
  }

  enroll({ disciplineId, studentId }: EnrollmentInput): Promise<Student> {
    return this.api.post({
      url: `${this.getUrl(disciplineId)}/${studentId}`,
      schema: studentSchema,
      body: {},
    });
  }

  remove({ disciplineId, studentId }: EnrollmentInput): Promise<void> {
    return this.api.delete({ url: `${this.getUrl(disciplineId)}/${studentId}` });
  }

  private getUrl(disciplineId: string): string {
    return `/disciplines/${disciplineId}/students`;
  }
}

export const enrollmentsService = new EnrollmentsService(apiService);
