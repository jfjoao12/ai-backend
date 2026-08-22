import * as z from 'zod';
import { toolProgressEventSchema } from './agent/streaming';
import { StreamMode, LangGraphRunnableConfig } from '@langchain/langgraph';
import { BaseMessage } from 'langchain';

// MARK: Streaming Types
export type CustomEvent = z.infer<typeof toolProgressEventSchema>;

export type CustomEventWithToolId = CustomEvent & {
    toolCallId?: string;
    tool_call_id?: string;
}; export type ModelProvider = 'google' | 'ollama';

// MARK: Model Types
export const MODEL_CONFIG = {
    google: {
        model: 'gemini-3-flash-preview',
        temperature: 0,
        maxRetries: 2,
        streaming: true,
    },
    ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'qwen3:30b-a3b',
        temperature: 0,
        numCtx: 16448,
    },
} as const;

export const AGENT_CONFIG = {
    provider: 'google' as const satisfies ModelProvider,
    encoding: 'text/event-stream' as const,
    streamMode: [
        'custom',
        'values',
        'updates',
        'messages',
    ] satisfies StreamMode[],
    recursionLimit: 10,
}

export type AgentInput = Record<string, unknown> & {
    messages: BaseMessage[];
}

export type RunAgentOptions = {
    input: AgentInput;
    config: LangGraphRunnableConfig;
}
