import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { VectorStoreService } from './vector-store.service';
import { AgentService } from './agent/agent.service';
import { AgentController } from './agent/agent.controller';
import { IngestionService } from './ingestion/ingestion.service';
import { IngestionController } from './ingestion/ingestion.controller';
import { POSTGRES_POOL_CONFIG, embeddings } from './definitions';
import { AgentToolsService } from './agent/agent-tools.service';

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
    AgentToolsService,
    AgentService,
  ],
  controllers: [IngestionController, AgentController],
})
export class AIModule {}
