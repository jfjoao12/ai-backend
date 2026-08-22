import type { Document, DocumentInterface } from '@langchain/core/documents';
import type { EmbeddingsInterface } from '@langchain/core/embeddings';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { PGVectorStore, type PGVectorStoreArgs } from '@langchain/pgvector';
import { Pool, type PoolConfig } from 'pg';
import { requireEnv } from '../../env';

type VectorStoreSchemaConfig = Pick<PGVectorStoreArgs, 'tableName' | 'columns'>;

export const EMBEDDING_CONFIG = {
  model: 'gemini-embedding-001',
  apiKey: requireEnv('GOOGLE_API_KEY'),
};

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

export const embeddings = new GoogleGenerativeAIEmbeddings(EMBEDDING_CONFIG);

export function getEmbeddings(): GoogleGenerativeAIEmbeddings {
  return embeddings;
}

export type VectorDocument = Document<Record<string, unknown>>;

export interface VectorRepository {
  similaritySearch(query: string): Promise<VectorDocument[]>;
  addDocuments(documents: VectorDocument[]): Promise<void>;
}

export function createVectorRepository(
  embeddings: EmbeddingsInterface,
): VectorRepository {
  const pool = new Pool(POSTGRES_POOL_CONFIG);
  const vectorStore = new PGVectorStore(embeddings, {
    pool,
    ...VECTOR_CONFIG,
  });

  return {
    async similaritySearch(query) {
      return vectorStore.similaritySearch(query);
    },
    async addDocuments(documents) {
      await vectorStore.addDocuments(documents);
    },
  };
}

export const vectorRepository = createVectorRepository(embeddings);

export type RetrievalResult = [string, DocumentInterface[]];

export async function retrieveDocuments(
  query: string,
): Promise<RetrievalResult> {
  const retrievedDocs = await vectorRepository.similaritySearch(query);
  const serialized = retrievedDocs
    .map(
      (document) =>
        `Source ${document.metadata.source}\n: ${document.pageContent}`,
    )
    .join('\n');

  return [serialized, retrievedDocs];
}
