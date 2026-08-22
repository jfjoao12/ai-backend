import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { embeddings, POSTGRES_POOL_CONFIG } from './agent/vector-store';
import { VectorStoreService } from './vector-store.service';
import { AgentService } from './agent.service';
import { AiController } from './ai.controller';
import { IngestionService } from './ingestion/ingestion.service';
import { IngestionController } from './ingestion/ingestion.controller';

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
    AgentService,
  ],
  controllers: [AiController, IngestionController],
})
export class AIModule { }
