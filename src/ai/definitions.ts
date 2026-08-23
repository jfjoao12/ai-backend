import * as z from 'zod';
import { StreamMode, LangGraphRunnableConfig } from '@langchain/langgraph';
import { BaseMessage } from 'langchain';
import type {
  Document as LangchainDocument,
  DocumentInterface,
} from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { PGVectorStoreArgs } from '@langchain/pgvector';
import { requireEnv } from '../env';

// MARK: Streaming
export const toolProgressEventSchema = z
  .object({
    type: z.enum(['toolMessageUpdate']).optional(),
    message: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .loose();

export type CustomEvent = z.infer<typeof toolProgressEventSchema>;

export type CustomEventWithToolId = CustomEvent & {
  toolCallId?: string;
  tool_call_id?: string;
};
export type ModelProvider = 'google' | 'ollama';

// MARK: Agent
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
};

export type AgentInput = Record<string, unknown> & {
  messages: BaseMessage[];
};

export type RunAgentOptions = {
  input: AgentInput;
  config: LangGraphRunnableConfig;
};

// MARK: Vector
// Vector Store
export type VectorDocument = LangchainDocument<Record<string, unknown>>;
export type VectorStoreSchemaConfig = Pick<
  PGVectorStoreArgs,
  'tableName' | 'columns'
>;

export type RetrievalResult = [string, DocumentInterface[]];

export interface VectorRepository {
  similaritySearch(query: string): Promise<VectorDocument[]>;
  addDocuments(documents: VectorDocument[]): Promise<void>;
}

export const EMBEDDING_CONFIG = {
  model: 'gemini-embedding-001',
  apiKey: requireEnv('GOOGLE_API_KEY'),
};

export const embeddings = new GoogleGenerativeAIEmbeddings(EMBEDDING_CONFIG);

export const POSTGRES_POOL_CONFIG = {
  host: '127.0.0.1',
  port: 5532,
  user: requireEnv('VECTORDB_USER'),
  password: requireEnv('VECTORDB_PASSWORD'),
  database: requireEnv('VECTORDB_NAME'),
};

export const VECTOR_CONFIG = {
  tableName: 'documents',
  columns: {
    vectorColumnName: 'embedding',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
} as const satisfies VectorStoreSchemaConfig;
