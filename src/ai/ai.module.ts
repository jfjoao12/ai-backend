import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { embeddings, POSTGRES_POOL_CONFIG } from './agent/vector-store';
import { VectorStoreService } from './vector-store.service';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';

@Module({
  providers: [
    {
      // Pool Provider
      provide: Pool,
      useFactory: () => new Pool(POSTGRES_POOL_CONFIG),
    },
    {
      // Embeddings Provider
      provide: GoogleGenerativeAIEmbeddings,
      useValue: embeddings,
    },
    VectorStoreService,
    IngestionService,
    AiService,
  ],
  controllers: [AiController, IngestionController],
})
export class AIModule {}
