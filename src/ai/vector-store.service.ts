import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { PGVectorStore } from '@langchain/pgvector';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { RetrievalResult, VECTOR_CONFIG, VectorDocument } from './definitions';

@Injectable()
export class VectorStoreService implements OnModuleInit, OnModuleDestroy {
  private store: PGVectorStore | undefined;

  constructor(
    private readonly pool: Pool,
    private readonly embeddings: GoogleGenerativeAIEmbeddings,
  ) {}

  async onModuleInit(): Promise<void> {
    this.store = await PGVectorStore.initialize(this.embeddings, {
      pool: this.pool,
      dimensions: 3072,
      ...VECTOR_CONFIG,
    });
  }

  private getStore(): PGVectorStore {
    if (!this.store) {
      throw new Error('Vector store has not been initialized!');
    }

    return this.store;
  }

  similaritySearch(query: string) {
    return this.getStore().similaritySearch(query);
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    await this.getStore().addDocuments(documents);
  }

  async retrieveDocuments(query: string): Promise<RetrievalResult> {
    const retrievedDocs = await this.similaritySearch(query);
    const serialized = retrievedDocs
      .map(
        (document) =>
          `Source ${document.metadata.source}\n: ${document.pageContent}`,
      )
      .join('\n');

    return [serialized, retrievedDocs];
  }

  async clear(): Promise<void> {
    await this.pool.query('TRUNCATE TABLE "documents"');
  }

  async onModuleDestroy(): Promise<void> {
    await this.store?.end();
  }
}
