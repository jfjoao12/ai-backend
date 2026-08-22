import * as z from 'zod';

export const toolProgressEventSchema = z
  .object({
    type: z.enum(['toolMessageUpdate']).optional(),
    message: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .loose();

export const customEventSchema = toolProgressEventSchema;
