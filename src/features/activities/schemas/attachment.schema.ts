import { z } from 'zod';

export const attachmentSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  uploadedAt: z.iso.datetime(),
});

export const attachmentUrlSchema = z.object({ url: z.url({ protocol: /^https$/ }) });

export type Attachment = z.infer<typeof attachmentSchema>;
