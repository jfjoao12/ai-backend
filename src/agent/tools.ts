import { tool, type ToolRuntime } from '@langchain/core/tools';
import * as z from 'zod';

import { retrieveDocuments } from './vector-store';

export const currentTimeSchema = z.object({});

export function createCurrentTimeTool() {
  return tool(
    async (_input, runtime: ToolRuntime) => {
      runtime.writer?.({
        type: 'toolMessageUpdate',
        message: 'Fetching time',
        toolCallId: runtime.toolCallId,
      });

      console.log('TOOL CALL ID?: ', runtime.toolCallId);

      return new Date().toLocaleString();
    },
    {
      name: 'getCurrentTime',
      description: 'Returns the current server time',
      schema: currentTimeSchema,
    },
  );
}

export const redirectPageSchema = z.object({
  path: z.string().describe('Absolute path like /projects or /about'),
});

export function createRedirectPageTool() {
  return tool(
    async ({ path }) => ({
      type: 'redirect',
      path,
    }),
    {
      name: 'redirectPage',
      description: 'Request navigation to a page',
      schema: redirectPageSchema,
    },
  );
}

export const retrieveSchema = z.object({ query: z.string() });

export function createRetrieveTool() {
  return tool(
    async ({ query }, runtime: ToolRuntime) => {
      runtime.writer?.({
        type: 'toolMessageUpdate',
        message: 'Fetching documents',
        toolCallId: runtime.toolCallId,
      });

      console.log('TOOL CALL ID?: ', runtime.toolCallId);

      return retrieveDocuments(query);
    },
    {
      name: 'retrieve',
      description: 'Retrieve information related to Joao',
      schema: retrieveSchema,
      responseFormat: 'content_and_artifact',
    },
  );
}

export async function getTools() {
  return [
    createRedirectPageTool(),
    createRetrieveTool(),
    createCurrentTimeTool(),
  ];
}
