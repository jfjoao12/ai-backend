import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector-store/vector-store.service';

@Module({
  providers: [VectorStoreService]
})
export class AiModule {}
