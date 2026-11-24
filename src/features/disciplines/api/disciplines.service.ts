import { z } from 'zod';
import {
  type CreateDisciplineInput,
  type Discipline,
  type DisciplineListOptions,
  disciplineSchema,
  type Student,
  studentSchema,
} from '@/features/disciplines/schemas/discipline.schema';
import { apiClient } from '@/shared/api/client';
import { type Listing, listingSchema, toPaginationParams } from '@/shared/api/listing.schema';

export const disciplinesService = {
  async list(options: DisciplineListOptions = {}): Promise<Listing<Discipline>> {
    const { data } = await apiClient.get<unknown>('/disciplines', {
      params: toPaginationParams(options),
    });
    return listingSchema(disciplineSchema).parse(data);
  },

  async get(id: string): Promise<Discipline> {
    const { data } = await apiClient.get<unknown>(`/disciplines/${id}`);
    return disciplineSchema.parse(data);
  },

  async listStudents(id: string): Promise<Student[]> {
    const { data } = await apiClient.get<unknown>(`/disciplines/${id}/students`);
    return z.array(studentSchema).parse(data);
  },

  async create(input: CreateDisciplineInput): Promise<Discipline> {
    const { data } = await apiClient.post<unknown>('/disciplines', input);
    return disciplineSchema.parse(data);
  },
};
