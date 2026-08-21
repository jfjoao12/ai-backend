import { DirectoryLoader } from '@langchain/classic/document_loaders/fs/directory';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

import prisma from '../lib/prisma-client';
import { vectorRepository } from './vector-store';

export const INGESTION_CONFIG = {
  documentsDirectory: './src/agent/knowledge/documents',
  chunkSize: 512,
  chunkOverlap: 50,
} as const;

export async function clearDocuments(): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE "documents"`;
}

export async function ingestDocuments(): Promise<void> {
  console.log('Loading Documents');

  const loader = new DirectoryLoader(INGESTION_CONFIG.documentsDirectory, {
    '.txt': (path) => new TextLoader(path),
    '.pdf': (path) => new PDFLoader(path, { splitPages: false }),
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

  await clearDocuments();
  await vectorRepository.addDocuments(splitDocs);

  console.log('Ingestion Complete!');
}
