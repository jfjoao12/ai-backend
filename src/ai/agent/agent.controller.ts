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
import { ChatRequestDto, ChatStreamEventDto } from '../dto/chat-request.dto';
import { AIMessage, AIMessageChunk, ToolMessage } from '@langchain/core/messages';
import { toolProgressEventSchema } from '../definitions';

@Controller('ai')
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() body: ChatRequestDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const threadId = body.threadId ?? randomUUID();

    const send = async (event: ChatStreamEventDto): Promise<void> => {
      const frame = `data: ${JSON.stringify(event)}\n\n`

      if (!response.write(frame)) {
        await new Promise<void>((resolve) => {
          response.once('drain', resolve)
        })
      }
    }

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
      for await (const [mode, data] of stream) {
        // Respect backpressure instead of buffering everything in memory.
        // if (!response.write([mode, data])) {
        //   await new Promise<void>((resolve) => response.once('drain', resolve));
        // }
        // if (mode === "updates") {
        //   console.log("Mode: ", mode)
        //   console.dir(data, { depth: 3 });
        // }
        if (mode === 'messages') {
          const [message] = data

          if (!AIMessageChunk.isInstance(message)) continue

          for (const block of message.contentBlocks) {
            if (block.type === "text") {
              await send({
                id: message.id!, // LangGraph normally assigns this.
                type: 'ai_message',
                message: block.text,
                status: 'streaming',
              });
            }

            if (block.type === 'reasoning') {
              await send({
                id: message.id!, // LangGraph normally assigns this.
                type: 'reasoning_message',
                message: block.reasoning,
                status: 'streaming',
              });
            }
          }
        }

        if (mode === 'custom') {
          const result = toolProgressEventSchema.safeParse(data);

          if (!result.success) continue;

          const progress = result.data;

          if (
            progress.type !== 'toolMessageUpdate' ||
            typeof progress.toolCallId !== 'string' ||
            typeof progress.message !== 'string'
          ) {
            continue;
          }

          await send({
            id: progress.toolCallId,
            type: 'tool_call_message',
            message: progress.message,
            status: 'streaming',
          });
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
