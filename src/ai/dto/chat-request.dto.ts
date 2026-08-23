import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  declare message: string;

  /**
   * Conversation/session id used by the LangGraph MemorySaver checkpointer
   * to resume a thread. If omitted, the controller generates one and
   * returns it via the `X-Thread-Id` response header.
   */
  @IsOptional()
  @IsString()
  declare threadId?: string;
}
