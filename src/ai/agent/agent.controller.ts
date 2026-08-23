import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { HumanMessage } from '@langchain/core/messages';
import { AgentService } from './agent.service';
import { ChatRequestDto } from '../dto/chat-request.dto';

@Controller('ai')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() body: ChatRequestDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const threadId = body.threadId ?? randomUUID();

    response.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Thread-Id': threadId,
    });
    // Sends to client immediately before the body
    response.flushHeaders();

    // Unwraps the promise with Awaited<>
    let stream: Awaited<ReturnType<AgentService['runAgent']>>;

    try {
      stream = await this.agentService.runAgent({
        input: { messages: [new HumanMessage(body.message)] },
        config: {
          configurable: { thread_id: threadId },
        },
      });
    } catch (error) {
      this.writeSseError(response, `Failed to start agent run ${error}`);
      response.end();
      return;
    }

    // If the client disconnects mid-stream, stop pulling from the graph.
    const abort = () => {
      void stream.cancel?.().catch(() => undefined);
    };
    request.on('close', abort);

    try {
      for await (const chunk of stream) {
        // Respect backpressure instead of buffering everything in memory.
        if (!response.write(chunk)) {
          await new Promise<void>((resolve) => response.once('drain', resolve));
        }
      }
    } catch (error) {
      this.writeSseError(response, `Stream interrupted: ${error}`);
    } finally {
      request.off('close', abort);
      response.end();
    }
  }

  private writeSseError(response: Response, message: string): void {
    response.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  }
}
