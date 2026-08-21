import { PGVectorStore } from "@langchain/pgvector";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";
import { POSTGRES_POOL_CONFIG, embeddings, VECTOR_CONFIG, VectorDocument } from "./agent/vector-store";

@Injectable()
export class VectorStoreService
    implements OnModuleInit, OnModuleDestroy {
    private readonly pool = new Pool(POSTGRES_POOL_CONFIG);
    private store!: PGVectorStore;

    async onModuleInit(): Promise<void> {
        this.store = await PGVectorStore.initialize(embeddings, {
            pool: this.pool,
            dimensions: 3072,
            ...VECTOR_CONFIG,
        });
    }

    similaritySearch(query: string) {
        return this.store.similaritySearch(query);
    }

    async addDocuments(documents: VectorDocument[]): Promise<void> {
        await this.store.addDocuments(documents);
    }

    async clear(): Promise<void> {
        await this.pool.query('TRUNCATE TABLE "documents"');
    }

    async onModuleDestroy(): Promise<void> {
        await this.store.end();
    }
}