import { Injectable } from '@nestjs/common';
import { VectorStoreService } from '../vector-store.service';
import { DirectoryLoader } from '@langchain/classic/document_loaders/fs/directory';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const INGESTION_CONFIG = {
  documentsDirectory: './src/ai/agent/knowledge/documents',
  chunkSize: 512,
  chunkOverlap: 50,
} as const;

@Injectable()
export class IngestionService {
  constructor(private readonly vectorStoreService: VectorStoreService) { }

  async ingestDocuments() {
    console.log('Loading Documents');

    const loader = new DirectoryLoader(INGESTION_CONFIG.documentsDirectory, {
      '.txt': (path) => new TextLoader(path),
      //'.pdf': (path) => new PDFLoader(path, { splitPages: false }),
    });

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: INGESTION_CONFIG.chunkSize,
      chunkOverlap: INGESTION_CONFIG.chunkOverlap,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    console.log(
      `Split into ${splitDocs.length} chunks. Embedding and storing...`,
    );

    await this.vectorStoreService.clear();
    await this.vectorStoreService.addDocuments(splitDocs);

    return {
      filesLoaded: docs.length,
      chunksStored: splitDocs.length,
    };
  }
}
