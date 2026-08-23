import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.OK)
  async ingest() {
    try {
      const ingestDocuments = await this.ingestionService.ingestDocuments();
      return ingestDocuments;
    } catch (error) {
      console.log(`Error in ingestion: ${error}`);
    }
  }
}
