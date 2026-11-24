import { z } from 'zod';
import {
  type Attachment,
  attachmentSchema,
  attachmentUrlSchema,
} from '@/features/activities/schemas/attachment.schema';
import { type ApiService, apiService } from '@/shared/api/api.service';

export class AttachmentsService {
  private readonly api: ApiService;
  private readonly baseUrl = '/attachments';

  constructor(api: ApiService) {
    this.api = api;
  }

  list({ activityId }: { activityId: string }): Promise<Attachment[]> {
    return this.api.get({
      url: `/activities/${activityId}/attachments`,
      schema: z.array(attachmentSchema),
    });
  }

  upload({ activityId, file }: { activityId: string; file: File }): Promise<Attachment> {
    return this.api.upload({
      url: `/activities/${activityId}/attachments`,
      schema: attachmentSchema,
      file,
    });
  }

  async getUrl({ id }: { id: string }): Promise<string> {
    const { url } = await this.api.get({
      url: `${this.baseUrl}/${id}/url`,
      schema: attachmentUrlSchema,
    });
    return url;
  }

  remove({ id }: { id: string }): Promise<void> {
    return this.api.delete({ url: `${this.baseUrl}/${id}` });
  }
}

export const attachmentsService = new AttachmentsService(apiService);
