import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIModule } from './ai/ai.module';
import { IngestionService } from './ai/ingestion.service';
import { IngestionController } from './ai/ingestion.controller';
import { VectorStoreService } from './ai/vector-store.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // type of our database
      host: 'localhost', // database host
      port: 5532, // database host
      username: process.env.VECTORDB_USER, // username
      password: process.env.VECTORDB_PASSWORD, // user password
      database: process.env.VECTORDB_NAME, // name of our database,
      autoLoadEntities: true, // models will be loaded automatically
      synchronize: true, // your entities will be synced with the database(recommended: disable in prod)
    }),
    AIModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
