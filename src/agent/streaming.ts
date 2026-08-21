import * as z from 'zod';

export const toolProgressEventSchema = z
  .object({
    type: z.enum(['toolMessageUpdate']).optional(),
    message: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const customEventSchema = toolProgressEventSchema;

export type CustomEvent = z.infer<typeof toolProgressEventSchema>;

export type CustomEventWithToolId = CustomEvent & {
  toolCallId?: string;
  tool_call_id?: string;
};
