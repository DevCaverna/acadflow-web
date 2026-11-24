import { z } from 'zod';
import {
  type CreateDisciplineInput,
  type Discipline,
  type DisciplineListOptions,
  disciplineSchema,
  type Student,
  studentSchema,
  type UpdateDisciplineInput,
} from '@/features/disciplines/schemas/discipline.schema';
import { type ApiService, apiService } from '@/shared/api/api.service';
import { type Listing, listingSchema, toPaginationParams } from '@/shared/api/listing.schema';

export class DisciplinesService {
  private readonly api: ApiService;
  private readonly baseUrl = '/disciplines';

  constructor(api: ApiService) {
    this.api = api;
  }

  list(options: DisciplineListOptions = {}): Promise<Listing<Discipline>> {
    return this.api.get({
      url: this.baseUrl,
      schema: listingSchema(disciplineSchema),
      params: toPaginationParams(options),
    });
  }

  get({ id }: { id: string }): Promise<Discipline> {
    return this.api.get({ url: `${this.baseUrl}/${id}`, schema: disciplineSchema });
  }

  listStudents({ id }: { id: string }): Promise<Student[]> {
    return this.api.get({
      url: `${this.baseUrl}/${id}/students`,
      schema: z.array(studentSchema),
    });
  }

  create(body: CreateDisciplineInput): Promise<Discipline> {
    return this.api.post({ url: this.baseUrl, schema: disciplineSchema, body });
  }

  update({ id, ...body }: UpdateDisciplineInput): Promise<Discipline> {
    return this.api.patch({ url: `${this.baseUrl}/${id}`, schema: disciplineSchema, body });
  }

  remove({ id }: { id: string }): Promise<void> {
    return this.api.delete({ url: `${this.baseUrl}/${id}` });
  }
}

export const disciplinesService = new DisciplinesService(apiService);
