import { Injectable } from '@nestjs/common';
import { VectorStoreService } from '../vector-store.service';
import { tool, type ToolRuntime } from '@langchain/core/tools';
import * as z from 'zod';

export const redirectPageSchema = z.object({
  path: z.string().describe('Absolute path like /projects or /about'),
});

export const currentTimeSchema = z.object({});

export const retrieveSchema = z.object({ query: z.string() });

@Injectable()
export class AgentToolsService {
  constructor(private readonly vectorStoreService: VectorStoreService) {}

  createCurrentTimeTool() {
    return tool(
      (_input, runtime: ToolRuntime) => {
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

  createRedirectPageTool() {
    return tool(
      ({ path }) => ({
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

  createRetrieveTool() {
    return tool(
      ({ query }, runtime: ToolRuntime) => {
        runtime.writer?.({
          type: 'toolMessageUpdate',
          message: 'Fetching documents',
          toolCallId: runtime.toolCallId,
        });

        console.log('TOOL CALL ID?: ', runtime.toolCallId);

        return this.vectorStoreService.retrieveDocuments(query);
      },
      {
        name: 'retrieve',
        description: 'Retrieve information related to Joao',
        schema: retrieveSchema,
        responseFormat: 'content_and_artifact',
      },
    );
  }

  getTools() {
    return [
      this.createRedirectPageTool(),
      this.createRetrieveTool(),
      this.createCurrentTimeTool(),
    ];
  }
}
